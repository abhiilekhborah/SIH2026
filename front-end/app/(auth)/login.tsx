import { useSSO } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Closes the browser popup once Google sends the user back to the app.
WebBrowser.maybeCompleteAuthSession();

const BLUE = '#1A66E8'; // logo + links
const DARK_BLUE = '#123E9E'; // Sign in button
const BORDER = '#E5E7EB';

export default function LoginScreen() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  // Email + password sign in: check the password, then start the session.
  const handleSignIn = async () => {
    // Clerk hydrates in the background, so wait until it is ready.
    if (!isLoaded) return;
    setLoading(true);

    try {
      // "identifier" and not "emailAddress": Clerk also accepts a username here.
      const attempt = await signIn.create({
        identifier: email,
        password,
      });

      if (attempt.status === 'complete') {
        // The password was right, so setActive is what logs the user in.
        await setActive({ session: attempt.createdSessionId });
        router.replace('/(tab3)/home3' as any);
      } else {
        // Clerk wants one more step from this account (2FA, password reset, ...).
        Alert.alert('Incomplete', 'Sign in did not finish.');
      }
    } catch (err: any) {
      Alert.alert('Sign in failed', err.errors?.[0]?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };
=======
  function handleSignIn() {
    // TODO: sign the user in with Clerk here.
    router.replace('/home')
  }
>>>>>>> 7215182176c8ff6f58b75cb7a75b1a7f4f36c618

  // Google sign in: opens Google in a browser popup, then starts the session.
  const handleGoogle = async () => {
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId && setActive) {
        // Google gave us a finished session, so log the user in.
<<<<<<< HEAD
        await setActiveSSO({ session: createdSessionId });
        router.replace('/(tab3)/home3' as any);
=======
        await setActive({ session: createdSessionId });
        router.replace('/home');
>>>>>>> 7215182176c8ff6f58b75cb7a75b1a7f4f36c618
      }
      // If there is no createdSessionId the user closed the popup, so do nothing.
    } catch (err: any) {
      Alert.alert('Google sign in failed', err.errors?.[0]?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <Ionicons name="medkit-outline" size={26} color={BLUE} />
          <Text style={styles.logoText}>MediQuick</Text>
        </View>

        {/* Illustration inside a rounded card */}
        <View style={styles.imageCard}>
          <Image
            source={require('@/assets/images/nurse.png')}
            style={styles.illustration}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>Welcome Back</Text>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don&apos;t have an account? </Text>
          <Link href="/signup" style={styles.link}>
            Sign up
          </Link>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#6B7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[styles.input, styles.inputSpacing]}
          placeholder="Enter Password"
          placeholderTextColor="#6B7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.forgot}>Forgot your password?</Text>

        <Pressable style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign in</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR SIGN IN WITH</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          style={styles.googleButton}
          onPress={handleGoogle}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleText}>Google</Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerLink}>Support</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLink}>Privacy Policy</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerLink}>Terms of Service</Text>
        </View>
        <Text style={styles.copyright}>
          © 2026 MediQuick Health. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: BLUE,
  },
  imageCard: {
    alignSelf: 'center',
    width: '70%',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  illustration: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 24,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  signupText: {
    fontSize: 15,
    color: '#374151',
  },
  link: {
    fontSize: 15,
    color: BLUE,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  inputSpacing: {
    marginTop: 14,
  },
  forgot: {
    fontSize: 14,
    color: BLUE,
    textAlign: 'right',
    marginTop: 14,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    borderRadius: 8,
    backgroundColor: DARK_BLUE,
    marginTop: 18,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: BORDER,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  footerLink: {
    fontSize: 14,
    color: '#0F766E',
  },
  footerDot: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  copyright: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 10,
  },
});
