import { Router, type IRouter } from "express";
import { db, listingsTable, notificationsTable, farmScoresTable } from "@workspace/db";
import { eq, count, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  res.json({
    totalFarmers: "240,000+",
    totalListings: "180,000+",
    totalTransacted: "NAD 2.4B",
    treesPlanted: "42,000",
    disputeResolutionRate: "95%",
  });
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const limit = parseInt(req.query.limit as string || "20", 10);
  const activities = [
    { id: 1, type: "listing", description: "New maize listing posted in Oshikoto region", actorName: "Johannes N.", actorAvatarUrl: null, metadata: "500kg at NAD 8/kg", createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 2, type: "trade", description: "Trade completed: Wheat for Millet exchange", actorName: "Maria K.", actorAvatarUrl: null, metadata: "Barter Exchange", createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 3, type: "impact", description: "50 trees planted logged in Kavango region", actorName: "Petrus H.", actorAvatarUrl: null, metadata: "ImpactLedger", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 4, type: "loan", description: "Harvest Finance loan approved: NAD 15,000", actorName: "Anna S.", actorAvatarUrl: null, metadata: "12 months @ 12% p.a.", createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: 5, type: "scan", description: "QualityScan Grade A achieved for Pearl Millet", actorName: "David M.", actorAvatarUrl: null, metadata: "Score: 94/100", createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    { id: 6, type: "listing", description: "Premium beef cattle listed — 20 head", actorName: "Tobias V.", actorAvatarUrl: null, metadata: "Hardap Region", createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 7, type: "community", description: "New discussion: Best practices for drip irrigation", actorName: "Selma A.", actorAvatarUrl: null, metadata: "44 replies", createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
    { id: 8, type: "shipment", description: "Shipment delivered: Windhoek to Swakopmund", actorName: "AgriHaul Driver", actorAvatarUrl: null, metadata: "2,400kg produce", createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
    { id: 9, type: "dispute", description: "Dispute resolved: Payment delay case closed", actorName: "Trust Committee", actorAvatarUrl: null, metadata: "Resolution in 48hrs", createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
    { id: 10, type: "course", description: "New course available: Sustainable Farming Practices", actorName: "AgriAcademy", actorAvatarUrl: null, metadata: "Free • 8 hours", createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
  ];
  res.json(activities.slice(0, limit));
});

router.get("/dashboard/user-summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const [listingCount] = await db.select({ count: count() }).from(listingsTable).where(eq(listingsTable.sellerId, userId));
  const [notifCount] = await db.select({ count: count() }).from(notificationsTable).where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)));
  const [score] = await db.select().from(farmScoresTable).where(eq(farmScoresTable.userId, userId));
  res.json({
    activeListings: Number(listingCount?.count ?? 0),
    pendingOrders: 2,
    totalEarnings: 45800,
    farmScore: score ? Number(score.score) : 350,
    unreadNotifications: Number(notifCount?.count ?? 0),
    activeLoanAmount: 15000,
    savingsBalance: 8200,
  });
});

export default router;
