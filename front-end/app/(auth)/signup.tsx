import { useClerk, useSSO, useUser } from '@clerk/expo';
import { useSignUp } from '@clerk/expo/legacy';
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

import { ChipSelect } from '@/components/chip-select';
import { FormField } from '@/components/form-field';
import { resolveUserRoleDestination } from '@/lib/auth-helpers';
import { getOrCreateDbUserId } from '@/lib/supabase';

// Closes the browser popup once Google sends the user back to the app.
WebBrowser.maybeCompleteAuthSession();

const BLUE = '#1A66E8'; // logo + links
const DARK_BLUE = '#123E9E'; // Register button
const BORDER = '#E5E7EB';

const GENDERS = ['Male', 'Female', 'Other'];

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<string[]>([]);
  const [preferredLanguage, setPreferredLanguage] = useState('');

  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: create the account and ask Clerk to email a 6-digit code.
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email address.');
      return;
    }

    if (!password) {
      Alert.alert('Password required', 'Please enter a password.');
      return;
    }

    if (dob.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      Alert.alert(
        'Check Date of Birth',
        'Please enter date of birth in YYYY-MM-DD format (e.g. 1990-01-15).'
      );
      return;
    }

    setLoading(true);

    try {
      // Clerk stores the name in two parts, so split "Jane Doe" on the space.
      const [firstName, ...rest] = fullName.trim().split(' ');
      const lastName = rest.join(' ');

      await signUp.create({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Sign up failed', err.errors?.[0]?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: send the code back to Clerk, save user info in Supabase `users` table, and proceed to role selection.
  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });

      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });

        // Save user fields (phone, dob, gender, preferredLanguage) to Supabase `users` table
        await getOrCreateDbUserId(clerk.user || user, {
          name: fullName,
          phone,
          dob,
          gender: gender[0],
          preferredLanguage,
        });

        router.replace('/role');
      } else {
        Alert.alert('Incomplete', 'Verification did not finish.');
      }
    } catch (err: any) {
      Alert.alert('Wrong code', err.errors?.[0]?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  // Google sign up: opens Google in a browser popup, then starts the session.
  const handleGoogle = async () => {
    setLoading(true);

    try {
      const { createdSessionId, setActive: setActiveSSO } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId && setActiveSSO) {
        await setActiveSSO({ session: createdSessionId });

        // Save initial user record to Supabase `users` table
        await getOrCreateDbUserId(clerk.user || user, {
          name: fullName,
          phone,
          dob,
          gender: gender[0],
          preferredLanguage,
        });

        const targetRoute = await resolveUserRoleDestination(clerk.user || user);
        router.replace(targetRoute);
      }
    } catch (err: any) {
      Alert.alert('Google sign up failed', err.errors?.[0]?.message ?? 'Try again');
    } finally {
      setLoading(false);
    }
  };

  // While waiting for the emailed code, show the code screen instead of the form.
  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Ionicons name="medkit-outline" size={26} color={BLUE} />
          <Text style={styles.logoText}>MediQuick</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mailCircle}>
            <Ionicons name="mail-outline" size={34} color={BLUE} />
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to</Text>
          <Text style={[styles.subtitle, styles.emailHighlight]}>{email}</Text>

          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={code}
            placeholder="123456"
            placeholderTextColor="#D1D5DB"
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={setCode}
          />

          <Pressable
            style={styles.registerButton}
            onPress={onVerifyPress}
            disabled={loading}
          >
            <Text style={styles.registerText}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Wrong email? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => setPendingVerification(false)}
            >
              Go back
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Ionicons name="medkit-outline" size={26} color={BLUE} />
        <Text style={styles.logoText}>MediQuick</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Create your MediQuick account.</Text>

        <Image
          source={require('@/assets/images/patint.png')}
          style={styles.illustration}
          contentFit="contain"
        />

        {/* Account Credentials */}
        <FormField
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Jane Doe"
          autoCapitalize="words"
          required
        />

        <FormField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="jane@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />

        <FormField
          label="Create Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          autoCapitalize="none"
          required
        />

        {/* User Profile Info for Database `users` table */}
        <FormField
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
        />

        <FormField
          label="Date of Birth"
          value={dob}
          onChangeText={setDob}
          placeholder="YYYY-MM-DD (e.g. 1990-01-15)"
          hint="Date of birth in YYYY-MM-DD format"
        />

        <ChipSelect
          label="Gender"
          options={GENDERS}
          value={gender}
          onChange={setGender}
        />

        <FormField
          label="Preferred Language"
          value={preferredLanguage}
          onChangeText={setPreferredLanguage}
          placeholder="English, Hindi, etc."
          autoCapitalize="words"
        />

        <Pressable
          style={styles.registerButton}
          onPress={onSignUpPress}
          disabled={loading}
        >
          <Text style={styles.registerText}>
            {loading ? 'Creating account...' : 'Register'}
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
          <View style={styles.line} />
        </View>

        <Pressable
          style={styles.googleButton}
          onPress={handleGoogle}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" style={styles.footerLink}>
            Login
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: BLUE,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 6,
  },
  illustration: {
    width: '100%',
    height: 190,
    marginVertical: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginTop: 18,
    marginBottom: 8,
  },
  mailCircle: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emailHighlight: {
    fontWeight: '700',
    color: '#111827',
  },
  codeInput: {
    height: 62,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 10,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  registerButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: DARK_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  registerText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#374151',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: BLUE,
  },
});
