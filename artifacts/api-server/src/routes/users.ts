import { Router, type IRouter } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/users/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [listingCount] = await db.select({ count: count() }).from(listingsTable).where(eq(listingsTable.sellerId, id));
  const { passwordHash: _, ...safeUser } = user;
  res.json({
    ...safeUser,
    totalListings: Number(listingCount?.count ?? 0),
    memberSince: new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  });
});

router.patch("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  if (id !== req.userId) { res.status(403).json({ error: "Forbidden: you can only edit your own profile" }); return; }

  const { name, bio, region, phone, farmName, farmSizeHa, crops, avatarUrl } = req.body;
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (region !== undefined) updates.region = region;
  if (phone !== undefined) updates.phone = phone;
  if (farmName !== undefined) updates.farmName = farmName;
  if (farmSizeHa !== undefined) updates.farmSizeHa = farmSizeHa;
  if (crops !== undefined) updates.crops = crops;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const [listingCount] = await db.select({ count: count() }).from(listingsTable).where(eq(listingsTable.sellerId, id));
  const { passwordHash: _, ...safeUser } = user;
  res.json({
    ...safeUser,
    totalListings: Number(listingCount?.count ?? 0),
    memberSince: new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  });
});

export default router;
