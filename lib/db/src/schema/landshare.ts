import { pgTable, serial, text, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const landListingsTable = pgTable("land_listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  region: text("region").notNull(),
  hectares: numeric("hectares").notNull(),
  pricePerHaPerYear: numeric("price_per_ha_per_year").notNull(),
  soilType: text("soil_type"),
  waterAccess: boolean("water_access").notNull().default(false),
  cropHistory: text("crop_history"),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("available"),
  ownerId: integer("owner_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLandListingSchema = createInsertSchema(landListingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLandListing = z.infer<typeof insertLandListingSchema>;
export type LandListing = typeof landListingsTable.$inferSelect;
