import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const impactActivitiesTable = pgTable("impact_activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  impactValue: numeric("impact_value").notNull(),
  unit: text("unit").notNull(),
  userId: integer("user_id").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertImpactActivitySchema = createInsertSchema(impactActivitiesTable).omit({ id: true, createdAt: true });
export type InsertImpactActivity = z.infer<typeof insertImpactActivitySchema>;
export type ImpactActivity = typeof impactActivitiesTable.$inferSelect;
