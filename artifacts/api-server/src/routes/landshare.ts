import { Router, type IRouter } from "express";
import { db, landListingsTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/landshare/listings", async (req, res): Promise<void> => {
  const { region, minHectares, maxPrice } = req.query as Record<string, string>;
  const conditions = [];
  if (region) conditions.push(eq(landListingsTable.region, region));
  if (minHectares) conditions.push(gte(landListingsTable.hectares, minHectares));
  if (maxPrice) conditions.push(lte(landListingsTable.pricePerHaPerYear, maxPrice));

  const rows = conditions.length > 0
    ? await db.select().from(landListingsTable).leftJoin(usersTable, eq(landListingsTable.ownerId, usersTable.id)).where(and(...conditions))
    : await db.select().from(landListingsTable).leftJoin(usersTable, eq(landListingsTable.ownerId, usersTable.id));

  res.json(rows.map(({ land_listings: l, users: u }) => ({ ...l, ownerName: u?.name ?? "Unknown" })));
});

router.post("/landshare/listings", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { title, description, region, hectares, pricePerHaPerYear, soilType, waterAccess, cropHistory, imageUrl } = req.body;
  if (!title || !region || !hectares || !pricePerHaPerYear) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [listing] = await db.insert(landListingsTable).values({
    title, description: description || null, region,
    hectares: String(hectares), pricePerHaPerYear: String(pricePerHaPerYear),
    soilType: soilType || null, waterAccess: waterAccess ?? false,
    cropHistory: cropHistory || null, imageUrl: imageUrl || null,
    status: "available", ownerId: userId,
  }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...listing, ownerName: user?.name ?? "Unknown" });
});

router.get("/landshare/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(landListingsTable).leftJoin(usersTable, eq(landListingsTable.ownerId, usersTable.id)).where(eq(landListingsTable.id, id));
  if (!row) { res.status(404).json({ error: "Land listing not found" }); return; }
  res.json({ ...row.land_listings, ownerName: row.users?.name ?? "Unknown" });
});

export default router;
