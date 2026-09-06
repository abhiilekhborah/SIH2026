import { useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

export interface PushNotificationData {
  type?: string;
  route?: string;
  [key: string]: unknown;
}

export interface UsePushNotificationsResult {
  expoPushToken: string | null;
  notification: any;
  notificationResponse: any;
  error: string | null;
}

/**
 * Safely require expo-notifications only if native module is present in app binary.
 */
function getSafeNotifications() {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    if (requireNativeModule) {
      const nativeMod = requireNativeModule('ExpoPushTokenManager');
      if (!nativeMod) return null;
    }
  } catch (e) {
    return null;
  }

  try {
    const Notifications = require('expo-notifications');
    if (Notifications && typeof Notifications.getPermissionsAsync === 'function') {
      return Notifications;
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Safely require expo-device only if native module is present in app binary.
 */
function getSafeDevice() {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    if (requireNativeModule) {
      const nativeMod = requireNativeModule('ExpoDevice');
      if (!nativeMod) return null;
    }
  } catch (e) {
    return null;
  }

  try {
    const Device = require('expo-device');
    if (Device && typeof Device.isDevice !== 'undefined') {
      return Device;
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Configure foreground notification behavior safely.
 */
export function configureForegroundHandler() {
  const Notifications = getSafeNotifications();
  if (!Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn('⚠️ configureForegroundHandler warning:', e);
  }
}

/**
 * Register for push notifications safely on physical devices.
 */
async function registerForPushNotificationsAsync(): Promise<string> {
  const Device = getSafeDevice();
  const Notifications = getSafeNotifications();

  if (!Device || !Notifications) {
    throw new Error(
      'Push notification native modules (expo-notifications / expo-device) not linked in this app binary build.'
    );
  }

  // Check physical device
  if (!Device.isDevice) {
    throw new Error(
      'Push notifications require a physical device (simulator/emulator is not supported).'
    );
  }

  // Android notification channel setup
  if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00B5AD',
      sound: 'default',
    });
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Notification permission was denied by user.');
  }

  // Generate push token (Expo token or direct Firebase FCM device token)
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    const tokenData = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    console.log('🔥 REAL EXPO PUSH TOKEN:', tokenData.data);
    return tokenData.data;
  } catch (tokenErr: any) {
    const msg = tokenErr?.message || '';
    console.warn('⚠️ Expo push token attempt failed, trying native Firebase FCM / APNs device token:', msg);

    // Fetch direct native Firebase FCM / APNs token
    try {
      const nativeToken = await Notifications.getDevicePushTokenAsync();
      if (nativeToken?.data) {
        const rawToken = typeof nativeToken.data === 'string' ? nativeToken.data : JSON.stringify(nativeToken.data);
        console.log('🔥 REAL NATIVE FIREBASE/APNS TOKEN:', rawToken);
        return rawToken;
      }
    } catch (devTokenErr: any) {
      console.warn('⚠️ Native device push token fetch failed:', devTokenErr?.message);
    }

    if (msg.includes('aps-environment')) {
      throw new Error(
        'iOS APNs Entitlement Missing: To test real Firebase notifications on physical iPhone:\n' +
        '1) For Android: Run on Android device/emulator (FCM works 100% out-of-the-box).\n' +
        '2) For iOS: Open app in "Expo Go" app from App Store OR rebuild native iOS app with an Apple Developer account.'
      );
    }
    throw tokenErr;
  }
}

export function usePushNotifications(): UsePushNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);
  const [notificationResponse, setNotificationResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        console.log('📱 EXPO PUSH TOKEN GENERATED SUCCESSFULLY:', token);
        setExpoPushToken(token);
        setError(null);
      })
      .catch((err: Error) => {
        console.warn('⚠️ Push notification status:', err.message);
        setError(err.message);
      });

    const Notifications = getSafeNotifications();
    if (!Notifications) return;

    try {
      if (Notifications.addNotificationReceivedListener && Notifications.addNotificationResponseReceivedListener) {
        const sub1 = Notifications.addNotificationReceivedListener((notif: any) => {
          console.log('🔔 Notification received (foreground):', notif.request?.content?.title);
          setNotification(notif);
        });

        const sub2 = Notifications.addNotificationResponseReceivedListener((response: any) => {
          console.log('👆 Notification tapped:', response.notification?.request?.content?.title);
          setNotificationResponse(response);
        });

        return () => {
          if (sub1 && sub1.remove) sub1.remove();
          if (sub2 && sub2.remove) sub2.remove();
        };
      }
    } catch (e) {
      // Safe fallback
    }
  }, []);

  return { expoPushToken, notification, notificationResponse, error };
}
