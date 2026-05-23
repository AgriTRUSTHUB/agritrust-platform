import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { apiUrl } from "@/utils/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return pushToken.data;
  } catch {
    return null;
  }
}

async function savePushTokenToServer(
  pushToken: string,
  authToken: string
): Promise<void> {
  try {
    await fetch(apiUrl("/api/auth/push-token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: pushToken }),
    });
  } catch {
    // non-critical — silently ignore
  }
}

/** Parse a notification data value as a numeric ID, tolerating both number and numeric string. */
function parseId(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function navigateFromData(
  data: Record<string, unknown>,
  router: ReturnType<typeof useRouter>
): void {
  const negotiationId = parseId(data?.negotiationId);
  const listingId = parseId(data?.listingId);
  if (negotiationId != null) {
    router.push(`/negotiation/${negotiationId}`);
  } else if (listingId != null) {
    router.push(`/listing/${listingId}`);
  }
}

export function useNotifications(authToken: string | null) {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(
    null
  );
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!authToken || Platform.OS === "web") return;

    registerForPushNotificationsAsync().then((pushToken) => {
      if (pushToken) savePushTokenToServer(pushToken, authToken);
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((_notification) => {
        // foreground notification received — the handler shows it automatically
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<
          string,
          unknown
        >;
        navigateFromData(data, router);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [authToken]);
}

export function useLastNotificationNavigation() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastResponse) return;
    const notifId = lastResponse.notification.request.identifier;
    if (handledIdRef.current === notifId) return; // already navigated for this notification
    handledIdRef.current = notifId;

    const data = lastResponse.notification.request.content.data as Record<
      string,
      unknown
    >;
    navigateFromData(data, router);
  }, [lastResponse]);
}
