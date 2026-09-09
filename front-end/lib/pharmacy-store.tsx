import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import {
  fetchPharmacyQueue,
  notifyPatientAboutOrder,
  updatePharmacyOrderStatus,
  type PharmacyOrder,
  type PharmacyOrderStatus,
} from '@/lib/prescriptions';

export type PrescriptionStatus = 'Pending' | 'Accepted' | 'Processing' | 'Ready' | 'Completed' | 'Rejected';

export interface PrescribedMedicine {
  /** pharmacy_order_items.id — what POST /pharmacy-orders/:id/dispense expects. */
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. '1-0-1'
  duration: string;  // e.g. '5 days'
  quantity: number;
  availableStock: number;
  pricePerUnit: number;
  instructions: string;
}

export interface PrescriptionRequest {
  /** pharmacy_orders.id */
  id: string;
  prescriptionId?: string;
  rxNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  doctorName: string;
  doctorHospital: string;
  date: string;
  time: string;
  status: PrescriptionStatus;
  priority: 'Urgent' | 'Normal';
  medicines: PrescribedMedicine[];
  scannedImageUrl?: string;
  totalAmount: number;
  notes?: string;
  quickReplySent?: string;
}

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';

export interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: 'Antibiotics' | 'Analgesics' | 'Chronic Care' | 'Cold Chain' | 'First Aid' | 'Supplements';
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops';
  sku: string;
  batchNumber: string;
  currentStock: number;
  minThreshold: number;
  unitPrice: number;
  rackLocation: string;
  expiryDate: string; // YYYY-MM-DD
  status: StockStatus;
  requiresColdChain?: boolean;
}

export type AvailabilityStatus = 'Pending' | 'Available' | 'Not Available' | 'Partially Available';

export interface CustomerAvailabilityRequest {
  id: string;
  requestId: string;
  customerName: string;
  customerPhone: string;
  customerDistance: string; // e.g. '1.2 km away'
  medicineName: string;
  requestedQuantity: number;
  currentStock: number;
  status: AvailabilityStatus;
  timestamp: string;
  pharmacistNote?: string;
}

export interface StoreAlert {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  time: string;
  actionText?: string;
  relatedId?: string;
  category: 'stock' | 'expiry' | 'rx' | 'coldchain';
}

export interface PharmacyStoreContextType {
  prescriptions: PrescriptionRequest[];
  inventory: InventoryItem[];
  availabilityRequests: CustomerAvailabilityRequest[];
  alerts: StoreAlert[];
  prescriptionsLoading: boolean;
  prescriptionsError: string | null;
  refreshPrescriptions: () => Promise<void>;
  updatePrescriptionStatus: (id: string, newStatus: PrescriptionStatus, note?: string) => Promise<void>;
  updateStock: (medicineId: string, deltaOrExact: number, isExact?: boolean, reason?: string) => void;
  addNewMedicine: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
  respondToAvailabilityRequest: (requestId: string, status: AvailabilityStatus, pharmacistNote?: string) => void;
  sendQuickResponse: (prescriptionId: string, replyText: string) => Promise<void>;
  getMedicineStock: (medicineName: string) => number;
}

