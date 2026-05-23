import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const qualityScansTable = pgTable("quality_scans", {
  id: serial("id").primaryKey(),
  cropType: text("crop_type").notNull(),
  imageUrl: text("image_url"),
  grade: text("grade").notNull().default("B"),
  score: numeric("score").notNull().default("75"),
  moisture: numeric("moisture"),
  protein: numeric("protein"),
  defects: text("defects"),
  recommendations: text("recommendations"),
  status: text("status").notNull().default("complete"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQualityScanSchema = createInsertSchema(qualityScansTable).omit({ id: true, createdAt: true });
export type InsertQualityScan = z.infer<typeof insertQualityScanSchema>;
export type QualityScan = typeof qualityScansTable.$inferSelect;
