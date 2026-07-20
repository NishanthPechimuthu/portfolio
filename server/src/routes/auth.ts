import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

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

// POST /api/auth/login
router.post("/login", authLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({ success: true, token, username: user.username });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, (req: AuthRequest, res: Response) => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

// POST /api/auth/logout  (client-side only — just confirms)
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Logged out" });
});

export default router;
