import { pgTable, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const farmScoresTable = pgTable("farm_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  score: numeric("score").notNull().default("0"),
  salesHistory: numeric("sales_history").notNull().default("0"),
  paymentHistory: numeric("payment_history").notNull().default("0"),
  profileCompleteness: numeric("profile_completeness").notNull().default("0"),
  communityReputation: numeric("community_reputation").notNull().default("0"),
  sustainabilityScore: numeric("sustainability_score").notNull().default("0"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFarmScoreSchema = createInsertSchema(farmScoresTable).omit({ id: true });
export type InsertFarmScore = z.infer<typeof insertFarmScoreSchema>;
export type FarmScore = typeof farmScoresTable.$inferSelect;
