import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { sendEmail } from "../utils/email";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 900000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { error: "Too many login attempts, please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

// In-memory store for pending 2FA OTP tokens
interface PendingOTP {
  userId: number;
  username: string;
  code: string;
  expiresAt: number;
}

const pendingOTPs = new Map<string, PendingOTP>();

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of pendingOTPs.entries()) {
    if (now > val.expiresAt) pendingOTPs.delete(key);
  }
}, 60 * 1000);

// Helper: Verify TOTP code using RFC 6238 HMAC-SHA1
export function verifyTOTP(secret: string, token: string): boolean {
  try {
    const period = 30;
    const now = Math.floor(Date.now() / 1000);
    const cleanToken = token.trim().replace(/\s/g, "");
    if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) return false;

    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleanSecret = secret.toUpperCase().replace(/=/g, "").replace(/\s/g, "");

    let bits = "";
    for (let j = 0; j < cleanSecret.length; j++) {
      const val = base32chars.indexOf(cleanSecret.charAt(j));
      if (val >= 0) bits += val.toString(2).padStart(5, "0");
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] = parseInt(bits.substring(j * 8, j * 8 + 8), 2);
    }

    // Check current and adjacent time windows (±1 step for clock drift)
    for (let i = -1; i <= 1; i++) {
      const timeStep = Math.floor((now + i * period) / period);
      const buffer = Buffer.alloc(8);
      buffer.writeBigInt64BE(BigInt(timeStep), 0);

      const hmac = crypto.createHmac("sha1", Buffer.from(bytes));
      hmac.update(buffer);
      const hmacResult = hmac.digest();
      const offset = hmacResult[hmacResult.length - 1] & 0xf;
      const code = ((hmacResult[offset] & 0x7f) << 24) |
                   ((hmacResult[offset + 1] & 0xff) << 16) |
                   ((hmacResult[offset + 2] & 0xff) << 8) |
                   (hmacResult[offset + 3] & 0xff);
      const otp = (code % 1000000).toString().padStart(6, "0");
      if (otp === cleanToken) return true;
    }
  } catch (e) {
    console.error("TOTP verification error:", e);
  }
  return false;
}

// Helper: Sign a JWT for a user
function signJWT(userId: number, username: string): string {
  return jwt.sign(
    { id: userId, username },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
  );
}

