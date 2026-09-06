import { Platform } from 'react-native';
import { supabase } from './supabase';

/**
 * Supabase persistence for device push tokens.
 *
 * This module is deliberately dependency-free apart from the Supabase client —
 * it must not import from `utils/pushNotification` or `hooks/usePushNotifications`,
 * because those import from here (that would create a require cycle).
 *
 * Run `notification-test-engine/sql/001_device_push_tokens.sql` in the Supabase
 * SQL editor before using any of this.
 */

export type PushTokenType = 'fcm' | 'apns' | 'expo';
export type UserRole = 'patient' | 'doctor' | 'pharmacist';
export type PushPlatform = 'ios' | 'android' | 'web';

export interface DeviceTokenRecord {
  userId: string;
  role: UserRole;
  token: string;
  tokenType: PushTokenType;
  platform: PushPlatform;
  deviceName?: string;
}

/** Mask a token for logging — never print the full value. */
export function maskToken(token: string): string {
  if (!token) return '(empty)';
  return token.length > 14 ? `${token.slice(0, 8)}…${token.slice(-6)}` : '***';
}

/**
 * Upsert this device's native push token into `device_push_tokens`.
 *
 * The table is keyed by the token itself, so reinstalling the app or handing the
 * phone to a different account re-points the existing row instead of piling up
 * stale duplicates that would later bounce with `Unregistered`.
 */
export async function saveDeviceToken(record: DeviceTokenRecord): Promise<boolean> {
  const { userId, role, token, tokenType, platform, deviceName } = record;

  if (!userId || !token) {
    console.warn('⚠️ [push] saveDeviceToken called without a userId or token.');
    return false;
  }

  try {
    const { error } = await supabase.from('device_push_tokens').upsert(
      {
        user_id: userId,
        role,
        token,
        token_type: tokenType,
        platform,
        device_name: deviceName ?? `${Platform.OS} device`,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );

    if (error) {
      if (error.message?.includes('device_push_tokens')) {
        console.warn(
          '⚠️ [push] Table "device_push_tokens" is missing. Run notification-test-engine/sql/001_device_push_tokens.sql in the Supabase SQL editor.'
        );
      } else {
        console.warn('⚠️ [push] Failed to save device token:', error.message);
      }
      return false;
    }

    console.log(`✅ [push] Saved ${tokenType.toUpperCase()} token ${maskToken(token)} for ${role} ${userId}`);
    return true;
  } catch (err) {
    console.warn('⚠️ [push] saveDeviceToken error:', err);
    return false;
  }
}

/**
 * Mirror the token onto `patient_profiles` / `doctor_profiles`.
 *
 * Kept so the older backend lookup path keeps working; `device_push_tokens` is
 * the source of truth. Pharmacists have no profile table, so they are skipped.
 * Failures here are non-fatal by design — a missing column must not stop the
 * primary write above from counting as success.
 */
export async function mirrorTokenToProfile(
  userId: string,
  role: UserRole,
  token: string,
  tokenType: PushTokenType
): Promise<boolean> {
  if (role === 'pharmacist') return false;

  const targetTable = role === 'patient' ? 'patient_profiles' : 'doctor_profiles';

  try {
    const { data, error } = await supabase
      .from(targetTable)
      .update({ fcm_token: token, push_token_type: tokenType })
      .eq('user_id', userId)
      .select('id');

    if (error) {
      console.warn(`⚠️ [push] Could not mirror token to ${targetTable}:`, error.message);
      return false;
    }

    if (!data || data.length === 0) {
      // No profile row yet — normal for a user who hasn't completed onboarding.
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`⚠️ [push] mirrorTokenToProfile error:`, err);
    return false;
  }
}

/**
 * Deactivate this device's token — call on logout so a signed-out phone stops
 * receiving pushes meant for the account that used to be on it.
 */
export async function deactivateDeviceToken(token: string): Promise<void> {
  if (!token) return;

  try {
    const { error } = await supabase
      .from('device_push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('token', token);

    if (error) {
      console.warn('⚠️ [push] Failed to deactivate token:', error.message);
      return;
    }

    console.log('🔕 [push] Deactivated token', maskToken(token));
  } catch (err) {
    console.warn('⚠️ [push] deactivateDeviceToken error:', err);
  }
}

/** Deactivate every token belonging to a user (all their devices). */
export async function deactivateAllUserTokens(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('device_push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) console.warn('⚠️ [push] Failed to deactivate user tokens:', error.message);
  } catch (err) {
    console.warn('⚠️ [push] deactivateAllUserTokens error:', err);
  }
}
