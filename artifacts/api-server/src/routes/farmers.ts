import { Router, type IRouter } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/farmers/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) { res.status(404).json({ error: "Farmer not found" }); return; }

  const [listingCount] = await db
    .select({ count: count() })
    .from(listingsTable)
    .where(and(eq(listingsTable.sellerId, id), eq(listingsTable.status, "active")));

  const recentListings = await db
    .select({
      id: listingsTable.id,
      title: listingsTable.title,
      category: listingsTable.category,
      price: listingsTable.price,
      unit: listingsTable.unit,
      grade: listingsTable.grade,
      isFeatured: listingsTable.isFeatured,
      region: listingsTable.region,
    })
    .from(listingsTable)
    .where(and(eq(listingsTable.sellerId, id), eq(listingsTable.status, "active")))
    .orderBy(desc(listingsTable.createdAt))
    .limit(6);

  const publicProfile = {
    id: user.id,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    region: user.region,
    farmName: user.farmName,
    farmSizeHa: user.farmSizeHa,
    crops: user.crops,
    isVerified: user.isVerified,
    farmScoreRating: user.farmScoreRating,
    totalSales: user.totalSales,
    createdAt: user.createdAt,
    activeListings: Number(listingCount?.count ?? 0),
    recentListings,
  };

  res.json(publicProfile);
});

export default router;
