import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import type { EventSubscription } from 'expo-modules-core';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Shape of the notification data payload we expect from the backend.
 * Extend this as your backend sends more fields.
 */
export interface PushNotificationData {
  /** e.g. 'appointment', 'prescription', 'message', 'lab_result', 'reminder' */
  type?: string;
  /** Optional deep-link route to navigate to when tapped */
  route?: string;
  /** Any extra data from the backend */
  [key: string]: unknown;
}

export interface UsePushNotificationsResult {
  /** The Expo push token string (e.g. "ExponentPushToken[xxxxxxxxxxxxxx]") */
  expoPushToken: string | null;
  /** The most recently received notification (foreground) */
  notification: Notifications.Notification | null;
  /** The notification response when the user taps a notification */
  notificationResponse: Notifications.NotificationResponse | null;
  /** Any error encountered during registration */
  error: string | null;
}

/**
 * Configure how notifications are handled when the app is in the foreground.
 * This must be called at the module level (outside any component).
 */
export function configureForegroundHandler() {
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
 * Register for push notifications and get the Expo push token.
 * Creates Android notification channel on API 26+.
 */
async function registerForPushNotificationsAsync(): Promise<string> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    throw new Error(
      'Push notifications require a physical device. They do not work in an emulator/simulator or Expo Go.'
    );
  }

  // Create Android notification channel (required for Android 8.0+)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00B5AD',
      sound: 'default',
    });
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error(
      'Notification permission was denied. Please enable notifications in your device settings.'
    );
  }

  // Get the Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData.data;
}

/**
 * Custom hook that manages push notification registration and event listeners.
 *
 * Usage:
 * ```tsx
 * const { expoPushToken, notification, error } = usePushNotifications();
 * ```
 */
export function usePushNotifications(): UsePushNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [notificationResponse, setNotificationResponse] =
    useState<Notifications.NotificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    // Register and get token
    registerForPushNotificationsAsync()
      .then((token) => {
        console.log('📱 Expo Push Token:', token);
        setExpoPushToken(token);
      })
      .catch((err: Error) => {
        console.warn('⚠️ Push notification registration failed:', err.message);
        setError(err.message);
      });

    // Listener: notification received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notif) => {
        console.log('🔔 Notification received (foreground):', notif.request.content.title);
        setNotification(notif);
      });

    // Listener: user tapped a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('👆 Notification tapped:', response.notification.request.content.title);
        setNotificationResponse(response);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification, notificationResponse, error };
}
