import { Router, type IRouter } from "express";
import { db, notificationsTable, notificationPrefsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { unread } = req.query;
  const conditions = [eq(notificationsTable.userId, userId)];
  if (unread === "true") conditions.push(eq(notificationsTable.isRead, false));
  const notifs = await db
    .select()
    .from(notificationsTable)
    .where(and(...conditions));
  res.json(notifs);
});

router.patch(
  "/notifications/:id/read",
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
    const [existing] = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, id));
    if (!existing) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    if (existing.userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [notif] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();
    res.json(notif);
  }
);

router.post(
  "/notifications/read-all",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.userId!;
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, userId));
    res.json({ message: "All notifications marked as read" });
  }
);

router.get(
  "/auth/notification-prefs",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.userId!;
    let [prefs] = await db
      .select()
      .from(notificationPrefsTable)
      .where(eq(notificationPrefsTable.userId, userId));
    if (!prefs) {
      [prefs] = await db
        .insert(notificationPrefsTable)
        .values({ userId })
        .returning();
    }
    res.json(prefs);
  }
);

router.put(
  "/auth/notification-prefs",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = req.userId!;
    const { newOffers, counterOffers, dealAccepted, dealRejected } =
      req.body as {
        newOffers?: boolean;
        counterOffers?: boolean;
        dealAccepted?: boolean;
        dealRejected?: boolean;
      };

    const [prefs] = await db
      .insert(notificationPrefsTable)
      .values({
        userId,
        newOffers: newOffers ?? true,
        counterOffers: counterOffers ?? true,
        dealAccepted: dealAccepted ?? true,
        dealRejected: dealRejected ?? true,
      })
      .onConflictDoUpdate({
        target: notificationPrefsTable.userId,
        set: {
          ...(newOffers !== undefined && { newOffers }),
          ...(counterOffers !== undefined && { counterOffers }),
          ...(dealAccepted !== undefined && { dealAccepted }),
          ...(dealRejected !== undefined && { dealRejected }),
        },
      })
      .returning();
    res.json(prefs);
  }
);

export default router;