const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Paracetamol 650mg (Dolo 650)',
    brand: 'Micro Labs',
    category: 'Analgesics',
    form: 'Tablet',
    sku: 'MED-PCM-650',
    batchNumber: 'BT-8821',
    currentStock: 444,
    minThreshold: 100,
    unitPrice: 3.5,
    rackLocation: 'Rack A-1',
    expiryDate: '2027-11-30',
    status: 'In Stock',
  },
  {
    id: 'inv-2',
    name: 'Amoxicillin + Clavulanic Acid 625mg (Augmentin)',
    brand: 'GSK Pharma',
    category: 'Antibiotics',
    form: 'Tablet',
    sku: 'MED-AMX-625',
    batchNumber: 'BT-4309',
    currentStock: 18,
    minThreshold: 40,
    unitPrice: 24.5,
    rackLocation: 'Rack B-2',
    expiryDate: '2026-09-15',
    status: 'Low Stock',
  },
  {
    id: 'inv-3',
    name: 'Human Insulin Glargine 100IU/ml (Lantus)',
    brand: 'Sanofi',
    category: 'Cold Chain',
    form: 'Injection',
    sku: 'MED-INS-100',
    batchNumber: 'BT-9102',
    currentStock: 8,
    minThreshold: 15,
    unitPrice: 680.0,
    rackLocation: 'Cold Storage Unit 1 (2-8°C)',
    expiryDate: '2026-09-10',
    status: 'Expiring Soon',
    requiresColdChain: true,
  },
  {
    id: 'inv-4',
    name: 'Azithromycin 500mg (Azee 500)',
    brand: 'Cipla Ltd',
    category: 'Antibiotics',
    form: 'Tablet',
    sku: 'MED-AZI-500',
    batchNumber: 'BT-7721',
    currentStock: 45,
    minThreshold: 30,
    unitPrice: 22.0,
    rackLocation: 'Rack B-3',
    expiryDate: '2027-04-30',
    status: 'In Stock',
  },
  {
    id: 'inv-5',
    name: 'Metformin 500mg SR (Glycomet 500)',
    brand: 'USV Pvt Ltd',
    category: 'Chronic Care',
    form: 'Tablet',
    sku: 'MED-MET-500',
    batchNumber: 'BT-6612',
    currentStock: 250,
    minThreshold: 80,
    unitPrice: 4.2,
    rackLocation: 'Rack C-1',
    expiryDate: '2028-01-31',
    status: 'In Stock',
  },
  {
    id: 'inv-6',
    name: 'Telmisartan 40mg (Telma 40)',
    brand: 'Glenmark',
    category: 'Chronic Care',
    form: 'Tablet',
    sku: 'MED-TEL-040',
    batchNumber: 'BT-3329',
    currentStock: 95,
    minThreshold: 50,
    unitPrice: 6.8,
    rackLocation: 'Rack C-2',
    expiryDate: '2027-08-31',
    status: 'In Stock',
  },
  {
    id: 'inv-7',
    name: 'ORS Electrolyte Powder 21.8g (Electral)',
    brand: 'FDC Limited',
    category: 'First Aid',
    form: 'Syrup',
    sku: 'MED-ORS-021',
    batchNumber: 'BT-1029',
    currentStock: 0,
    minThreshold: 50,
    unitPrice: 22.5,
    rackLocation: 'Rack D-1',
    expiryDate: '2027-06-30',
    status: 'Out of Stock',
  },
  {
    id: 'inv-8',
    name: 'Pantoprazole 40mg (Pan 40)',
    brand: 'Alkem Labs',
    category: 'Analgesics',
    form: 'Tablet',
    sku: 'MED-PAN-040',
    batchNumber: 'BT-5541',
    currentStock: 120,
    minThreshold: 40,
    unitPrice: 8.5,
    rackLocation: 'Rack A-3',
    expiryDate: '2027-10-31',
    status: 'In Stock',
  },
  {
    id: 'inv-9',
    name: 'Cefixime 200mg (Zifi 200)',
    brand: 'FDC Limited',
    category: 'Antibiotics',
    form: 'Tablet',
    sku: 'MED-CEF-200',
    batchNumber: 'BT-2201',
    currentStock: 14,
    minThreshold: 35,
    unitPrice: 16.0,
    rackLocation: 'Rack B-1',
    expiryDate: '2026-09-20',
    status: 'Low Stock',
  },
];

const initialAvailabilityRequests: CustomerAvailabilityRequest[] = [
  {
    id: 'req-1',
    requestId: 'REQ-8821',
    customerName: 'Amit Roy',
    customerPhone: '+91 98112 99881',
    customerDistance: '0.8 km away',
    medicineName: 'Azithromycin 500mg',
    requestedQuantity: 2,
    currentStock: 45,
    status: 'Pending',
    timestamp: '14:48 (12 mins ago)',
  },
  {
    id: 'req-2',
    requestId: 'REQ-8820',
    customerName: 'Deepa Sen',
    customerPhone: '+91 97722 33441',
    customerDistance: '1.4 km away',
    medicineName: 'Human Insulin Glargine',
    requestedQuantity: 1,
    currentStock: 8,
    status: 'Pending',
    timestamp: '14:32 (28 mins ago)',
  },
  {
    id: 'req-3',
    requestId: 'REQ-8819',
    customerName: 'Mohd. Farhan',
    customerPhone: '+91 99123 77665',
    customerDistance: '2.1 km away',
    medicineName: 'ORS Electrolyte Sachet',
    requestedQuantity: 6,
    currentStock: 0,
    status: 'Not Available',
    timestamp: '13:50 (1 hour ago)',
    pharmacistNote: 'Currently out of stock. New batch arriving tomorrow morning.',
  },
  {
    id: 'req-4',
    requestId: 'REQ-8815',
    customerName: 'Kavita Das',
    customerPhone: '+91 94331 22889',
    customerDistance: '0.5 km away',
    medicineName: 'Paracetamol 650mg',
    requestedQuantity: 10,
    currentStock: 444,
    status: 'Available',
    timestamp: '12:15 (2 hours ago)',
    pharmacistNote: 'In stock! Reserved for pickup until 7 PM.',
  },
];

