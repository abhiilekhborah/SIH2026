import { useCallback, useEffect, useState } from 'react';

import { fetchMyProfile, type MyProfile } from '@/lib/profile';

/**
 * Loads the signed-in user's account and role profile for the profile screens.
 *
 * Unlike the History hook, the error is returned rather than swallowed — a
 * profile screen showing nothing with no explanation is what sent us hunting
 * through the database last time.
 */
export function useMyProfile() {
  const [data, setData] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchMyProfile();
      const { success, ...profile } = response;
      setData(profile as MyProfile);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load your profile');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
