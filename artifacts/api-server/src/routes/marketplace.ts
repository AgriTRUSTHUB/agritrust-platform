import { Router, type IRouter } from "express";
import { db, listingsTable, usersTable } from "@workspace/db";
import { eq, and, gte, lte, ilike, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/marketplace/listings", async (req, res): Promise<void> => {
  const { category, search, minPrice, maxPrice, page = "1", limit = "500" } = req.query as Record<string, string>;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [eq(listingsTable.status, "active")];
  if (category) conditions.push(eq(listingsTable.category, category));
  if (minPrice) conditions.push(gte(listingsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(listingsTable.price, maxPrice));
  if (search) conditions.push(ilike(listingsTable.title, `%${search}%`));

  const listings = await db.select().from(listingsTable)
    .leftJoin(usersTable, eq(listingsTable.sellerId, usersTable.id))
    .where(and(...conditions))
    .limit(limitNum).offset(offset);

  const items = listings.map(({ listings: l, users: u }) => ({
    ...l,
    sellerName: u?.name ?? "Unknown",
    sellerRating: u?.farmScoreRating ?? null,
  }));

  res.json({ items, total: items.length + offset, page: pageNum, limit: limitNum });
});

router.post("/marketplace/listings", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { title, description, category, price, unit, quantity, imageUrl, region, grade, certifications } = req.body;
  if (!title || !category || !price || !unit || !quantity) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }
  const [listing] = await db.insert(listingsTable).values({
    title, description: description || null, category,
    price: String(price), unit, quantity: String(quantity),
    availableQty: String(quantity),
    imageUrl: imageUrl || null, region: region || null,
    grade: grade || null, certifications: certifications || null,
    status: "active", isFeatured: false, sellerId: userId, viewCount: 0,
  }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...listing, sellerName: user?.name ?? "Unknown", sellerRating: null });
});

router.get("/marketplace/my-listings", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { all } = req.query as Record<string, string>;
  const conditions = [eq(listingsTable.sellerId, userId)];
  if (!all) conditions.push(eq(listingsTable.status, "active"));
  const listings = await db
    .select()
    .from(listingsTable)
    .where(and(...conditions))
    .orderBy(desc(listingsTable.createdAt));
  res.json(listings);
});

router.get("/marketplace/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(listingsTable)
    .leftJoin(usersTable, eq(listingsTable.sellerId, usersTable.id))
    .where(eq(listingsTable.id, id));
  if (!row) { res.status(404).json({ error: "Listing not found" }); return; }
  await db.update(listingsTable).set({ viewCount: (row.listings.viewCount ?? 0) + 1 }).where(eq(listingsTable.id, id));
  res.json({ ...row.listings, sellerName: row.users?.name ?? "Unknown", sellerRating: row.users?.farmScoreRating ?? null });
});

router.patch("/marketplace/listings/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (existing.sellerId !== req.userId) { res.status(403).json({ error: "Forbidden: you can only edit your own listings" }); return; }
  const updates: Record<string, unknown> = {};
  const numericFields = new Set(["price", "quantity", "availableQty"]);
  const fields = ["title", "description", "price", "quantity", "availableQty", "imageUrl", "status", "category", "unit", "region", "grade", "certifications"];
  for (const f of fields) if (req.body[f] !== undefined) updates[f] = numericFields.has(f) ? String(req.body[f]) : req.body[f];
  const [listing] = await db.update(listingsTable).set(updates).where(eq(listingsTable.id, id)).returning();
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, listing.sellerId));
  res.json({ ...listing, sellerName: user?.name ?? "Unknown", sellerRating: null });
});

router.delete("/marketplace/listings/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (existing.sellerId !== req.userId) { res.status(403).json({ error: "Forbidden: you can only delete your own listings" }); return; }
  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  res.sendStatus(204);
});

router.get("/marketplace/featured", async (_req, res): Promise<void> => {
  const listings = await db.select().from(listingsTable)
    .leftJoin(usersTable, eq(listingsTable.sellerId, usersTable.id))
    .where(eq(listingsTable.isFeatured, true)).limit(8);
  if (listings.length === 0) {
    const fallback = await db.select().from(listingsTable)
      .leftJoin(usersTable, eq(listingsTable.sellerId, usersTable.id))
      .where(eq(listingsTable.status, "active")).limit(8);
    res.json(fallback.map(({ listings: l, users: u }) => ({ ...l, sellerName: u?.name ?? "Unknown", sellerRating: u?.farmScoreRating ?? null })));
    return;
  }
  res.json(listings.map(({ listings: l, users: u }) => ({ ...l, sellerName: u?.name ?? "Unknown", sellerRating: u?.farmScoreRating ?? null })));
});

export default router;
