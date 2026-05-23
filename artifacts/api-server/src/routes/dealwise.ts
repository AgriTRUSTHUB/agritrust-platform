import { Router, type IRouter } from "express";
import {
  db,
  negotiationsTable,
  offersTable,
  listingsTable,
  usersTable,
  farmScoresTable,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { openai } from "@workspace/integrations-openai-ai-server";
import { notifyUser } from "../lib/push-notifications.js";

const router: IRouter = Router();

async function generateDealWiseSuggestion(params: {
  cropType: string;
  offeredPrice: number;
  originalPrice: number;
  quantity: number;
  buyerFarmScore?: number;
  sellerFarmScore?: number;
  note?: string;
}): Promise<string> {
  const {
    cropType,
    offeredPrice,
    originalPrice,
    quantity,
    buyerFarmScore,
    sellerFarmScore,
    note,
  } = params;
  const discountPct = (
    ((originalPrice - offeredPrice) / originalPrice) *
    100
  ).toFixed(1);
  const month = new Date().toLocaleString("en-US", { month: "long" });

  const prompt = `You are DealWise, an AI negotiation advisor for an African agricultural marketplace. Analyze this negotiation and provide a concise, data-driven counter-offer suggestion.

Crop type: ${cropType}
Original listed price: NAD ${originalPrice}/kg
Buyer's offer: NAD ${offeredPrice}/kg (${discountPct}% below asking)
Quantity: ${quantity} kg
Month (seasonal context): ${month}
${buyerFarmScore ? `Buyer FarmScore: ${buyerFarmScore}/100` : ""}
${sellerFarmScore ? `Seller FarmScore: ${sellerFarmScore}/100` : ""}
${note ? `Buyer's note: "${note}"` : ""}

Provide a 2-3 sentence analysis that:
1. States whether the offer is reasonable based on market norms (typical discount for this crop is 5-15%)
2. Suggests a specific counter-offer price in NAD if appropriate
3. Gives one actionable tip (mention seasonal demand, quality certification, or payment terms)

Keep it concise, specific, and practical. Do not use bullet points.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  return (
    response.choices[0]?.message?.content ??
    "Market analysis suggests reviewing current regional pricing before proceeding."
  );
}

router.get(
  "/dealwise/negotiations",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.userId!;
    const rows = await db
      .select()
      .from(negotiationsTable)
      .leftJoin(listingsTable, eq(negotiationsTable.listingId, listingsTable.id))
      .where(
        or(
          eq(negotiationsTable.buyerId, userId),
          eq(negotiationsTable.sellerId, userId)
        )
      );
    const result = await Promise.all(
      rows.map(async ({ negotiations: n, listings: l }) => {
        const [buyer] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, n.buyerId));
        const [seller] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, n.sellerId));
        return {
          ...n,
          listingTitle: l?.title ?? null,
          buyerName: buyer?.name ?? null,
          sellerName: seller?.name ?? null,
        };
      })
    );
    res.json(result);
  }
);

router.post(
  "/dealwise/negotiations",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.userId!;
    const { listingId, offeredPrice, quantity, note } = req.body as {
      listingId?: number;
      offeredPrice?: number;
      quantity?: number;
      note?: string;
    };
    if (!listingId || !offeredPrice || !quantity) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, listingId));
    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    const [buyerScore] = await db
      .select()
      .from(farmScoresTable)
      .where(eq(farmScoresTable.userId, userId));
    const [sellerScore] = await db
      .select()
      .from(farmScoresTable)
      .where(eq(farmScoresTable.userId, listing.sellerId));

    let aiSuggestion: string;
    try {
      aiSuggestion = await generateDealWiseSuggestion({
        cropType: listing.category ?? listing.title,
        offeredPrice: Number(offeredPrice),
        originalPrice: Number(listing.price),
        quantity: Number(quantity),
        buyerFarmScore: buyerScore ? Number(buyerScore.score) : undefined,
        sellerFarmScore: sellerScore ? Number(sellerScore.score) : undefined,
        note,
      });
    } catch (err) {
      console.error("DealWise AI error:", err);
      aiSuggestion =
        "Market analysis is temporarily unavailable. Review regional pricing data before deciding.";
    }

    const [neg] = await db
      .insert(negotiationsTable)
      .values({
        listingId,
        buyerId: userId,
        sellerId: listing.sellerId,
        status: "pending",
        currentPrice: String(offeredPrice),
        originalPrice: listing.price,
        quantity: String(quantity),
        aiSuggestion,
      })
      .returning();

    await db.insert(offersTable).values({
      negotiationId: neg.id,
      offeredBy: "buyer",
      price: String(offeredPrice),
      note: note || null,
    });

    const [buyer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    const [seller] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, listing.sellerId));

    // Notify seller of new offer (fire-and-forget)
    notifyUser(listing.sellerId, {
      title: "New Offer on Your Listing",
      body: `${buyer?.name ?? "A buyer"} offered N$${Number(offeredPrice).toLocaleString()} for "${listing.title}"`,
      data: { listingId, negotiationId: neg.id },
    }, "newOffer");

    res.status(201).json({
      ...neg,
      listingTitle: listing.title,
      buyerName: buyer?.name ?? null,
      sellerName: seller?.name ?? null,
    });
  }
);

