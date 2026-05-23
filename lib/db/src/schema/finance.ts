import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const loanApplicationsTable = pgTable("loan_applications", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("pending"),
  interestRate: numeric("interest_rate").notNull().default("12"),
  term: integer("term").notNull(),
  collateral: text("collateral"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  disbursedAt: timestamp("disbursed_at", { withTimezone: true }),
  userId: integer("user_id").notNull(),
  farmScoreAtApplication: numeric("farm_score_at_application"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLoanSchema = createInsertSchema(loanApplicationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type LoanApplication = typeof loanApplicationsTable.$inferSelect;
