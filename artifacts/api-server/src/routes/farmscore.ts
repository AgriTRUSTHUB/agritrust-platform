import { Router, type IRouter } from "express";
import { db, farmScoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

function getScoreTier(score: number): string {
  if (score >= 800) return "Platinum";
  if (score >= 600) return "Gold";
  if (score >= 400) return "Silver";
  if (score >= 200) return "Bronze";
  return "Starter";
}

router.get("/farmscore", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  let [score] = await db.select().from(farmScoresTable).where(eq(farmScoresTable.userId, userId));
  if (!score) {
    const [created] = await db.insert(farmScoresTable).values({
      userId, score: "350", salesHistory: "60", paymentHistory: "70",
      profileCompleteness: "40", communityReputation: "50", sustainabilityScore: "130",
    }).returning();
    score = created;
  }
  res.json({ ...score, tier: getScoreTier(Number(score.score)) });
});

export default router;
