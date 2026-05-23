import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const barterItemsTable = pgTable("barter_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  quantity: numeric("quantity").notNull(),
  unit: text("unit").notNull(),
  imageUrl: text("image_url"),
  wantedFor: text("wanted_for"),
  status: text("status").notNull().default("available"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const barterTradesTable = pgTable("barter_trades", {
  id: serial("id").primaryKey(),
  offeredItemId: integer("offered_item_id").notNull(),
  requestedItemId: integer("requested_item_id").notNull(),
  status: text("status").notNull().default("proposed"),
  proposerId: integer("proposer_id").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBarterItemSchema = createInsertSchema(barterItemsTable).omit({ id: true, createdAt: true });
export type InsertBarterItem = z.infer<typeof insertBarterItemSchema>;
export type BarterItem = typeof barterItemsTable.$inferSelect;
