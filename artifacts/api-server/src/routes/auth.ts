import { Router, type IRouter } from "express";
import { db, usersTable, farmScoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { requireAuth } from "../middleware/auth.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  extractBearerToken,
} from "../lib/auth-utils";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, role, region, phone } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      passwordHash: hashPassword(password),
      role: role || "farmer",
      region: region || null,
      phone: phone || null,
      isVerified: false,
      totalSales: 0,
    })
    .returning();
  await db
    .insert(farmScoresTable)
    .values({
      userId: user.id,
      score: "350",
      salesHistory: "60",
      paymentHistory: "70",
      profileCompleteness: "40",
      communityReputation: "50",
      sustainabilityScore: "130",
    })
    .onConflictDoNothing();
  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ token, user: { ...safeUser, farmScoreRating: "350" } });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing email or password" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user || !verifyPassword(password, user.passwordHash ?? "")) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  logger.info({ userId: user.id }, "User logged in");
  res.json({ token, user: { ...safeUser } });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const raw = extractBearerToken(req.headers.authorization);
  if (!raw) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = verifyToken(raw);
  if (!userId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/auth/push-token", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { token } = req.body as { token?: string };
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    res.status(400).json({ error: "Valid push token required" });
    return;
  }
  await db
    .update(usersTable)
    .set({ expoPushToken: token.trim() })
    .where(eq(usersTable.id, userId));
  res.json({ message: "Push token saved" });
});

router.delete("/auth/push-token", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  await db
    .update(usersTable)
    .set({ expoPushToken: null })
    .where(eq(usersTable.id, userId));
  res.json({ message: "Push token cleared" });
});

export default router;