// POST /api/auth/login
router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const cleanUsername = username.trim().toLowerCase();
    const envUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
    const envEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD;

    // Check if the submitted username matches the env-configured admin
    const isEnvUsernameMatch =
      cleanUsername === envUsername ||
      cleanUsername === envEmail ||
      (envEmail.length > 0 && cleanUsername === envEmail.split("@")[0]);

    // Search DB: find user matching submitted username (case-insensitive)
    let user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: { equals: username.trim(), mode: "insensitive" } },
          { username: { equals: cleanUsername, mode: "insensitive" } },
        ],
      },
    });

    let isPasswordValid = false;

    if (user) {
      // Primary check: bcrypt compare against stored hash
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    }

    // Fallback: Allow login via .env credentials if username matches env admin
    // This is a bootstrap mechanism — once logged in, password is synced to DB
    if (!isPasswordValid && envPassword && isEnvUsernameMatch && password === envPassword) {
      isPasswordValid = true;
      const newHash = await bcrypt.hash(envPassword, 10);
      if (user) {
        // Update existing user's password hash
        user = await prisma.adminUser.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
      } else {
        // Create admin user for first-time setup
        user = await prisma.adminUser.create({
          data: {
            username: process.env.ADMIN_USERNAME || "np",
            passwordHash: newHash,
          },
        });
      }
    }

    // Hard reject: wrong credentials
    if (!user || !isPasswordValid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    // 2FA check
    const is2FAEnabled = process.env.ENABLE_2FA === "true";

    if (is2FAEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const tempToken = crypto.randomBytes(32).toString("hex");

      pendingOTPs.set(tempToken, {
        userId: user.id,
        username: user.username,
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
      });

      const adminEmail = process.env.ADMIN_EMAIL || "admin@nishanth.qzz.io";
      const maskedEmail = adminEmail.replace(/^(.{2})([^@]*)(@.+)$/, (_, a, b, c) => a + "*".repeat(b.length) + c);

      try {
        await sendEmail({
          to: adminEmail,
          subject: "🔐 Admin Login — Verification Code",
          html: `
            <div style="font-family:'Segoe UI',sans-serif;background:#09090b;padding:32px;color:#fff;border-radius:16px;max-width:480px;margin:0 auto;border:1px solid #27272a;">
              <div style="text-align:center;margin-bottom:24px;">
                <h2 style="color:#FF6B2B;margin:0;font-size:24px;font-weight:700;">NP Admin CMS</h2>
                <p style="color:#71717a;font-size:13px;margin-top:4px;">2-Step Verification Code</p>
              </div>
              <p style="color:#a1a1aa;font-size:14px;line-height:1.5;margin-bottom:20px;">
                Login attempt for <strong>${user.username}</strong>. Your code:
              </p>
              <div style="background:#18181b;border:1px solid #FF6B2B;font-size:36px;font-weight:800;letter-spacing:10px;color:#FF6B2B;padding:20px;text-align:center;border-radius:12px;margin:24px 0;">
                ${otp}
              </div>
              <p style="color:#71717a;font-size:12px;">Expires in <strong>10 minutes</strong>. If you did not request this, please ignore.</p>
            </div>
          `,
        });
      } catch (emailErr: any) {
        console.warn("2FA email failed:", emailErr.message);
        console.info(`[2FA BACKUP] Token: ${tempToken} | OTP: ${otp}`);
      }

      res.json({
        requires2FA: true,
        tempToken,
        destinationEmail: maskedEmail,
        message: `Verification code sent to ${maskedEmail}`,
      });
      return;
    }

    // 2FA disabled — issue JWT directly
    const token = signJWT(user.id, user.username);
    res.json({ success: true, token, username: user.username });
  } catch (err: any) {
    console.error("Login error:", err);
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// POST /api/auth/verify-2fa
router.post("/verify-2fa", authLimiter, async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = z.object({
      tempToken: z.string().min(1),
      code: z.string().min(6).max(6),
    }).parse(req.body);

    const pending = pendingOTPs.get(tempToken);
    let isValid = false;
    let resolvedUserId: number | null = null;

    // 1. Try Email OTP verification first (requires valid tempToken)
    if (pending) {
      if (Date.now() > pending.expiresAt) {
        pendingOTPs.delete(tempToken);
        res.status(400).json({ error: "Verification code has expired. Please sign in again." });
        return;
      }
      if (pending.code === code.trim()) {
        isValid = true;
        resolvedUserId = pending.userId;
      }
    }

    // 2. Try TOTP verification (Authenticator App) — works even if Email OTP pending exists
    if (!isValid) {
      let totpSecret = process.env.TOTP_SECRET || null;
      if (!totpSecret) {
        const setting = await prisma.siteSetting.findUnique({ where: { settingKey: "totp_secret" } });
        totpSecret = setting?.settingValue || null;
      }

      if (totpSecret && verifyTOTP(totpSecret, code)) {
        isValid = true;
        // For TOTP: resolve user from pending OTP or fall back to first admin
        resolvedUserId = pending?.userId ?? null;
      }
    }

    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired verification code" });
      return;
    }

    // Clean up used OTP
    pendingOTPs.delete(tempToken);

    // Resolve the user account
    let user = resolvedUserId
      ? await prisma.adminUser.findUnique({ where: { id: resolvedUserId } })
      : null;

    if (!user) {
      // Last resort: find the first admin
      user = await prisma.adminUser.findFirst();
    }

    if (!user) {
      res.status(500).json({ error: "Admin user account not found" });
      return;
    }

    const token = signJWT(user.id, user.username);
    res.json({ success: true, token, username: user.username });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "A valid 6-digit code is required" });
      return;
    }
    console.error("Verify-2FA error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// POST /api/auth/resend-2fa
router.post("/resend-2fa", authLimiter, async (req: Request, res: Response) => {
  try {
    const { tempToken } = z.object({ tempToken: z.string().min(1) }).parse(req.body);

    const pending = pendingOTPs.get(tempToken);
    if (!pending || Date.now() > pending.expiresAt) {
      res.status(400).json({ error: "Session expired. Please sign in again." });
      return;
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.code = newCode;
    pending.expiresAt = Date.now() + 10 * 60 * 1000;
    pendingOTPs.set(tempToken, pending);

    const adminEmail = process.env.ADMIN_EMAIL || "admin@nishanth.qzz.io";
    await sendEmail({
      to: adminEmail,
      subject: "🔐 Admin Login — New Verification Code",
      html: `
        <div style="font-family:'Segoe UI',sans-serif;background:#09090b;padding:32px;color:#fff;border-radius:16px;max-width:480px;margin:0 auto;border:1px solid #27272a;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="color:#FF6B2B;margin:0;font-size:24px;font-weight:700;">NP Admin CMS</h2>
            <p style="color:#71717a;font-size:13px;margin-top:4px;">New Verification Code</p>
          </div>
          <div style="background:#18181b;border:1px solid #FF6B2B;font-size:36px;font-weight:800;letter-spacing:10px;color:#FF6B2B;padding:20px;text-align:center;border-radius:12px;margin:24px 0;">
            ${newCode}
          </div>
          <p style="color:#71717a;font-size:12px;">Expires in <strong>10 minutes</strong>.</p>
        </div>
      `,
    });

    res.json({ success: true, message: "New verification code sent!" });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to resend verification code" });
  }
});

// GET /api/auth/me — validate current token
router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

// POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
