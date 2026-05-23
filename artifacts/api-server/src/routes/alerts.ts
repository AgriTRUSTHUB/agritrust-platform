import { Router, type IRouter } from "express";
import { db, theftAlertsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/alerts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(theftAlertsTable)
    .leftJoin(usersTable, eq(theftAlertsTable.reporterId, usersTable.id));
  res.json(rows.map(({ theft_alerts: a, users: u }) => ({ ...a, reporterName: u?.name ?? null })));
});

router.post("/alerts", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { title, description, region, itemType, imageUrl, rewardOffered } = req.body;
  if (!title || !description || !region || !itemType) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [alert] = await db.insert(theftAlertsTable).values({
    title, description, region, itemType, status: "open",
    imageUrl: imageUrl || null, rewardOffered: rewardOffered ? String(rewardOffered) : null,
    reporterId: userId, resolvedAt: null,
  }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...alert, reporterName: user?.name ?? null });
});

router.get("/alerts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(theftAlertsTable)
    .leftJoin(usersTable, eq(theftAlertsTable.reporterId, usersTable.id))
    .where(eq(theftAlertsTable.id, id));
  if (!row) { res.status(404).json({ error: "Alert not found" }); return; }
  res.json({ ...row.theft_alerts, reporterName: row.users?.name ?? null });
});

export default router;
