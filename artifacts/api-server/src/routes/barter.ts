import { Router, type IRouter } from "express";
import { db, barterItemsTable, barterTradesTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/barter/items", async (_req, res): Promise<void> => {
  const rows = await db.select().from(barterItemsTable)
    .leftJoin(usersTable, eq(barterItemsTable.userId, usersTable.id));
  res.json(rows.map(({ barter_items: b, users: u }) => ({ ...b, userName: u?.name ?? "Unknown" })));
});

router.post("/barter/items", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { title, description, category, quantity, unit, imageUrl, wantedFor } = req.body;
  if (!title || !category || !quantity || !unit) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [item] = await db.insert(barterItemsTable).values({
    title, description: description || null, category,
    quantity: String(quantity), unit, imageUrl: imageUrl || null,
    wantedFor: wantedFor || null, status: "available", userId,
  }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...item, userName: user?.name ?? "Unknown" });
});

router.get("/barter/trades", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const trades = await db.select().from(barterTradesTable).where(eq(barterTradesTable.proposerId, userId));
  const result = await Promise.all(trades.map(async (t) => {
    const [proposer] = await db.select().from(usersTable).where(eq(usersTable.id, t.proposerId));
    return { ...t, proposerName: proposer?.name ?? null };
  }));
  res.json(result);
});

router.post("/barter/trades", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { offeredItemId, requestedItemId, message } = req.body;
  if (!offeredItemId || !requestedItemId) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [trade] = await db.insert(barterTradesTable).values({
    offeredItemId, requestedItemId, status: "proposed", proposerId: userId, message: message || null,
  }).returning();
  const [proposer] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...trade, proposerName: proposer?.name ?? null });
});

export default router;
