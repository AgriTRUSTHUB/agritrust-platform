import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shipmentsTable = pgTable("shipments", {
  id: serial("id").primaryKey(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  cargoType: text("cargo_type").notNull(),
  weightKg: numeric("weight_kg").notNull(),
  status: text("status").notNull().default("booked"),
  trackingCode: text("tracking_code"),
  estimatedDelivery: timestamp("estimated_delivery", { withTimezone: true }),
  actualDelivery: timestamp("actual_delivery", { withTimezone: true }),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  costNAD: numeric("cost_nad"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertShipmentSchema = createInsertSchema(shipmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipmentsTable.$inferSelect;
