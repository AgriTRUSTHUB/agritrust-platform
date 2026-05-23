import { Router, type IRouter } from "express";
import { db, mentorsTable, mentorSessionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/mentorship/mentors", async (req, res): Promise<void> => {
  const { specialty } = req.query as Record<string, string>;
  const rows = specialty
    ? await db.select().from(mentorsTable).leftJoin(usersTable, eq(mentorsTable.userId, usersTable.id)).where(eq(mentorsTable.specialty, specialty))
    : await db.select().from(mentorsTable).leftJoin(usersTable, eq(mentorsTable.userId, usersTable.id));
  res.json(rows.map(({ mentors: m, users: u }) => ({ ...m, name: u?.name ?? "Unknown", avatarUrl: u?.avatarUrl ?? null })));
});

router.get("/mentorship/sessions", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const sessions = await db.select().from(mentorSessionsTable)
    .where(eq(mentorSessionsTable.menteeId, userId));
  const result = await Promise.all(sessions.map(async (s) => {
    const [mentor] = await db.select().from(mentorsTable).leftJoin(usersTable, eq(mentorsTable.userId, usersTable.id)).where(eq(mentorsTable.id, s.mentorId));
    const [mentee] = await db.select().from(usersTable).where(eq(usersTable.id, s.menteeId));
    return { ...s, mentorName: mentor?.users?.name ?? null, menteeName: mentee?.name ?? null };
  }));
  res.json(result);
});

router.post("/mentorship/sessions", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { mentorId, topic, scheduledAt, notes } = req.body;
  if (!mentorId || !topic || !scheduledAt) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [session] = await db.insert(mentorSessionsTable).values({
    mentorId: Number(mentorId), menteeId: userId, topic,
    status: "requested", scheduledAt: new Date(scheduledAt), notes: notes || null,
  }).returning();
  const [mentor] = await db.select().from(mentorsTable).leftJoin(usersTable, eq(mentorsTable.userId, usersTable.id)).where(eq(mentorsTable.id, Number(mentorId)));
  const [mentee] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({ ...session, mentorName: mentor?.users?.name ?? null, menteeName: mentee?.name ?? null });
});

export default router;
