import '../polyfills'
import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Slot } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NotificationProvider } from '@/components/notification-context'

// Initialize LiveKit WebRTC globals (must be called once before any LiveKit usage)

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

export default function RootLayout() {
  return (
    // Required once at the root so gestures (the slide button) work on Android.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <NotificationProvider>
          <Slot />
        </NotificationProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  )
}
