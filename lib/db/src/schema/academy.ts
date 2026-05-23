import { pgTable, serial, text, boolean, numeric, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  level: text("level").notNull().default("beginner"),
  durationHours: numeric("duration_hours").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  instructorName: text("instructor_name").notNull(),
  enrollmentCount: integer("enrollment_count").notNull().default(0),
  rating: numeric("rating").notNull().default("4.5"),
  isFree: boolean("is_free").notNull().default(true),
  modules: jsonb("modules").$type<{ title: string; lessonCount: number }[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("active"),
  progressPercent: numeric("progress_percent").notNull().default("0"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  certificateUrl: text("certificate_url"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
