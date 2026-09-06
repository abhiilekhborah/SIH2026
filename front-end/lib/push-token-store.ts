import { supabase } from './supabase';
import { Platform } from 'react-native';

/**
 * Upserts a device push token into Supabase `user_push_tokens` table.
 *
 * Table schema (create this in Supabase SQL editor):
 * ```sql
 * CREATE TABLE IF NOT EXISTS user_push_tokens (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *   expo_push_token TEXT NOT NULL,
 *   platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
 *   device_name TEXT,
 *   is_active BOOLEAN DEFAULT true,
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE (user_id, expo_push_token)
 * );
 *
 * -- Index for fast lookups by user
 * CREATE INDEX idx_user_push_tokens_user_id ON user_push_tokens(user_id);
 *
 * -- Enable RLS
 * ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;
 *
 * -- Policy: users can manage their own tokens
 * CREATE POLICY "Users can manage own tokens"
 *   ON user_push_tokens FOR ALL
 *   USING (true)
 *   WITH CHECK (true);
 * ```
 */

/**
 * Save or update the device's push token in Supabase, linked to a user.
 * Call this after both the push token and the DB user ID are available.
 */
export async function savePushToken(
  userId: string,
  expoPushToken: string,
  deviceName?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('user_push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: expoPushToken,
        platform: Platform.OS, // 'ios' or 'android'
        device_name: deviceName ?? `${Platform.OS} device`,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,expo_push_token' }
    );

    if (error) {
      console.warn('⚠️ Failed to save push token to Supabase:', error.message);
    } else {
      console.log('✅ Push token saved to Supabase for user:', userId);
    }
  } catch (err) {
    console.warn('⚠️ savePushToken error:', err);
  }
}

/**
 * Deactivate a push token (e.g. on logout or when the user disables notifications).
 */
export async function deactivatePushToken(
  userId: string,
  expoPushToken: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('expo_push_token', expoPushToken);

    if (error) {
      console.warn('⚠️ Failed to deactivate push token:', error.message);
    } else {
      console.log('🔕 Push token deactivated for user:', userId);
    }
  } catch (err) {
    console.warn('⚠️ deactivatePushToken error:', err);
  }
}

/**
 * Remove all push tokens for a user (e.g. on account deletion).
 */
export async function removeAllPushTokens(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_push_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.warn('⚠️ Failed to remove push tokens:', error.message);
    }
  } catch (err) {
    console.warn('⚠️ removeAllPushTokens error:', err);
  }
}
