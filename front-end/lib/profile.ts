import { apiGet } from './api';

/**
 * The signed-in user and whichever role profile they hold.
 *
 * Mirrors getMyProfile in back-end userController.js. One call serves all three
 * profile screens — the caller does not have to know the role to ask.
 */

export interface AccountUser {
  id: string;
  clerkId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  dob: string | null;
  gender: string | null;
  preferredLanguage: string | null;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string | null;
  bloodGroup: string | null;
  abhaId: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  allergies: string[] | null;
  chronicConditions: string[] | null;
  address: string | null;
  villageTown: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string | null;
  specialization: string | null;
  qualification: string | null;
  licenseNo: string;
  experienceYears: number | null;
  consultationModes: string | null;
  consultationFee: string | null;
}

export interface PharmacistProfile {
  id: string;
  userId: string;
  name: string | null;
  licenseNo: string;
  pharmacyId: string | null;
}

export interface PharmacyDetails {
  id: string;
  name: string | null;
  licenseNo: string;
  address: string | null;
  phone: string | null;
  villageTown: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  acceptsTeleorders: boolean | null;
}

export type MyProfile =
  | { user: AccountUser; role: 'patient'; profile: PatientProfile }
  | { user: AccountUser; role: 'doctor'; profile: DoctorProfile }
  | {
      user: AccountUser;
      role: 'pharmacist';
      profile: PharmacistProfile;
      pharmacy: PharmacyDetails | null;
    }
  /** Signed up but never completed a role form. */
  | { user: AccountUser; role: null; profile: null };

export const fetchMyProfile = () =>
  apiGet<{ success: boolean } & MyProfile>('/api/v1/user/me');

/** Joins the parts of an address that are actually filled in. */
export function formatPlace(
  parts: Array<string | null | undefined>
): string | null {
  const place = parts.map((p) => p?.trim()).filter(Boolean).join(', ');
  return place || null;
}
