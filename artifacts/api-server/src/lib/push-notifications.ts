import { db, usersTable, notificationPrefsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
}

export type NotificationEventType =
  | "newOffer"
  | "counterOffer"
  | "dealAccepted"
  | "dealRejected";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async function sendExpoPush(message: ExpoPushMessage): Promise<void> {
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(message),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.warn({ status: res.status, body: text }, "Expo push send failed");
    }
  } catch (err) {
    logger.error({ err }, "Expo push network error");
  }
}

async function isEventEnabledForUser(
  userId: number,
  eventType: NotificationEventType
): Promise<boolean> {
  const [prefs] = await db
    .select()
    .from(notificationPrefsTable)
    .where(eq(notificationPrefsTable.userId, userId));

  if (!prefs) return true; // defaults to all enabled

  const prefMap: Record<NotificationEventType, boolean> = {
    newOffer: prefs.newOffers,
    counterOffer: prefs.counterOffers,
    dealAccepted: prefs.dealAccepted,
    dealRejected: prefs.dealRejected,
  };
  return prefMap[eventType];
}

export async function notifyUser(
  userId: number,
  notification: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  },
  eventType?: NotificationEventType
): Promise<void> {
  try {
    const [user] = await db
      .select({ expoPushToken: usersTable.expoPushToken })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user?.expoPushToken) return;

    if (eventType) {
      const enabled = await isEventEnabledForUser(userId, eventType);
      if (!enabled) return;
    }

    await sendExpoPush({
      to: user.expoPushToken,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: "default",
    });
  } catch (err) {
    logger.error({ err, userId }, "notifyUser error");
  }
}
