import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const theftAlertsTable = pgTable("theft_alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  region: text("region").notNull(),
  itemType: text("item_type").notNull(),
  status: text("status").notNull().default("open"),
  imageUrl: text("image_url"),
  rewardOffered: numeric("reward_offered"),
  reporterId: integer("reporter_id").notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTheftAlertSchema = createInsertSchema(theftAlertsTable).omit({ id: true, createdAt: true });
export type InsertTheftAlert = z.infer<typeof insertTheftAlertSchema>;
export type TheftAlert = typeof theftAlertsTable.$inferSelect;
