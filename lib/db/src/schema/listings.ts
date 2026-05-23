import { pgTable, serial, text, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: numeric("price").notNull(),
  unit: text("unit").notNull(),
  quantity: numeric("quantity").notNull(),
  availableQty: numeric("available_qty").notNull(),
  imageUrl: text("image_url"),
  region: text("region"),
  grade: text("grade"),
  certifications: text("certifications"),
  status: text("status").notNull().default("active"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sellerId: integer("seller_id").notNull(),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