function calculateStatus(stock: number, minThreshold: number, expiryDate: string): StockStatus {
  if (stock <= 0) return 'Out of Stock';
  const today = new Date('2026-08-31');
  const exp = new Date(expiryDate);
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return 'Expiring Soon';
  if (stock <= minThreshold) return 'Low Stock';
  return 'In Stock';
}

/**
 * Turns a pharmacy order from the API into the shape the pharmacist screens
 * already render.
 */
function toPrescriptionRequest(order: PharmacyOrder): PrescriptionRequest {
  const requested = new Date(order.requestedAt);

  const medicines: PrescribedMedicine[] = order.items.map(item => ({
    id: item.id,
    name: item.catalogueName ?? item.name,
    dosage: item.dosage,
    frequency: item.frequency,
    duration: item.duration,
    quantity: item.quantityRequested,
    availableStock: item.availableStock ?? 0,
    pricePerUnit: item.unitPrice ?? 0,
    instructions: item.instructions ?? '',
  }));

  const totalAmount = medicines.reduce(
    (sum, medicine) => sum + medicine.quantity * medicine.pricePerUnit,
    0
  );

  return {
    id: order.id,
    prescriptionId: order.prescriptionId,
    rxNumber: `RX-${order.prescriptionId.slice(0, 6).toUpperCase()}`,
    patientName: order.patientName ?? 'Patient',
    patientAge: ageFromDob(order.patientDob),
    patientGender: toGender(order.patientGender),
    patientPhone: order.patientPhone ?? '',
    doctorName: order.doctorName ? `Dr. ${order.doctorName}` : 'Doctor',
    doctorHospital: order.doctorSpecialization ?? 'MediQuick',
    date: requested.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: requested.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: toUiStatus(order.status),
    // Anything still unanswered after a day needs chasing.
    priority: order.status === 'pending' && Date.now() - requested.getTime() > 86_400_000
      ? 'Urgent'
      : 'Normal',
    medicines,
    totalAmount: Math.round(totalAmount * 100) / 100,
    notes: order.pharmacistNotes ?? undefined,
  };
}

/** 'pending' -> 'Pending'. The two vocabularies are otherwise identical. */
function toUiStatus(status: PharmacyOrderStatus): PrescriptionStatus {
  return (status.charAt(0).toUpperCase() + status.slice(1)) as PrescriptionStatus;
}

function ageFromDob(dob: string | null): number {
  if (!dob) return 0;
  const born = new Date(dob);
  if (Number.isNaN(born.getTime())) return 0;

  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();
  const monthDelta = now.getMonth() - born.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < born.getDate())) age -= 1;

  return Math.max(age, 0);
}

function toGender(gender: string | null): PrescriptionRequest['patientGender'] {
  const value = gender?.toLowerCase();
  if (value === 'male') return 'Male';
  if (value === 'female') return 'Female';
  return 'Other';
}

const PharmacyStoreContext = createContext<PharmacyStoreContextType | null>(null);

