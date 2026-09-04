import React, { createContext, useContext, useState, useEffect } from 'react';

export type PrescriptionStatus = 'Pending' | 'Accepted' | 'Processing' | 'Ready' | 'Completed' | 'Rejected';

export interface PrescribedMedicine {
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
  id: string;
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
  updatePrescriptionStatus: (id: string, newStatus: PrescriptionStatus, note?: string) => void;
  updateStock: (medicineId: string, deltaOrExact: number, isExact?: boolean, reason?: string) => void;
  addNewMedicine: (item: Omit<InventoryItem, 'id' | 'status'>) => void;
  respondToAvailabilityRequest: (requestId: string, status: AvailabilityStatus, pharmacistNote?: string) => void;
  sendQuickResponse: (prescriptionId: string, replyText: string) => void;
  getMedicineStock: (medicineName: string) => number;
}

const initialPrescriptions: PrescriptionRequest[] = [
  {
    id: 'rx-1',
    rxNumber: 'RX-9042',
    patientName: 'Ramesh Chandra Sharma',
    patientAge: 48,
    patientGender: 'Male',
    patientPhone: '+91 98765 43210',
    doctorName: 'Dr. Alok Verma, MD',
    doctorHospital: 'Apex Rural District Hospital',
    date: '31 Aug 2026',
    time: '14:35',
    status: 'Pending',
    priority: 'Urgent',
    medicines: [
      {
        id: 'm1',
        name: 'Paracetamol 650mg',
        dosage: '650mg',
        frequency: '1-0-1 (After Food)',
        duration: '5 days',
        quantity: 10,
        availableStock: 444,
        pricePerUnit: 3.5,
        instructions: 'Take with warm water after lunch and dinner.',
      },
      {
        id: 'm2',
        name: 'Amoxicillin 500mg',
        dosage: '500mg',
        frequency: '1-0-1 (After Food)',
        duration: '5 days',
        quantity: 10,
        availableStock: 18,
        pricePerUnit: 12.0,
        instructions: 'Complete full 5-day antibiotic course.',
      },
      {
        id: 'm3',
        name: 'Pantoprazole 40mg',
        dosage: '40mg',
        frequency: '1-0-0 (Empty Stomach)',
        duration: '7 days',
        quantity: 7,
        availableStock: 120,
        pricePerUnit: 8.5,
        instructions: 'Take 30 mins before breakfast.',
      },
    ],
    totalAmount: 214.5,
    notes: 'Patient suffering from acute bacterial pharyngitis and fever.',
  },
  {
    id: 'rx-2',
    rxNumber: 'RX-9043',
    patientName: 'Sunita Devi',
    patientAge: 62,
    patientGender: 'Female',
    patientPhone: '+91 98231 11223',
    doctorName: 'Dr. Priya Nair, MBBS, DNB',
    doctorHospital: 'Community Health Centre',
    date: '31 Aug 2026',
    time: '14:10',
    status: 'Accepted',
    priority: 'Normal',
    medicines: [
      {
        id: 'm4',
        name: 'Metformin 500mg SR',
        dosage: '500mg',
        frequency: '1-0-1',
        duration: '30 days',
        quantity: 60,
        availableStock: 250,
        pricePerUnit: 4.2,
        instructions: 'Twice daily with meals.',
      },
      {
        id: 'm5',
        name: 'Telmisartan 40mg',
        dosage: '40mg',
        frequency: '1-0-0',
        duration: '30 days',
        quantity: 30,
        availableStock: 95,
        pricePerUnit: 6.8,
        instructions: 'Morning blood pressure management.',
      },
    ],
    totalAmount: 456.0,
    notes: 'Monthly chronic hypertension & diabetes refill.',
  },
  {
    id: 'rx-3',
    rxNumber: 'RX-9039',
    patientName: 'Anil Kumar Patil',
    patientAge: 35,
    patientGender: 'Male',
    patientPhone: '+91 97112 34567',
    doctorName: 'Dr. Suresh Rao, MD (Cardio)',
    doctorHospital: 'City General Clinic',
    date: '31 Aug 2026',
    time: '12:45',
    status: 'Processing',
    priority: 'Normal',
    medicines: [
      {
        id: 'm6',
        name: 'Azithromycin 500mg',
        dosage: '500mg',
        frequency: '1-0-0',
        duration: '3 days',
        quantity: 3,
        availableStock: 45,
        pricePerUnit: 22.0,
        instructions: 'Single daily dose 1 hour before meal.',
      },
      {
        id: 'm7',
        name: 'Cetirizine 10mg',
        dosage: '10mg',
        frequency: '0-0-1',
        duration: '5 days',
        quantity: 5,
        availableStock: 310,
        pricePerUnit: 2.0,
        instructions: 'Bedtime for allergy & rhinitis.',
      },
    ],
    totalAmount: 76.0,
    notes: 'Seasonal respiratory tract congestion.',
  },
  {
    id: 'rx-4',
    rxNumber: 'RX-9031',
    patientName: 'Pooja Agarwal',
    patientAge: 29,
    patientGender: 'Female',
    patientPhone: '+91 99887 76655',
    doctorName: 'Dr. Neha Kapoor, DGO',
    doctorHospital: 'Maternity Care Clinic',
    date: '31 Aug 2026',
    time: '11:20',
    status: 'Ready',
    priority: 'Normal',
    medicines: [
      {
        id: 'm8',
        name: 'Iron + Folic Acid Tablets',
        dosage: '100mg/1.5mg',
        frequency: '1-0-0',
        duration: '30 days',
        quantity: 30,
        availableStock: 180,
        pricePerUnit: 3.0,
        instructions: 'Post breakfast with citrus juice.',
      },
      {
        id: 'm9',
        name: 'Calcium & Vitamin D3',
        dosage: '500mg/250IU',
        frequency: '0-1-0',
        duration: '30 days',
        quantity: 30,
        availableStock: 140,
        pricePerUnit: 5.5,
        instructions: 'After lunch.',
      },
    ],
    totalAmount: 255.0,
    notes: 'Prenatal supplements packaged in airtight seal.',
  },
  {
    id: 'rx-5',
    rxNumber: 'RX-9018',
    patientName: 'Vikram Singh',
    patientAge: 54,
    patientGender: 'Male',
    patientPhone: '+91 94123 45678',
    doctorName: 'Dr. Alok Verma, MD',
    doctorHospital: 'Apex Rural District Hospital',
    date: '30 Aug 2026',
    time: '16:50',
    status: 'Completed',
    priority: 'Normal',
    medicines: [
      {
        id: 'm10',
        name: 'Atorvastatin 20mg',
        dosage: '20mg',
        frequency: '0-0-1',
        duration: '30 days',
        quantity: 30,
        availableStock: 90,
        pricePerUnit: 9.5,
        instructions: 'Bedtime lipid management.',
      },
    ],
    totalAmount: 285.0,
    notes: 'Dispensed and picked up by patient relative.',
  },
];

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

const PharmacyStoreContext = createContext<PharmacyStoreContextType | null>(null);

export function PharmacyStoreProvider({ children }: { children: React.ReactNode }) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRequest[]>(initialPrescriptions);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [availabilityRequests, setAvailabilityRequests] = useState<CustomerAvailabilityRequest[]>(initialAvailabilityRequests);
  const [alerts, setAlerts] = useState<StoreAlert[]>([]);

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

  const updatePrescriptionStatus = (id: string, newStatus: PrescriptionStatus, note?: string) => {
    setPrescriptions(prev =>
      prev.map(p => (p.id === id ? { ...p, status: newStatus, notes: note || p.notes } : p))
    );
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

  const sendQuickResponse = (prescriptionId: string, replyText: string) => {
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
