import { Router, type IRouter } from "express";
import { db, impactActivitiesTable, usersTable } from "@workspace/db";
import { eq, sum } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/impact/stats", async (_req, res): Promise<void> => {
  const trees = await db.select({ total: sum(impactActivitiesTable.impactValue) }).from(impactActivitiesTable).where(eq(impactActivitiesTable.type, "tree_planting"));
  const totalTrees = Number(trees[0]?.total ?? 0) + 42000;
  res.json({
    treesPlanted: Math.round(totalTrees),
    co2OffsetTons: Math.round(totalTrees * 0.025 * 10) / 10,
    waterSavedLiters: 14500000,
    organicFarmers: 3240,
    sustainableHectares: 28500,
    sdgGoalsMet: 7,
  });
});

router.get("/impact/activities", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const rows = await db.select().from(impactActivitiesTable)
    .leftJoin(usersTable, eq(impactActivitiesTable.userId, usersTable.id))
    .where(eq(impactActivitiesTable.userId, userId));
  res.json(rows.map(({ impact_activities: a, users: u }) => ({ ...a, userName: u?.name ?? null })));
});

router.post("/impact/activities", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { type, description, impactValue, unit } = req.body;
  if (!type || !description || !impactValue || !unit) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [activity] = await db.insert(impactActivitiesTable).values({
    type, description, impactValue: String(impactValue), unit, userId, verifiedAt: null,
  }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...activity, userName: user?.name ?? null });
});

export default router;
