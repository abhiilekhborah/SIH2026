import { GetStartedButton } from '@/components/get-started-button';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLUE = '#1A66E8';

export default function GetStartedScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  // Clerk is still reading the saved session out of storage, so show a spinner.
  // Without this the screen would flash before a signed in user is sent to /home.
  if (!isLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  // Already signed in, so skip this screen completely.
  // This has to be a returned <Redirect>, not router.replace(): calling
  // replace() here would navigate while React is still rendering.
  if (isSignedIn) {
    return <Redirect href="/(tabs)/home" />;
  }

  function handleGetStarted() {
    router.push('/signup');
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <Ionicons name="medkit-outline" size={26} color={BLUE} />
        <Text style={styles.logoText}>MediQuick</Text>
      </View>

      {/* Illustration */}
      <Image
        source={require('@/assets/images/screen.png')}
        style={styles.illustration}
        contentFit="contain"
      />

      {/* Headline + description */}
      <Text style={styles.title}>Discover and{'\n'}improve your health.</Text>
      <Text style={styles.subtitle}>
        Access world-class medical professionals and secure health tracking at your
        fingertips. Start your journey with MediQuick today.
      </Text>

      {/* Slide the arrow to the right to continue */}
      <View style={styles.buttonWrapper}>
        <GetStartedButton onSlideComplete={handleGetStarted} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: BLUE,
  },
  illustration: {
    flex: 1,
    width: '100%',
    marginVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
  },
  buttonWrapper: {
    marginTop: 32,
    marginBottom: 24,
  },
});
