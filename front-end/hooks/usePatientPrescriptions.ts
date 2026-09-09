import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/lib/api';
import {
  fetchPatientPrescriptions,
  type Prescription as ApiPrescription,
} from '@/lib/prescriptions';

/**
 * Shape the patient History screen renders. Kept separate from the API type so
 * the screen's existing markup keeps working unchanged.
 */
export interface PatientPrescription {
  id: string;
  doctorName: string;
  facility: string;
  date: string;
  medicineCount: number;
  status: 'active' | 'completed' | 'expired';
  /** Present only once forwarded, so the screen can show where it went. */
  apiStatus: ApiPrescription['status'];
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
}

/**
 * Loads the signed-in patient's prescriptions.
 *
 * Returns an empty list rather than throwing when the request fails — the
 * History screen is a read-only summary and a network blip should not blank it
 * out with an error state.
 */
export function usePatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const base = process.env.EXPO_PUBLIC_API_URL ?? '(unset -> localhost:3000)';
    console.log('[usePatientPrescriptions] GET', `${base}/api/v1/prescriptions/patient/mine`);
    try {
      const rows = await fetchPatientPrescriptions();
      setPrescriptions(rows.map(toPatientPrescription));
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { prescriptions, loading, error, reload: load };
}

function toPatientPrescription(row: ApiPrescription): PatientPrescription {
  const expired = row.validUntil ? new Date(row.validUntil) < new Date() : false;

  return {
    id: row.id,
    doctorName: row.doctorName ? `Dr. ${row.doctorName}` : 'Your doctor',
    facility: row.doctorSpecialization ?? 'MediQuick',
    date: formatDate(row.issuedAt),
    medicineCount: row.items.length,
    status: expired ? 'expired' : row.status === 'fulfilled' ? 'completed' : 'active',
    apiStatus: row.status,
    medicines: row.items.map((item) => ({
      name: item.catalogueName ?? item.name,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions ?? '—',
    })),
  };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
