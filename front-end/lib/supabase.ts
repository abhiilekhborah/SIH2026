import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface UserRegistrationDetails {
  name?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  preferredLanguage?: string;
}

/**
 * Maps a Clerk user to their corresponding Supabase Postgres `users` row UUID.
 * Stores/updates user registration fields (name, phone, dob, gender, preferred_language).
 */
export async function getOrCreateDbUserId(
  clerkUser: {
    id?: string;
    fullName?: string | null;
    primaryEmailAddress?: { emailAddress?: string } | null;
    emailAddresses?: Array<{ emailAddress?: string }>;
  } | null | undefined,
  details?: UserRegistrationDetails | string
): Promise<string | null> {
  if (!clerkUser?.id) return null;

  const regDetails: UserRegistrationDetails =
    typeof details === 'string' ? { name: details } : details ?? {};

  try {
    const primaryEmail =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses?.[0]?.emailAddress ??
      null;

    const payload = {
      clerk_id: clerkUser.id,
      name: regDetails.name?.trim() || clerkUser.fullName || 'User',
      email: primaryEmail,
      ...(regDetails.phone?.trim() ? { phone: regDetails.phone.trim() } : {}),
      ...(regDetails.dob?.trim() ? { dob: regDetails.dob.trim() } : {}),
      ...(regDetails.gender?.trim() ? { gender: regDetails.gender.trim() } : {}),
      ...(regDetails.preferredLanguage?.trim()
        ? { preferred_language: regDetails.preferredLanguage.trim() }
        : {}),
    };

    // Upsert user in `users` table by clerk_id
    const { data: newUser, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'clerk_id' })
      .select('id')
      .maybeSingle();

    if (error) {
      console.warn('Error upserting user into users table:', error.message);
      // Fallback: try select if upsert hit RLS or constraint warning
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUser.id)
        .maybeSingle();

      if (existingUser?.id) {
        return existingUser.id;
      }
    }

    return newUser?.id ?? null;
  } catch (err) {
    console.warn('getOrCreateDbUserId error:', err);
    return null;
  }
}
