import { apiGet, apiPatch, apiPost } from './api';

/**
 * Typed client for the prescription flow:
 *   doctor issues -> patient forwards to a pharmacy -> pharmacist dispenses.
 *
 * Mirrors back-end/database/src/controller/prescriptionController.js and
 * pharmacyOrderController.js.
 */

// ─── Prescriptions ────────────────────────────────────────────────────────────

export type PrescriptionApiStatus =
  | 'created'
  | 'sent_to_pharmacy'
  | 'fulfilled'
  | 'cancelled';

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId: string | null;
  /** What the doctor typed. Always present. */
  name: string;
  /** Catalogue name when the free text matched a `medicines` row, else null. */
  catalogueName: string | null;
  form: string | null;
  strength: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  quantity: number;
}

export interface Prescription {
  id: string;
  status: PrescriptionApiStatus;
  issuedAt: string;
  validUntil: string | null;
  consultationId: string;
  patientId: string;
  patientName?: string | null;
  doctorId: string;
  doctorName?: string | null;
  doctorSpecialization?: string | null;
  doctorQualification?: string | null;
  chiefComplaint?: string | null;
  clinicalNote?: string | null;
  items: PrescriptionItem[];
}

/** One medicine as the prescribing screen collects it. */
export interface DraftMedicine {
  name: string;
  dosage?: string;
  /** The "1-0-1" / "After food" field. */
  frequency?: string;
  duration?: string;
  instructions?: string;
  /** Omit and the server infers it from frequency x duration. */
  quantity?: number;
}

export interface CreatePrescriptionInput {
  patientId: string;
  consultationId?: string;
  appointmentId?: string;
  chiefComplaint?: string;
  clinicalNote?: string;
  validUntil?: string;
  items: DraftMedicine[];
}

export const createPrescription = (input: CreatePrescriptionInput) =>
  apiPost<{ success: boolean; prescription: Prescription }>(
    '/api/v1/prescriptions',
    input
  ).then((r) => r.prescription);

export const fetchDoctorPrescriptions = (status?: PrescriptionApiStatus) =>
  apiGet<{ success: boolean; prescriptions: Prescription[] }>(
    `/api/v1/prescriptions/doctor/mine${status ? `?status=${status}` : ''}`
  ).then((r) => r.prescriptions);

export const fetchPatientPrescriptions = (status?: PrescriptionApiStatus) =>
  apiGet<{ success: boolean; prescriptions: Prescription[] }>(
    `/api/v1/prescriptions/patient/mine${status ? `?status=${status}` : ''}`
  ).then((r) => r.prescriptions);

export const fetchPrescription = (id: string) =>
  apiGet<{ success: boolean; prescription: Prescription }>(
    `/api/v1/prescriptions/${id}`
  ).then((r) => r.prescription);

export const sendPrescriptionToPharmacy = (
  prescriptionId: string,
  pharmacyId: string
) =>
  apiPost<{ success: boolean; pharmacyOrderId: string }>(
    `/api/v1/prescriptions/${prescriptionId}/send-to-pharmacy`,
    { pharmacyId }
  ).then((r) => r.pharmacyOrderId);

// ─── Pharmacies ───────────────────────────────────────────────────────────────

export interface Pharmacy {
  id: string;
  licenseNo: string;
  acceptsTeleorders: boolean;
  name: string | null;
  address: string | null;
  phone: string | null;
  villageTown: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
}

export const fetchPharmacies = () =>
  apiGet<{ success: boolean; pharmacies: Pharmacy[] }>(
    '/api/v1/pharmacies'
  ).then((r) => r.pharmacies);

// ─── Pharmacy orders ──────────────────────────────────────────────────────────

export type PharmacyOrderStatus =
  | 'pending'
  | 'accepted'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'rejected';

export type PharmacyOrderItemStatus =
  | 'pending'
  | 'partial'
  | 'dispensed'
  | 'unavailable';

export interface PharmacyOrderItem {
  id: string;
  pharmacyOrderId: string;
  prescriptionItemId: string;
  medicineId: string | null;
  substitutedMedicineId: string | null;
  quantityRequested: number;
  quantityDispensed: number;
  status: PharmacyOrderItemStatus;
  name: string;
  catalogueName: string | null;
  form: string | null;
  strength: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  /** Stock this pharmacy holds. null when the medicine never matched the catalogue. */
  availableStock: number | null;
  /** Cheapest unit price on the shelf, or null when there is no stock to price. */
  unitPrice: number | null;
}

export interface PharmacyOrder {
  id: string;
  status: PharmacyOrderStatus;
  pharmacistNotes: string | null;
  requestedAt: string;
  updatedAt: string;
  pharmacyId: string;
  prescriptionId: string;
  prescriptionStatus: PrescriptionApiStatus;
  issuedAt: string;
  validUntil: string | null;
  patientId: string;
  patientName: string | null;
  patientPhone: string | null;
  patientDob: string | null;
  patientGender: string | null;
  doctorName: string | null;
  doctorSpecialization: string | null;
  pharmacyName?: string | null;
  pharmacyPhone?: string | null;
  pharmacyAddress?: string | null;
  items: PharmacyOrderItem[];
}

/** The pharmacist's own queue. */
export const fetchPharmacyQueue = (status?: PharmacyOrderStatus) =>
  apiGet<{ success: boolean; orders: PharmacyOrder[] }>(
    `/api/v1/pharmacy-orders${status ? `?status=${status}` : ''}`
  ).then((r) => r.orders);

/** Orders the signed-in patient has sent out. */
export const fetchMyPharmacyOrders = () =>
  apiGet<{ success: boolean; orders: PharmacyOrder[] }>(
    '/api/v1/pharmacy-orders/mine'
  ).then((r) => r.orders);

export const fetchPharmacyOrder = (id: string) =>
  apiGet<{ success: boolean; order: PharmacyOrder }>(
    `/api/v1/pharmacy-orders/${id}`
  ).then((r) => r.order);

export const updatePharmacyOrderStatus = (
  id: string,
  status: PharmacyOrderStatus,
  pharmacistNotes?: string
) =>
  apiPatch<{ success: boolean; order: PharmacyOrder }>(
    `/api/v1/pharmacy-orders/${id}/status`,
    { status, ...(pharmacistNotes !== undefined && { pharmacistNotes }) }
  ).then((r) => r.order);

export interface DispenseEntry {
  orderItemId: string;
  quantity?: number;
  batchNo?: string;
  substitutedMedicineId?: string;
  /** Mark the line as out of stock instead of dispensing it. */
  unavailable?: boolean;
}

export const dispensePharmacyOrder = (id: string, items: DispenseEntry[]) =>
  apiPost<{ success: boolean; order: PharmacyOrder }>(
    `/api/v1/pharmacy-orders/${id}/dispense`,
    { items }
  ).then((r) => r.order);

export const notifyPatientAboutOrder = (id: string, message: string) =>
  apiPost<{ success: boolean }>(`/api/v1/pharmacy-orders/${id}/notify`, {
    message,
  });
