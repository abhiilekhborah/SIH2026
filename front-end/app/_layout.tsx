import '../polyfills'
import { useEffect } from 'react'
import { ClerkProvider, useUser } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Slot, useRouter } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NotificationProvider, useNotifications, getNotificationIcon } from '@/components/notification-context'
import {
  usePushNotifications,
  configureForegroundHandler,
} from '@/hooks/usePushNotifications'
import { savePushToken } from '@/lib/push-token-store'
import { getOrCreateDbUserId } from '@/lib/supabase'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

// Configure how foreground notifications are displayed — must be at module level
configureForegroundHandler()

/**
 * Inner component that has access to both Clerk and Notification contexts.
 * Handles push notification registration and wiring incoming notifications
 * into the in-app notification panel.
 */
function PushNotificationBridge() {
  const { expoPushToken, notification } = usePushNotifications()
  const { addNotification, setExpoPushToken } = useNotifications()
  const { user } = useUser()
  const router = useRouter()

  // Store the push token in the notification context
  useEffect(() => {
    if (expoPushToken) {
      setExpoPushToken(expoPushToken)
    }
  }, [expoPushToken, setExpoPushToken])

  // Save push token to Supabase when both token and user are available
  useEffect(() => {
    if (!expoPushToken || !user) return

    ;(async () => {
      const dbUserId = await getOrCreateDbUserId(user)
      if (dbUserId) {
        await savePushToken(dbUserId, expoPushToken)
      }
    })()
  }, [expoPushToken, user])

  // When a push notification arrives in the foreground, add it to the panel
  useEffect(() => {
    if (!notification) return

    const content = notification.request.content
    const data = content.data as Record<string, unknown> | undefined
    const notifType = (data?.type as string) ?? 'default'
    const { icon, iconColor } = getNotificationIcon(notifType)

    addNotification({
      id: notification.request.identifier,
      icon,
      iconColor,
      title: content.title ?? 'New Notification',
      description: content.body ?? '',
      time: 'Just now',
    })
  }, [notification, addNotification])

  // This component renders nothing — it's purely a side-effect bridge
  return null
}

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Clerk Key Required</Text>
          <Text style={styles.message}>
            Please add your Clerk Publishable Key to your <Text style={styles.code}>.env</Text> file:
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
            </Text>
          </View>
          <Text style={styles.hint}>
            After adding the key in <Text style={styles.code}>.env</Text>, restart Expo with <Text style={styles.code}>npx expo start -c</Text>
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    // Required once at the root so gestures (the slide button) work on Android.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <NotificationProvider>
          <PushNotificationBridge />
          <Slot />
        </NotificationProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F87171',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#CBD5E1',
    lineHeight: 22,
    marginBottom: 16,
  },
  codeBlock: {
    backgroundColor: '#090D16',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  codeText: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  hint: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  code: {
    fontFamily: 'monospace',
    color: '#F1F5F9',
    fontWeight: '600',
  },
})
