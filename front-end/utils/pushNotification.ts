/**
 * Push notification engine — client side.
 *
 * How a notification reaches this app:
 *
 *   Android → our server → Firebase (FCM) → device
 *   iOS     → our server → Apple  (APNs) → device
 *
 * `expo-notifications` gives us the right native token for whichever platform we
 * are on, and the backend picks the matching transport. `getDevicePushTokenAsync()`
 * returns an **FCM** token on Android but an **APNs** token on iOS — they are not
 * interchangeable, which is why every token is stored alongside its type.
 *
 * See https://docs.expo.dev/push-notifications/sending-notifications-custom/
 */

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import type { EventSubscription } from 'expo-modules-core';
import {
  saveDeviceToken,
  mirrorTokenToProfile,
  maskToken,
  type PushTokenType,
  type PushPlatform,
  type UserRole,
} from '@/lib/push-token-store';

export type { PushTokenType, PushPlatform, UserRole };

/** Payload our backend attaches to every push. FCM/APNs deliver data as strings. */
export interface PushNotificationData {
  /** e.g. 'appointment', 'prescription', 'message', 'lab_result', 'reminder' */
  type?: string;
  /** Optional deep-link route to navigate to when tapped */
  route?: string;
  [key: string]: unknown;
}

export interface RegisteredPushToken {
  token: string;
  tokenType: PushTokenType;
  platform: PushPlatform;
}

/** Matches `defaultChannel` in app.json. */
export const DEFAULT_CHANNEL_ID = 'default';
/** High-importance channel the test engine targets. */
export const ALERT_CHANNEL_ID = 'test_alerts';

/** Cached so the Settings screen can display it without re-requesting. */
let activeToken: RegisteredPushToken | null = null;

export function getActivePushToken(): RegisteredPushToken | null {
  return activeToken;
}

/**
 * Controls what happens when a push lands while the app is open and focused.
 * Without this, iOS stays silent in the foreground by default.
 *
 * Must run at module scope, before React renders.
 */
export function configureForegroundHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Android 8+ refuses to display any notification whose channel does not exist,
 * so both channels are created at startup — before a push can arrive.
 */
export async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'General',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00B5AD',
      sound: 'default',
      showBadge: true,
      enableVibrate: true,
    });

    await Notifications.setNotificationChannelAsync(ALERT_CHANNEL_ID, {
      name: 'Test Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00B5AD',
      sound: 'default',
      showBadge: true,
      enableVibrate: true,
    });

    console.log('📡 [push] Android channels ready:', DEFAULT_CHANNEL_ID, ALERT_CHANNEL_ID);
  } catch (err) {
    console.warn('⚠️ [push] Failed to configure Android channels:', err);
  }
}

/** Ask for notification permission, returning whether we ended up with it. */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return status === 'granted';
}

/**
 * Fetch this device's native push token.
 *
 * Returns null rather than throwing on simulators, in Expo Go, or when the user
 * declines permission — none of those are bugs, and local notifications still
 * work in all of them.
 */
export async function getNativePushToken(): Promise<RegisteredPushToken | null> {
  // Permission is requested before the device check on purpose. The iOS
  // Simulator cannot produce a token, but `xcrun simctl push` does deliver real
  // notifications to it — and those only display if permission was granted.
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.warn('⚠️ [push] Notification permission was not granted.');
    return null;
  }

  if (!Device.isDevice) {
    console.log(
      'ℹ️ [push] Simulator/emulator: no remote push token available. On the iOS Simulator, deliver test notifications with `xcrun simctl push` — see front-end/PUSH_NOTIFICATIONS.md.'
    );
    return null;
  }

  try {
    const devicePushToken = await Notifications.getDevicePushTokenAsync();

    // On web, `data` is a PushSubscription object rather than a string.
    if (typeof devicePushToken.data !== 'string') {
      console.log('ℹ️ [push] Web push subscriptions are not supported by the backend yet.');
      return null;
    }

    const platform: PushPlatform =
      devicePushToken.type === 'ios'
        ? 'ios'
        : devicePushToken.type === 'android'
          ? 'android'
          : 'web';

    // Android hands back an FCM registration token; iOS hands back an APNs token.
    const tokenType: PushTokenType =
      platform === 'ios' ? 'apns' : platform === 'android' ? 'fcm' : 'expo';

    const result: RegisteredPushToken = { token: devicePushToken.data, tokenType, platform };
    activeToken = result;

    console.log(`📲 [push] ${tokenType.toUpperCase()} token acquired: ${maskToken(result.token)}`);
    return result;
  } catch (err: any) {
    console.warn(
      '⚠️ [push] Could not get a native push token. On Android this usually means google-services.json was not compiled in — you need a development build, not Expo Go. Details:',
      err?.message ?? err
    );
    return null;
  }
}

/**
 * Fetch an Expo push token (`ExponentPushToken[…]`).
 *
 * This is a *different* address from the native token above. Expo's push
 * service sits in front of FCM and APNs and works the same on both platforms,
 * which is what https://expo.dev/notifications sends to.
 *
 * Requires an EAS project id — run `eas init` in front-end/ to create one.
 * Returns null instead of throwing when that is missing, since the native token
 * is the primary path and works without EAS.
 */
