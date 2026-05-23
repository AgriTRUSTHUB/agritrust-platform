import { Router, type IRouter } from "express";
import { db, disputesTable, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/disputes", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const rows = await db.select().from(disputesTable)
    .leftJoin(usersTable, eq(disputesTable.complainantId, usersTable.id))
    .where(or(eq(disputesTable.complainantId, userId), eq(disputesTable.respondentId, userId)));
  const result = await Promise.all(rows.map(async ({ disputes: d, users: u }) => {
    const [respondent] = await db.select().from(usersTable).where(eq(usersTable.id, d.respondentId));
    return { ...d, complainantName: u?.name ?? null, respondentName: respondent?.name ?? null };
  }));
  res.json(result);
});

router.post("/disputes", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { title, description, type, respondentId, relatedListingId, evidence } = req.body;
  if (!title || !description || !type || !respondentId) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [dispute] = await db.insert(disputesTable).values({
    title, description, type, status: "open", resolution: null,
    complainantId: userId, respondentId: Number(respondentId),
    relatedListingId: relatedListingId ? Number(relatedListingId) : null,
    evidence: evidence || null, resolvedAt: null,
  }).returning();
  const [complainant] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const [respondent] = await db.select().from(usersTable).where(eq(usersTable.id, Number(respondentId)));
  res.status(201).json({ ...dispute, complainantName: complainant?.name ?? null, respondentName: respondent?.name ?? null });
});

router.get("/disputes/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(disputesTable).where(eq(disputesTable.id, id));
  if (!row) { res.status(404).json({ error: "Dispute not found" }); return; }
  const userId = req.userId!;
  if (row.complainantId !== userId && row.respondentId !== userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const [complainant] = await db.select().from(usersTable).where(eq(usersTable.id, row.complainantId));
  const [respondent] = await db.select().from(usersTable).where(eq(usersTable.id, row.respondentId));
  res.json({ ...row, complainantName: complainant?.name ?? null, respondentName: respondent?.name ?? null });
});

export default router;
