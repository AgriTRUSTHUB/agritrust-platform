import { Router, type IRouter } from "express";
import { db, coursesTable, enrollmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/academy/courses", async (req, res): Promise<void> => {
  const { category, level } = req.query as Record<string, string>;
  let courses;
  if (category && level) {
    courses = await db.select().from(coursesTable).where(and(eq(coursesTable.category, category), eq(coursesTable.level, level)));
  } else if (category) {
    courses = await db.select().from(coursesTable).where(eq(coursesTable.category, category));
  } else if (level) {
    courses = await db.select().from(coursesTable).where(eq(coursesTable.level, level));
  } else {
    courses = await db.select().from(coursesTable);
  }
  res.json(courses);
});

router.get("/academy/courses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id));
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  res.json(course);
});

router.post("/academy/courses/:id/enroll", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const userId = req.userId!;
  const existing = await db.select().from(enrollmentsTable).where(and(eq(enrollmentsTable.courseId, id), eq(enrollmentsTable.userId, userId)));
  if (existing.length > 0) { res.json(existing[0]); return; }
  const [enrollment] = await db.insert(enrollmentsTable).values({
    courseId: id, userId, status: "active",
    progressPercent: "0", completedAt: null, certificateUrl: null,
  }).returning();
  await db.update(coursesTable).set({ enrollmentCount: (await db.select().from(coursesTable).where(eq(coursesTable.id, id)))[0]?.enrollmentCount + 1 || 1 }).where(eq(coursesTable.id, id));
  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id));
  res.json({ ...enrollment, courseTitle: course?.title ?? null });
});

router.get("/academy/enrollments", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, userId));
  const result = await Promise.all(enrollments.map(async (e) => {
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, e.courseId));
    return { ...e, courseTitle: course?.title ?? null };
  }));
  res.json(result);
});

export default router;