router.get(
  "/dealwise/negotiations/:id",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(raw, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [row] = await db
      .select()
      .from(negotiationsTable)
      .leftJoin(
        listingsTable,
        eq(negotiationsTable.listingId, listingsTable.id)
      )
      .where(eq(negotiationsTable.id, id));
    if (!row) {
      res.status(404).json({ error: "Negotiation not found" });
      return;
    }
    const userId = req.userId!;
    if (
      row.negotiations.buyerId !== userId &&
      row.negotiations.sellerId !== userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const offers = await db
      .select()
      .from(offersTable)
      .where(eq(offersTable.negotiationId, id));
    const [buyer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, row.negotiations.buyerId));
    const [seller] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, row.negotiations.sellerId));
    res.json({
      ...row.negotiations,
      listingTitle: row.listings?.title ?? null,
      buyerName: buyer?.name ?? null,
      sellerName: seller?.name ?? null,
      offers,
    });
  }
);

router.post(
  "/dealwise/negotiations/:id/offer",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(raw, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const userId = req.userId!;
    const { price, note } = req.body as { price?: number; note?: string };
    if (!price) {
      res.status(400).json({ error: "Price required" });
      return;
    }
    const [neg] = await db
      .select()
      .from(negotiationsTable)
      .where(eq(negotiationsTable.id, id));
    if (!neg) {
      res.status(404).json({ error: "Negotiation not found" });
      return;
    }
    if (neg.buyerId !== userId && neg.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const role = neg.buyerId === userId ? "buyer" : "seller";
    await db.insert(offersTable).values({
      negotiationId: id,
      offeredBy: role,
      price: String(price),
      note: note || null,
    });

    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, neg.listingId));
    let aiSuggestion: string;
    try {
      aiSuggestion = await generateDealWiseSuggestion({
        cropType:
          listing?.category ?? listing?.title ?? "agricultural produce",
        offeredPrice: Number(price),
        originalPrice: Number(neg.originalPrice),
        quantity: Number(neg.quantity),
        note,
      });
    } catch (err) {
      console.error("DealWise AI error on counter:", err);
      aiSuggestion =
        "Market analysis is temporarily unavailable. Review comparable listings before deciding.";
    }

    const [updated] = await db
      .update(negotiationsTable)
      .set({ currentPrice: String(price), status: "countered", aiSuggestion })
      .where(eq(negotiationsTable.id, id))
      .returning();

    // Notify the other party of counter offer (fire-and-forget)
    const otherUserId = role === "buyer" ? neg.sellerId : neg.buyerId;
    const [actor] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    notifyUser(otherUserId, {
      title: "Counter-Offer Received",
      body: `${actor?.name ?? "Your counterparty"} countered at N$${Number(price).toLocaleString()} on "${listing?.title ?? "a listing"}"`,
      data: { listingId: neg.listingId, negotiationId: id },
    }, "counterOffer");

    res.json({ ...updated, listingTitle: null, buyerName: null, sellerName: null });
  }
);

