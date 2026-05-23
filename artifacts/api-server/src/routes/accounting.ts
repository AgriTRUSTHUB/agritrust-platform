import { Router, type IRouter } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/accounting/transactions", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { type, from, to } = req.query as Record<string, string>;
  const conditions = [eq(transactionsTable.userId, userId)];
  if (type) conditions.push(eq(transactionsTable.type, type));
  if (from) conditions.push(gte(transactionsTable.date, from));
  if (to) conditions.push(lte(transactionsTable.date, to));
  const txns = await db.select().from(transactionsTable).where(and(...conditions));
  res.json(txns);
});

router.post("/accounting/transactions", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { type, amount, category, description, date, referenceId } = req.body;
  if (!type || !amount || !category || !description || !date) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [txn] = await db.insert(transactionsTable).values({
    type, amount: String(amount), category, description, date, referenceId: referenceId || null, userId,
  }).returning();
  res.status(201).json(txn);
});

router.get("/accounting/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const all = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, userId));
  const totalIncome = all.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = all.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthTxns = all.filter(t => t.date >= monthStart);
  const monthIncome = monthTxns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const monthExpenses = monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const mStart = d.toISOString().split("T")[0];
    const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    const mTxns = all.filter(t => t.date >= mStart && t.date <= mEnd);
    return {
      month: label,
      income: mTxns.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
      expenses: mTxns.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
    };
  });

  res.json({
    totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses,
    currentMonth: { income: monthIncome, expenses: monthExpenses, net: monthIncome - monthExpenses },
    monthlyTrend,
  });
});

export default router;
