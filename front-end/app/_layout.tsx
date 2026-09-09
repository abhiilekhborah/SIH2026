import '../polyfills'
import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Slot } from 'expo-router'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NotificationProvider } from '@/components/notification-context'
import { setAuthTokenProvider } from '@/lib/api'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ApiAuthBridge />
        <NotificationProvider>
          <Slot />
        </NotificationProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  )
}

/**
 * Hands Clerk's session-token getter to lib/api, so plain functions outside the
 * component tree (the API client, the pharmacy store) can authenticate their
 * requests. Renders nothing.
 */
function ApiAuthBridge() {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthTokenProvider(() => getToken())
    return () => setAuthTokenProvider(null)
  }, [getToken])

  return null
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
