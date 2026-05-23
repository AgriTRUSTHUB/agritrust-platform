import { Router, type IRouter } from "express";
import { db, shipmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

function genTrackingCode(): string {
  return "AGH-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

router.get("/agrihaul/shipments", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const shipments = await db.select().from(shipmentsTable).where(eq(shipmentsTable.userId, userId));
  res.json(shipments);
});

router.post("/agrihaul/shipments", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { origin, destination, cargoType, weightKg, notes } = req.body;
  if (!origin || !destination || !cargoType || !weightKg) { res.status(400).json({ error: "Missing required fields" }); return; }
  const costNAD = Math.round(Number(weightKg) * 0.85 + 150);
  const estimatedDelivery = new Date(Date.now() + 1000 * 60 * 60 * 48);
  const [shipment] = await db.insert(shipmentsTable).values({
    origin, destination, cargoType, weightKg: String(weightKg),
    status: "booked", trackingCode: genTrackingCode(),
    estimatedDelivery, actualDelivery: null,
    driverName: null, driverPhone: null, costNAD: String(costNAD), userId,
  }).returning();
  res.status(201).json(shipment);
});

router.get("/agrihaul/shipments/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [shipment] = await db.select().from(shipmentsTable).where(eq(shipmentsTable.id, id));
  if (!shipment) { res.status(404).json({ error: "Shipment not found" }); return; }
  if (shipment.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  res.json(shipment);
});

export default router;
