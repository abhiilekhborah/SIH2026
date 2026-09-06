import type { Href } from 'expo-router';
import { supabase } from './supabase';

/**
 * Returns the router destination corresponding to a role string.
 */
export function getRoleDestination(role?: unknown): Href {
  if (typeof role !== 'string') return '/role';
  const normalized = role.toLowerCase().trim();
  if (normalized === 'patient') return '/(tabs)/home';
  if (normalized === 'doctor') return '/(tabs2)/home';
  if (normalized === 'pharmacist' || normalized === 'pharmacy') return '/(tab3)/home3';
  return '/role';
}

/**
 * Determines the destination route for a signed-in user based on their saved role.
 * 1. Checks Clerk's `unsafeMetadata.role`.
 * 2. If missing, attempts to reload Clerk user object.
 * 3. If still missing, queries Supabase DB profiles (`patient_profiles`, `doctor_profiles`, `pharmacist_profiles`) as fallback.
 * 4. Syncs inferred role back to Clerk metadata if found in DB.
 * 5. Returns the appropriate destination route.
 */
export async function resolveUserRoleDestination(
  clerkUser: any
): Promise<Href> {
  if (!clerkUser) return '/role';

  // 1. Check existing unsafeMetadata.role
  let role = clerkUser.unsafeMetadata?.role;

  // 2. If missing, try reloading Clerk user object for fresh metadata
  if (!role && typeof clerkUser.reload === 'function') {
    try {
      await clerkUser.reload();
      role = clerkUser.unsafeMetadata?.role;
    } catch (err) {
      console.warn('Could not reload Clerk user:', err);
    }
  }

  if (role) {
    return getRoleDestination(role);
  }

  // 3. Fallback: Query Supabase DB profiles if user ID exists
  if (clerkUser.id) {
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUser.id)
        .maybeSingle();

      if (dbUser?.id) {
        // Check patient_profiles
        const { data: patient } = await supabase
          .from('patient_profiles')
          .select('id')
          .eq('user_id', dbUser.id)
          .maybeSingle();

        if (patient) {
          role = 'patient';
        } else {
          // Check doctor_profiles
          const { data: doctor } = await supabase
            .from('doctor_profiles')
            .select('id')
            .eq('user_id', dbUser.id)
            .maybeSingle();

          if (doctor) {
            role = 'doctor';
          } else {
            // Check pharmacist_profiles
            const { data: pharmacist } = await supabase
              .from('pharmacist_profiles')
              .select('id')
              .eq('user_id', dbUser.id)
              .maybeSingle();

            if (pharmacist) {
              role = 'pharmacist';
            }
          }
        }

        // Sync inferred role back to Clerk unsafeMetadata if found in DB
        if (role && typeof clerkUser.updateMetadata === 'function') {
          try {
            await clerkUser.updateMetadata({ unsafeMetadata: { role } });
          } catch (syncErr) {
            console.warn('Error syncing inferred role to Clerk:', syncErr);
          }
        }
      }
    } catch (err) {
      console.warn('Error checking Supabase role fallback:', err);
    }
  }

  return getRoleDestination(role);
}