router.post(
  "/dealwise/negotiations/:id/analyze",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(raw, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const userId = req.userId!;
    const [neg] = await db
      .select()
      .from(negotiationsTable)
      .where(eq(negotiationsTable.id, id));
    if (!neg) {
      res.status(404).json({ error: "Negotiation not found" });
      return;
    }
    if (neg.buyerId !== userId && neg.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, neg.listingId));
    const [buyerScore] = await db
      .select()
      .from(farmScoresTable)
      .where(eq(farmScoresTable.userId, neg.buyerId));
    const [sellerScore] = await db
      .select()
      .from(farmScoresTable)
      .where(eq(farmScoresTable.userId, neg.sellerId));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const month = new Date().toLocaleString("en-US", { month: "long" });
    const discountPct = (
      ((Number(neg.originalPrice) - Number(neg.currentPrice)) /
        Number(neg.originalPrice)) *
      100
    ).toFixed(1);

    const prompt = `You are DealWise, an expert AI negotiation advisor for an African agricultural marketplace. Provide a detailed, helpful analysis of this active negotiation.

Crop / Product: ${listing?.title ?? "Agricultural produce"} (${listing?.category ?? "produce"})
Listed price: NAD ${neg.originalPrice}/kg
Current negotiated price: NAD ${neg.currentPrice}/kg (${discountPct}% below asking)
Quantity: ${neg.quantity} kg
Total deal value: NAD ${(Number(neg.currentPrice) * Number(neg.quantity)).toFixed(0)}
Negotiation status: ${neg.status}
Season: ${month}
${buyerScore ? `Buyer's FarmScore: ${buyerScore.score}/100 (reliability: ${Number(buyerScore.paymentHistory).toFixed(0)}/100)` : ""}
${sellerScore ? `Seller's FarmScore: ${sellerScore.score}/100` : ""}

Provide a comprehensive analysis covering:
1. Whether the current price is fair given typical market conditions for this crop in ${month}
2. A specific recommended counter-offer price in NAD if appropriate, with reasoning
3. The buyer's and seller's positions and what each party might be willing to accept
4. One concrete tip to close the deal (e.g., payment terms, delivery flexibility, quantity adjustment)

Be direct, use specific numbers, and speak like a trusted market advisor. 3-4 sentences total.`;

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-5.4",
        max_completion_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      await db
        .update(negotiationsTable)
        .set({ aiSuggestion: fullResponse })
        .where(eq(negotiationsTable.id, id));

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      console.error("DealWise streaming error:", err);
      res.write(
        `data: ${JSON.stringify({ error: "AI analysis failed. Please try again." })}\n\n`
      );
      res.end();
    }
  }
);

router.post(
  "/dealwise/negotiations/:id/accept",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(raw, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [neg] = await db
      .select()
      .from(negotiationsTable)
      .where(eq(negotiationsTable.id, id));
    if (!neg) {
      res.status(404).json({ error: "Negotiation not found" });
      return;
    }
    const userId = req.userId!;
    if (neg.buyerId !== userId && neg.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [updated] = await db
      .update(negotiationsTable)
      .set({ status: "accepted" })
      .where(eq(negotiationsTable.id, id))
      .returning();

    // Notify the other party that the deal was accepted (fire-and-forget)
    const otherUserId = neg.buyerId === userId ? neg.sellerId : neg.buyerId;
    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, neg.listingId));
    const [acceptor] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    notifyUser(otherUserId, {
      title: "Deal Accepted!",
      body: `${acceptor?.name ?? "Your counterparty"} accepted the offer on "${listing?.title ?? "a listing"}" at N$${Number(neg.currentPrice).toLocaleString()}`,
      data: { listingId: neg.listingId, negotiationId: id },
    }, "dealAccepted");

    res.json({ ...updated, listingTitle: null, buyerName: null, sellerName: null });
  }
);

router.post(
  "/dealwise/negotiations/:id/reject",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseInt(raw, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [neg] = await db
      .select()
      .from(negotiationsTable)
      .where(eq(negotiationsTable.id, id));
    if (!neg) {
      res.status(404).json({ error: "Negotiation not found" });
      return;
    }
    const userId = req.userId!;
    if (neg.buyerId !== userId && neg.sellerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [updated] = await db
      .update(negotiationsTable)
      .set({ status: "rejected" })
      .where(eq(negotiationsTable.id, id))
      .returning();

    // Notify the other party that the negotiation was rejected (fire-and-forget)
    const otherUserId = neg.buyerId === userId ? neg.sellerId : neg.buyerId;
    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, neg.listingId));
    const [rejector] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    notifyUser(otherUserId, {
      title: "Negotiation Declined",
      body: `${rejector?.name ?? "Your counterparty"} declined the offer on "${listing?.title ?? "a listing"}"`,
      data: { listingId: neg.listingId, negotiationId: id },
    }, "dealRejected");

    res.json({ ...updated, listingTitle: null, buyerName: null, sellerName: null });
  }
);

export default router;
