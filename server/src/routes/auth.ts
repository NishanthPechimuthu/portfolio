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
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// In-memory store for pending 2FA OTP tokens
interface PendingOTP {
  userId: number;
  username: string;
  code: string;
  expiresAt: number;
}

const pendingOTPs = new Map<string, PendingOTP>();

// Helper function to verify TOTP code using RFC 6238 HMAC-SHA1
function verifyTOTP(secret: string, token: string): boolean {
  try {
    const period = 30;
    const now = Math.floor(Date.now() / 1000);
    const cleanToken = token.trim();
    for (let i = -1; i <= 1; i++) {
      const timeStep = Math.floor((now + i * period) / period);
      const buffer = Buffer.alloc(8);
      buffer.writeBigInt64BE(BigInt(timeStep), 0);

      const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      let bits = "";
      const cleanSecret = secret.toUpperCase().replace(/=/g, "").replace(/ /g, "");
      for (let j = 0; j < cleanSecret.length; j++) {
        const val = base32chars.indexOf(cleanSecret.charAt(j));
        if (val >= 0) bits += val.toString(2).padStart(5, "0");
      }
      const bytes = new Uint8Array(Math.floor(bits.length / 8));
      for (let j = 0; j < bytes.length; j++) {
        bytes[j] = parseInt(bits.substring(j * 8, j * 8 + 8), 2);
      }

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

// POST /api/auth/login
router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const cleanUsername = username.trim();
    const envUsername = (process.env.ADMIN_USERNAME || "admin").trim();
    const envEmail = (process.env.ADMIN_EMAIL || "").trim();
    const envPassword = process.env.ADMIN_PASSWORD;

    const usernamePrefix = cleanUsername.includes("@") ? cleanUsername.split("@")[0] : cleanUsername;
    const isEnvMatch =
      cleanUsername === envUsername ||
      cleanUsername === envEmail ||
      (envEmail.length > 0 && cleanUsername === envEmail.split("@")[0]) ||
      usernamePrefix === envUsername ||
      (envEmail.length > 0 && usernamePrefix === envEmail.split("@")[0]);

    // Search DB by exact username or prefix before @
    let user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { username: usernamePrefix },
          { username: envUsername },
        ],
      },
    });

    if (!user) {
      user = await prisma.adminUser.findFirst();
    }

    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    }

    // Fallback: Check against .env ADMIN_PASSWORD if DB hash doesn't match or DB user missing
    if (!isPasswordValid && envPassword && password === envPassword && (isEnvMatch || !user)) {
      isPasswordValid = true;
      const newHash = await bcrypt.hash(envPassword, 10);
      if (user) {
        user = await prisma.adminUser.update({
          where: { id: user.id },
          data: { passwordHash: newHash, username: envUsername || user.username },
        });
      } else {
        user = await prisma.adminUser.create({
          data: { username: envUsername || "np", passwordHash: newHash },
        });
      }
    }

    if (!user || !isPasswordValid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    // Check if 2FA is required (only enabled if ENABLE_2FA=true in .env)
    const is2FAEnabled = process.env.ENABLE_2FA === "true";

    if (is2FAEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const tempToken = crypto.randomBytes(32).toString("hex");

      pendingOTPs.set(tempToken, {
        userId: user.id,
        username: user.username,
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
      });

      const adminEmail = process.env.ADMIN_EMAIL || process.env.REPLY_EMAIL || "admin@nishanth.qzz.io";
      const maskedEmail = adminEmail.replace(/(.{2})(.*)(?=@)/, (_m, p1, p2) => p1 + "*".repeat(p2.length));

      try {
        await sendEmail({
          to: adminEmail,
          subject: "🔐 Admin Login — 2-Step Verification Code",
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #09090b; padding: 32px; color: #ffffff; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #27272a;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #FF6B2B; margin: 0; font-size: 24px; font-weight: 700;">NP Admin CMS</h2>
                <p style="color: #71717a; font-size: 13px; margin-top: 4px;">2-Step Verification Code</p>
              </div>
              <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                A login attempt was made for account <strong>${user.username}</strong>. Use the verification code below to complete your sign in:
              </p>
              <div style="background: #18181b; border: 1px solid #FF6B2B; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #FF6B2B; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
                ${otp}
              </div>
              <p style="color: #71717a; font-size: 12px; line-height: 1.5;">
                This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email or update your admin password.
              </p>
            </div>
          `,
        });
      } catch (emailErr: any) {
        console.warn("2FA email notification failed:", emailErr.message);
        console.info(`[2FA OTP Backup] Temp Token: ${tempToken} | Code: ${otp}`);
      }

      res.json({
        requires2FA: true,
        tempToken,
        destinationEmail: maskedEmail,
        message: "Verification code sent to " + maskedEmail,
      });
      return;
    }

    // If 2FA disabled, direct login
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
    );

    res.json({ success: true, token, username: user.username });
  } catch (err: any) {
    console.error("Login route error:", err);
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }
    res.status(500).json({ error: err?.message || "Login failed" });
  }
});

// POST /api/auth/verify-2fa
router.post("/verify-2fa", authLimiter, async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = z.object({
      tempToken: z.string().min(1),
      code: z.string().min(1),
    }).parse(req.body);

    const pending = pendingOTPs.get(tempToken);
    let isValid = false;

    // 1. Verify TOTP if secret configured in env
    if (process.env.TOTP_SECRET && verifyTOTP(process.env.TOTP_SECRET, code)) {
      isValid = true;
    }

    // 2. Verify Email OTP
    if (pending && pending.code === code.trim() && Date.now() < pending.expiresAt) {
      isValid = true;
    }

    if (!isValid) {
      res.status(401).json({ error: "Invalid or expired verification code" });
      return;
    }

    const userId = pending?.userId || 1;
    if (tempToken) pendingOTPs.delete(tempToken);

    const user = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any }
    );

    res.json({ success: true, token, username: user.username });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Verification code and temporary token are required" });
      return;
    }
    res.status(500).json({ error: err?.message || "Verification failed" });
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

    const adminEmail = process.env.ADMIN_EMAIL || process.env.REPLY_EMAIL || "admin@nishanth.qzz.io";

    await sendEmail({
      to: adminEmail,
      subject: "🔐 Admin Login — 2-Step Verification Code (Resent)",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #09090b; padding: 32px; color: #ffffff; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #27272a;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #FF6B2B; margin: 0; font-size: 24px; font-weight: 700;">NP Admin CMS</h2>
            <p style="color: #71717a; font-size: 13px; margin-top: 4px;">2-Step Verification Code (Resent)</p>
          </div>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            Your new verification code is:
          </p>
          <div style="background: #18181b; border: 1px solid #FF6B2B; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #FF6B2B; padding: 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
            ${newCode}
          </div>
          <p style="color: #71717a; font-size: 12px; line-height: 1.5;">
            This code will expire in <strong>10 minutes</strong>.
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: "New verification code sent!" });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to resend verification code" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

// POST /api/auth/logout (client-side only)
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