export function PharmacyStoreProvider({ children }: { children: React.ReactNode }) {
  // The prescription queue is live: it is whatever patients have sent to this
  // pharmacy. Inventory and availability requests are still local mock data.
  const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [prescriptionsError, setPrescriptionsError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [availabilityRequests, setAvailabilityRequests] = useState<CustomerAvailabilityRequest[]>(initialAvailabilityRequests);
  const [alerts, setAlerts] = useState<StoreAlert[]>([]);

  const refreshPrescriptions = useCallback(async () => {
    setPrescriptionsLoading(true);
    try {
      const orders = await fetchPharmacyQueue();
      setPrescriptions(orders.map(toPrescriptionRequest));
      setPrescriptionsError(null);
    } catch (err: any) {
      setPrescriptionsError(err?.message ?? 'Could not load the prescription queue');
    } finally {
      setPrescriptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPrescriptions();
  }, [refreshPrescriptions]);

  // Compute live alerts based on inventory & pending prescriptions
  useEffect(() => {
    const generatedAlerts: StoreAlert[] = [];

    // Low stock alerts
    const lowStockItems = inventory.filter(i => i.currentStock > 0 && i.currentStock <= i.minThreshold);
    if (lowStockItems.length > 0) {
      generatedAlerts.push({
        id: 'alert-low-stock',
        title: `Low Stock: ${lowStockItems[0].name}`,
        message: `${lowStockItems[0].currentStock} units remaining (Threshold: ${lowStockItems[0].minThreshold}). Need immediate stockup!`,
        type: 'warning',
        time: 'Active Alert',
        actionText: 'Update Stock',
        relatedId: lowStockItems[0].id,
        category: 'stock',
      });
    }

    // Expiring soon alerts
    const expiringItems = inventory.filter(i => {
      const today = new Date('2026-08-31');
      const exp = new Date(i.expiryDate);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    });
    if (expiringItems.length > 0) {
      generatedAlerts.push({
        id: 'alert-expiry',
        title: `Expiring Soon: ${expiringItems[0].name}`,
        message: `Batch ${expiringItems[0].batchNumber} expires on ${expiringItems[0].expiryDate}. Prioritize dispensing or return to distributor.`,
        type: 'danger',
        time: 'Urgent',
        actionText: 'View Batch',
        relatedId: expiringItems[0].id,
        category: 'expiry',
      });
    }

    // Pending prescriptions
    const urgentRx = prescriptions.filter(p => p.status === 'Pending');
    if (urgentRx.length > 0) {
      generatedAlerts.push({
        id: 'alert-rx-pending',
        title: `${urgentRx.length} Pending Prescription${urgentRx.length > 1 ? 's' : ''}`,
        message: `Patient ${urgentRx[0].patientName} is waiting for verification and dispensing.`,
        type: 'info',
        time: '5 mins ago',
        actionText: 'Review Rx',
        relatedId: urgentRx[0].id,
        category: 'rx',
      });
    }

    // Cold chain alert
    const coldChainItems = inventory.filter(i => i.requiresColdChain);
    if (coldChainItems.length > 0) {
      generatedAlerts.push({
        id: 'alert-coldchain',
        title: 'Cold Storage Unit 1 OK (3.8°C)',
        message: 'Temperature in safe range (2°C - 8°C). Monitoring Lantus Insulin & Tetanus Toxoid.',
        type: 'success',
        time: 'Just now',
        actionText: 'Check Log',
        relatedId: 'cold-1',
        category: 'coldchain',
      });
    }

    setAlerts(generatedAlerts);
  }, [inventory, prescriptions]);

  const updatePrescriptionStatus = async (id: string, newStatus: PrescriptionStatus, note?: string) => {
    const previous = prescriptions;

    // Move the card immediately, then roll back if the server disagrees.
    setPrescriptions(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus, notes: note || p.notes } : p))
    );

    try {
      const updated = await updatePharmacyOrderStatus(
        id,
        newStatus.toLowerCase() as PharmacyOrderStatus,
        note
      );
      setPrescriptions(prev =>
        prev.map(p => (p.id === id ? { ...p, status: toUiStatus(updated.status) } : p))
      );
    } catch (err) {
      setPrescriptions(previous);
      throw err;
    }
  };

  const updateStock = (medicineId: string, deltaOrExact: number, isExact = false, reason?: string) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id !== medicineId && item.name !== medicineId && item.sku !== medicineId) return item;
        const newQty = Math.max(0, isExact ? deltaOrExact : item.currentStock + deltaOrExact);
        return {
          ...item,
          currentStock: newQty,
          status: calculateStatus(newQty, item.minThreshold, item.expiryDate),
        };
      })
    );
  };

  const addNewMedicine = (item: Omit<InventoryItem, 'id' | 'status'>) => {
    const id = `inv-${Date.now()}`;
    const status = calculateStatus(item.currentStock, item.minThreshold, item.expiryDate);
    setInventory(prev => [
      {
        ...item,
        id,
        status,
      },
      ...prev,
    ]);
  };

  const respondToAvailabilityRequest = (requestId: string, status: AvailabilityStatus, pharmacistNote?: string) => {
    setAvailabilityRequests(prev =>
      prev.map(r => (r.id === requestId || r.requestId === requestId ? { ...r, status, pharmacistNote } : r))
    );
  };

  const sendQuickResponse = async (prescriptionId: string, replyText: string) => {
    await notifyPatientAboutOrder(prescriptionId, replyText);
    setPrescriptions(prev =>
      prev.map(p => (p.id === prescriptionId ? { ...p, quickReplySent: replyText } : p))
    );
  };

  const getMedicineStock = (medicineName: string): number => {
    const found = inventory.find(i => i.name.toLowerCase().includes(medicineName.toLowerCase()) || medicineName.toLowerCase().includes(i.name.toLowerCase()));
    return found ? found.currentStock : 0;
  };

  return (
    <PharmacyStoreContext.Provider
      value={{
        prescriptions,
        prescriptionsLoading,
        prescriptionsError,
        refreshPrescriptions,
        inventory,
        availabilityRequests,
        alerts,
        updatePrescriptionStatus,
        updateStock,
        addNewMedicine,
        respondToAvailabilityRequest,
        sendQuickResponse,
        getMedicineStock,
      }}
    >
      {children}
    </PharmacyStoreContext.Provider>
  );
}

export function usePharmacyStore() {
  const context = useContext(PharmacyStoreContext);
  if (!context) {
    throw new Error('usePharmacyStore must be used within a PharmacyStoreProvider');
  }
  return context;
}
