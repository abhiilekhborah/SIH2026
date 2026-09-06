import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  attachNotificationListeners,
  getColdStartNotificationResponse,
  ensureAndroidChannels,
  type RegisteredPushToken,
  type UserRole,
} from '@/utils/pushNotification';
import { saveDeviceToken } from '@/lib/push-token-store';

// Re-exported so existing imports from this module keep working.
export {
  configureForegroundHandler,
  scheduleLocalNotification,
  type PushNotificationData,
  type RegisteredPushToken,
} from '@/utils/pushNotification';

export interface UsePushNotificationsResult {
  /** This device's native push token (FCM on Android, APNs on iOS), or null. */
  pushToken: RegisteredPushToken | null;
  /** ExponentPushToken[…] for the expo.dev/notifications tool, or null. */
  expoPushToken: string | null;
  /** The most recently received notification (foreground only). */
  notification: Notifications.Notification | null;
  /** The notification the user tapped — including a cold-start launch. */
  notificationResponse: Notifications.NotificationResponse | null;
}

/**
 * Owns the entire notification lifecycle for the app.
 *
 * Call this exactly once, from the root layout. Calling it in more than one
 * component would attach duplicate listeners and show every banner twice.
 *
 * Registration is deferred until `userId` is known, because a token is only
 * useful once we can attribute it to an account.
 */
export function usePushNotifications(
  userId: string | null,
  role: UserRole | null
): UsePushNotificationsResult {
  const [pushToken, setPushToken] = useState<RegisteredPushToken | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notificationResponse, setNotificationResponse] =
    useState<Notifications.NotificationResponse | null>(null);

  // Latest identity, readable from inside listeners without re-subscribing.
  const identity = useRef<{ userId: string | null; role: UserRole | null }>({ userId, role });
  identity.current = { userId, role };

  // Channels and cold-start check run once, independent of auth.
  useEffect(() => {
    ensureAndroidChannels();

    getColdStartNotificationResponse().then((response) => {
      if (response) {
        console.log(
          '🚀 [push] App cold-started from a notification:',
          response.notification.request.content.title
        );
        setNotificationResponse(response);
      }
    });
  }, []);

  // Listeners are attached once and live for the app's lifetime.
  useEffect(() => {
    const detach = attachNotificationListeners({
      onReceived: (notif) => {
        console.log('[push] Received in foreground:', notif.request.content.title);
        setNotification(notif);
      },
      onResponse: (response) => {
        console.log('[push] Tapped:', response.notification.request.content.title);
        setNotificationResponse(response);
      },
      onTokenRefresh: (refreshed) => {
        setPushToken(refreshed);
        const { userId: uid, role: r } = identity.current;
        if (uid && r) {
          saveDeviceToken({
            userId: uid,
            role: r,
            token: refreshed.token,
            tokenType: refreshed.tokenType,
            platform: refreshed.platform,
          });
        }
      },
    });

    return detach;
  }, []);

  // Register (and persist) the token once we know who the user is.
  useEffect(() => {
    if (!userId || !role) return;

    let cancelled = false;

    (async () => {
      const { native, expo } = await registerForPushNotifications(userId, role);
      if (cancelled) return;
      if (native) setPushToken(native);
      if (expo) setExpoPushToken(expo);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, role]);

  return { pushToken, expoPushToken, notification, notificationResponse };
}
