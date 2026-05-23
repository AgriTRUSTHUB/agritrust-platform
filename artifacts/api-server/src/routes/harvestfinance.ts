import { Router, type IRouter } from "express";
import { db, loanApplicationsTable, farmScoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

function getInterestRate(farmScore: number): number {
  if (farmScore >= 750) return 8;
  if (farmScore >= 600) return 10;
  if (farmScore >= 450) return 12;
  if (farmScore >= 300) return 15;
  return 18;
}

router.get("/harvest-finance/loans", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const loans = await db.select().from(loanApplicationsTable).where(eq(loanApplicationsTable.userId, userId));
  res.json(loans);
});

router.post("/harvest-finance/loans", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { amount, purpose, term, collateral } = req.body;
  if (!amount || !purpose || !term) { res.status(400).json({ error: "Missing required fields" }); return; }
  const [score] = await db.select().from(farmScoresTable).where(eq(farmScoresTable.userId, userId));
  const farmScore = score ? Number(score.score) : 350;
  const interestRate = getInterestRate(farmScore);
  const [loan] = await db.insert(loanApplicationsTable).values({
    amount: String(amount), purpose, status: "pending",
    interestRate: String(interestRate), term: Number(term),
    collateral: collateral || null, userId,
    farmScoreAtApplication: String(farmScore),
  }).returning();
  res.status(201).json(loan);
});

router.get("/harvest-finance/loans/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [loan] = await db.select().from(loanApplicationsTable).where(eq(loanApplicationsTable.id, id));
  if (!loan) { res.status(404).json({ error: "Loan not found" }); return; }
  if (loan.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  res.json(loan);
});

export default router;
