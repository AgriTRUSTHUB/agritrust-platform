import { pgTable, serial, integer, boolean } from "drizzle-orm/pg-core";

export const notificationPrefsTable = pgTable("notification_prefs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  newOffers: boolean("new_offers").notNull().default(true),
  counterOffers: boolean("counter_offers").notNull().default(true),
  dealAccepted: boolean("deal_accepted").notNull().default(true),
  dealRejected: boolean("deal_rejected").notNull().default(true),
});

export type NotificationPrefs = typeof notificationPrefsTable.$inferSelect;
