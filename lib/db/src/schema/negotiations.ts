import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const negotiationsTable = pgTable("negotiations", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  status: text("status").notNull().default("pending"),
  currentPrice: numeric("current_price").notNull(),
  originalPrice: numeric("original_price").notNull(),
  quantity: numeric("quantity").notNull(),
  aiSuggestion: text("ai_suggestion"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  negotiationId: integer("negotiation_id").notNull(),
  offeredBy: text("offered_by").notNull(),
  price: numeric("price").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNegotiationSchema = createInsertSchema(negotiationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNegotiation = z.infer<typeof insertNegotiationSchema>;
export type Negotiation = typeof negotiationsTable.$inferSelect;
