import { pgTable, serial, text, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mentorsTable = pgTable("mentors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  rating: numeric("rating").notNull().default("4.5"),
  sessionsCompleted: integer("sessions_completed").notNull().default(0),
  hourlyRateNAD: numeric("hourly_rate_nad"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mentorSessionsTable = pgTable("mentor_sessions", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").notNull(),
  menteeId: integer("mentee_id").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("requested"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMentorSchema = createInsertSchema(mentorsTable).omit({ id: true, createdAt: true });
export type InsertMentor = z.infer<typeof insertMentorSchema>;
export type Mentor = typeof mentorsTable.$inferSelect;