export async function getExpoPushToken(): Promise<string | null> {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? (Constants as any).easConfig?.projectId;

  if (!projectId) {
    console.log(
      'ℹ️ [push] No EAS projectId in app.json, so no Expo push token. Run `eas init` in front-end/ if you want to test from expo.dev/notifications.'
    );
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (err: any) {
    console.warn('⚠️ [push] Could not get an Expo push token:', err?.message ?? err);
    return null;
  }
}

export interface PushRegistration {
  /** FCM on Android, APNs on iOS. Used by Firebase Console and our own server. */
  native: RegisteredPushToken | null;
  /** ExponentPushToken[…], used by the expo.dev/notifications tool. */
  expo: string | null;
}

/**
 * Full registration: channels → permission → tokens → Supabase.
 *
 * Both token types are fetched because the two testing tools want different
 * ones. Only the native token is persisted; the Expo token is for manual
 * testing and is printed to the console rather than stored.
 *
 * Safe to call repeatedly; the upsert is keyed on the token.
 */
export async function registerForPushNotifications(
  userId: string,
  role: UserRole
): Promise<PushRegistration> {
  await ensureAndroidChannels();

  const native = await getNativePushToken();
  if (!native) return { native: null, expo: null };

  await saveDeviceToken({
    userId,
    role,
    token: native.token,
    tokenType: native.tokenType,
    platform: native.platform,
    deviceName: Device.deviceName ?? `${Platform.OS} device`,
  });

  // Best-effort mirror for the older profile-table lookup path.
  await mirrorTokenToProfile(userId, role, native.token, native.tokenType);

  const expo = await getExpoPushToken();

  if (__DEV__) {
    // Printed in full only in development so the values can be copied out of
    // the Metro terminal and pasted into Firebase Console or expo.dev.
    const line = '─'.repeat(64);
    console.log(
      [
        '',
        line,
        ` PUSH TOKENS — ${native.platform}   user_id: ${userId}   role: ${role}`,
        line,
        ` ${native.tokenType.toUpperCase()} (Firebase Console → Cloud Messaging → Send test message):`,
        ` ${native.token}`,
        '',
        expo
          ? ` Expo (expo.dev/notifications):\n ${expo}`
          : ' Expo: not available — run `eas init` in front-end/ to enable.',
        line,
        '',
      ].join('\n')
    );
  }

  return { native, expo };
}

export interface NotificationListeners {
  /** A push arrived while the app was open and focused. */
  onReceived?: (notification: Notifications.Notification) => void;
  /** The user tapped a notification (app was backgrounded or running). */
  onResponse?: (response: Notifications.NotificationResponse) => void;
  /** FCM/APNs rotated our token — re-save it. */
  onTokenRefresh?: (token: RegisteredPushToken) => void;
}

/**
 * Attach every notification listener in one place and return a single cleanup
 * function. Registering these in more than one component is what causes
 * duplicate banners, so this should be called exactly once, from the root layout.
 */
export function attachNotificationListeners(listeners: NotificationListeners): () => void {
  const subscriptions: EventSubscription[] = [];

  if (listeners.onReceived) {
    subscriptions.push(Notifications.addNotificationReceivedListener(listeners.onReceived));
  }

  if (listeners.onResponse) {
    subscriptions.push(Notifications.addNotificationResponseReceivedListener(listeners.onResponse));
  }

  if (listeners.onTokenRefresh) {
    subscriptions.push(
      Notifications.addPushTokenListener((tokenData) => {
        if (typeof tokenData.data !== 'string') return;

        const platform: PushPlatform =
          tokenData.type === 'ios' ? 'ios' : tokenData.type === 'android' ? 'android' : 'web';
        const tokenType: PushTokenType =
          platform === 'ios' ? 'apns' : platform === 'android' ? 'fcm' : 'expo';

        const refreshed: RegisteredPushToken = { token: tokenData.data, tokenType, platform };
        activeToken = refreshed;

        console.log('🔄 [push] Token rotated:', maskToken(refreshed.token));
        listeners.onTokenRefresh?.(refreshed);
      })
    );
  }

  return () => {
    for (const sub of subscriptions) sub.remove();
    subscriptions.length = 0;
  };
}

/**
 * The notification that cold-started the app, if any.
 * `addNotificationResponseReceivedListener` does not fire for a launch from a
 * fully killed process, so this has to be checked separately on startup.
 */
export async function getColdStartNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  try {
    return await Notifications.getLastNotificationResponseAsync();
  } catch {
    return null;
  }
}

/**
 * Development-only helper: fires a local notification shaped exactly like a real
 * server push, deep link included.
 *
 * Needed because remote push cannot reach an iPhone without a paid Apple
 * Developer membership, while local notifications work free in Expo Go. Every
 * call site is wrapped in `__DEV__`, so this never runs in a production build.
 *
 * @param seconds Delay before it fires. Use a longer delay to background or
 *                kill the app first and exercise those code paths.
 */
export async function scheduleDevTestNotification(seconds = 1): Promise<string> {
  // iOS will silently drop a local notification if permission was never granted,
  // and registration only asks once the user is signed in with a role — so ask
  // here too rather than failing quietly.
  const granted = await requestNotificationPermission();
  if (!granted) {
    throw new Error(
      'Notifications are not allowed for this app. Enable them in iOS Settings → Notifications.'
    );
  }

  await ensureAndroidChannels();

  return await scheduleLocalNotification({
    title: 'Appointment Reminder 🩺',
    body: 'Dr. Sarah Johnson has confirmed your video consultation for 10:00 AM.',
    data: {
      type: 'appointment',
      route: '/(tabs)/history',
    },
    seconds,
  });
}

/**
 * Schedule a notification from the device itself — no server, no network.
 * Kept as a building block for in-app reminders; remote pushes do not use it.
 */
export async function scheduleLocalNotification({
  title,
  body,
  data,
  seconds = 1,
}: {
  title: string;
  body: string;
  data?: PushNotificationData;
  seconds?: number;
}): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger:
      seconds > 0
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false,
          }
        : null,
  });
}
