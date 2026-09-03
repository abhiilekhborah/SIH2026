import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useCallback } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────

type CategoryId = 'consultations' | 'visits' | 'prescriptions' | 'diagnostics' | 'referrals' | 'appointments';

interface Consultation {
  id: string;
  doctorName: string;
  specialty: string;
  facility: string;
  date: string;
  type: 'in-person' | 'audio' | 'video';
  status: 'completed' | 'follow-up';
  summary?: string;
}

interface HealthcareVisit {
  id: string;
  facility: string;
  department: string;
  date: string;
  doctor?: string;
  status: 'completed' | 'ongoing' | 'scheduled';
  visitType: string;
}

interface Prescription {
  id: string;
  doctorName: string;
  facility: string;
  date: string;
  medicineCount: number;
  status: 'active' | 'completed' | 'expired';
  medicines: { name: string; dosage: string; frequency: string; duration: string; instructions: string }[];
}

interface Diagnostic {
  id: string;
  testName: string;
  facility: string;
  date: string;
  resultStatus: 'report_available' | 'pending' | 'requires_review';
  reportAvailable: boolean;
  details?: string;
}

interface Referral {
  id: string;
  referringDoctor: string;
  referringFacility: string;
  referredFacility: string;
  department: string;
  date: string;
  status: 'created' | 'accepted' | 'appointment_scheduled' | 'completed' | 'follow_up_pending' | 'cancelled';
  timeline: { step: string; date: string; done: boolean }[];
}

interface Appointment {
  id: string;
  doctor: string;
  facility: string;
  department: string;
  date: string;
  time: string;
  type: string;
  status: 'completed' | 'missed' | 'cancelled' | 'rescheduled';
}

// ─── Mock Data ────────────────────────────────────────────────────────

const MOCK_CONSULTATIONS: Consultation[] = [
  { id: 'c1', doctorName: 'Dr. Priya Sharma', specialty: 'General Medicine', facility: 'Community Health Center', date: '29 Aug 2026', type: 'in-person', status: 'completed', summary: 'Routine checkup. BP 120/80. Advised to continue current medication.' },
  { id: 'c2', doctorName: 'Dr. Rajesh Kumar', specialty: 'Cardiology', facility: 'District Hospital', date: '15 Aug 2026', type: 'in-person', status: 'follow-up', summary: 'ECG normal. Follow-up in 3 months. Continue statins.' },
  { id: 'c3', doctorName: 'Dr. Anita Desai', specialty: 'Dermatology', facility: 'City Medical Center', date: '2 Aug 2026', type: 'video', status: 'completed', summary: 'Skin rash diagnosed as eczema. Prescribed topical cream.' },
  { id: 'c4', doctorName: 'Dr. Suresh Patel', specialty: 'Orthopedics', facility: 'PHC Sector 5', date: '20 Jul 2026', type: 'in-person', status: 'completed', summary: 'Knee pain. X-ray normal. Physiotherapy recommended.' },
  { id: 'c5', doctorName: 'Dr. Priya Sharma', specialty: 'General Medicine', facility: 'Community Health Center', date: '1 Jul 2026', type: 'audio', status: 'completed', summary: 'Blood sugar review. HbA7.2. Dosage adjusted.' },
];

const MOCK_VISITS: HealthcareVisit[] = [
  { id: 'v1', facility: 'Community Health Center', department: 'General OPD', date: '29 Aug 2026', doctor: 'Dr. Priya Sharma', status: 'completed', visitType: 'Outpatient' },
  { id: 'v2', facility: 'District Hospital', department: 'Cardiology', date: '15 Aug 2026', doctor: 'Dr. Rajesh Kumar', status: 'completed', visitType: 'Outpatient' },
  { id: 'v3', facility: 'Primary Health Sub-Center', department: 'Maternal Health', date: '10 Aug 2026', status: 'completed', visitType: 'Checkup' },
  { id: 'v4', facility: 'City Medical Center', department: 'Dermatology', date: '2 Aug 2026', doctor: 'Dr. Anita Desai', status: 'completed', visitType: 'Teleconsultation' },
  { id: 'v5', facility: 'District Hospital', department: 'Pathology', date: '28 Jul 2026', status: 'completed', visitType: 'Lab Test' },
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'p1', doctorName: 'Dr. Priya Sharma', facility: 'Community Health Center', date: '29 Aug 2026', medicineCount: 3, status: 'active',
    medicines: [
      { name: 'Metformin 500mg', dosage: '500mg', frequency: 'Twice daily', duration: '3 months', instructions: 'Take after meals' },
      { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'Once daily', duration: '6 months', instructions: 'Take in the morning' },
      { name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once weekly', duration: '3 months', instructions: 'Take with breakfast' },
    ],
  },
  {
    id: 'p2', doctorName: 'Dr. Rajesh Kumar', facility: 'District Hospital', date: '15 Aug 2026', medicineCount: 2, status: 'active',
    medicines: [
      { name: 'Atorvastatin 10mg', dosage: '10mg', frequency: 'Once daily', duration: '6 months', instructions: 'Take at bedtime' },
      { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take after food' },
    ],
  },
  {
    id: 'p3', doctorName: 'Dr. Anita Desai', facility: 'City Medical Center', date: '2 Aug 2026', medicineCount: 2, status: 'completed',
    medicines: [
      { name: 'Hydrocortisone Cream', dosage: '1%', frequency: 'Twice daily', duration: '2 weeks', instructions: 'Apply thin layer on affected area' },
      { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'Once daily', duration: '1 week', instructions: 'Take at night' },
    ],
  },
];

const MOCK_DIAGNOSTICS: Diagnostic[] = [
  { id: 'd1', testName: 'Complete Blood Count (CBC)', facility: 'District Hospital Lab', date: '28 Jul 2026', resultStatus: 'report_available', reportAvailable: true, details: 'All values within normal range.' },
  { id: 'd2', testName: 'Lipid Profile', facility: 'District Hospital Lab', date: '15 Aug 2026', resultStatus: 'report_available', reportAvailable: true, details: 'Total Cholesterol: 210 mg/dL (borderline high). LDL: 130 mg/dL.' },
  { id: 'd3', testName: 'HbA1c', facility: 'Community Health Center', date: '1 Jul 2026', resultStatus: 'report_available', reportAvailable: true, details: 'HbA1c: 7.2% (above target of 7.0%).' },
  { id: 'd4', testName: 'ECG Screening', facility: 'District Hospital', date: '15 Aug 2026', resultStatus: 'report_available', reportAvailable: true, details: 'Normal sinus rhythm. No abnormalities detected.' },
  { id: 'd5', testName: 'Thyroid Function Test', facility: 'City Medical Center', date: '20 Jun 2026', resultStatus: 'pending', reportAvailable: false },
];

const MOCK_REFERRALS: Referral[] = [
  {
    id: 'r1', referringDoctor: 'Dr. Priya Sharma', referringFacility: 'Community Health Center',
    referredFacility: 'District Hospital', department: 'Cardiology', date: '10 Aug 2026', status: 'completed',
    timeline: [
      { step: 'Referral Created', date: '10 Aug 2026', done: true },
      { step: 'Accepted by Hospital', date: '11 Aug 2026', done: true },
      { step: 'Appointment Scheduled', date: '12 Aug 2026', done: true },
      { step: 'Consultation Completed', date: '15 Aug 2026', done: true },
    ],
  },
  {
    id: 'r2', referringDoctor: 'Dr. Rajesh Kumar', referringFacility: 'District Hospital',
    referredFacility: 'City Medical Center', department: 'Neurology', date: '20 Aug 2026', status: 'appointment_scheduled',
    timeline: [
      { step: 'Referral Created', date: '20 Aug 2026', done: true },
      { step: 'Accepted by Hospital', date: '21 Aug 2026', done: true },
      { step: 'Appointment Scheduled', date: '25 Aug 2026', done: true },
      { step: 'Consultation Completed', date: '', done: false },
    ],
  },
  {
    id: 'r3', referringDoctor: 'Dr. Anita Desai', referringFacility: 'City Medical Center',
    referredFacility: 'District Hospital', department: 'Oncology', date: '1 Aug 2026', status: 'follow_up_pending',
    timeline: [
      { step: 'Referral Created', date: '1 Aug 2026', done: true },
      { step: 'Accepted by Hospital', date: '2 Aug 2026', done: true },
      { step: 'Appointment Scheduled', date: '5 Aug 2026', done: true },
      { step: 'Consultation Completed', date: '10 Aug 2026', done: true },
      { step: 'Follow-up Pending', date: '10 Sep 2026', done: false },
    ],
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', doctor: 'Dr. Priya Sharma', facility: 'Community Health Center', department: 'General Medicine', date: '29 Aug 2026', time: '10:30 AM', type: 'In-person', status: 'completed' },
  { id: 'a2', doctor: 'Dr. Rajesh Kumar', facility: 'District Hospital', department: 'Cardiology', date: '15 Aug 2026', time: '2:00 PM', type: 'In-person', status: 'completed' },
  { id: 'a3', doctor: 'Dr. Anita Desai', facility: 'City Medical Center', department: 'Dermatology', date: '2 Aug 2026', time: '11:00 AM', type: 'Video Consultation', status: 'completed' },
  { id: 'a4', doctor: 'Dr. Suresh Patel', facility: 'PHC Sector 5', department: 'Orthopedics', date: '20 Jul 2026', time: '9:00 AM', type: 'In-person', status: 'completed' },
  { id: 'a5', doctor: 'Dr. Priya Sharma', facility: 'Community Health Center', department: 'General Medicine', date: '5 Jul 2026', time: '10:30 AM', type: 'Audio Call', status: 'missed' },
];

// ─── Category Config ──────────────────────────────────────────────────

const CATEGORIES: { id: CategoryId; icon: string; title: string; description: string; color: string }[] = [
  { id: 'consultations', icon: '👨‍⚕️', title: 'Doctor Consultations', description: 'Previous consultations with doctors', color: '#2563EB' },
  { id: 'visits', icon: '🏥', title: 'Healthcare Visits', description: 'Visits to healthcare facilities', color: '#7C3AED' },
  { id: 'prescriptions', icon: '💊', title: 'Prescription History', description: 'All previous prescriptions', color: '#16A34A' },
  { id: 'diagnostics', icon: '🧪', title: 'Diagnostic / Test History', description: 'Tests and lab reports', color: '#EA580C' },
  { id: 'referrals', icon: '🔄', title: 'Referral History', description: 'Referrals between facilities', color: '#0891B2' },
  { id: 'appointments', icon: '📅', title: 'Appointment History', description: 'Completed and past appointments', color: '#DB2777' },
];

// ─── Filter Modal ─────────────────────────────────────────────────────

function FilterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [dateRange, setDateRange] = useState('all');
  const [consultType, setConsultType] = useState('all');

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={filterStyles.overlay}>
        <View style={filterStyles.sheet}>
          <View style={filterStyles.handle} />
          <Text style={filterStyles.sheetTitle}>Filter History</Text>

          <Text style={filterStyles.fieldLabel}>Date Range</Text>
          <View style={filterStyles.chipRow}>
            {['all', '7d', '30d', '90d', '1y'].map((r) => (
              <TouchableOpacity key={r} style={[filterStyles.chip, dateRange === r && filterStyles.chipActive]} onPress={() => setDateRange(r)}>
                <Text style={[filterStyles.chipText, dateRange === r && filterStyles.chipTextActive]}>
                  {r === 'all' ? 'All' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : '1 Year'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={filterStyles.fieldLabel}>Consultation Type</Text>
          <View style={filterStyles.chipRow}>
            {['all', 'in-person', 'audio', 'video'].map((t) => (
              <TouchableOpacity key={t} style={[filterStyles.chip, consultType === t && filterStyles.chipActive]} onPress={() => setConsultType(t)}>
                <Text style={[filterStyles.chipText, consultType === t && filterStyles.chipTextActive]}>
                  {t === 'all' ? 'All' : t === 'in-person' ? 'In-Person' : t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={filterStyles.fieldLabel}>Status</Text>
          <View style={filterStyles.chipRow}>
            {['all', 'completed', 'active', 'pending'].map((s) => (
              <TouchableOpacity key={s} style={[filterStyles.chip, s === 'all' && filterStyles.chipActive]}>
                <Text style={[filterStyles.chipText, s === 'all' && filterStyles.chipTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={filterStyles.buttonRow}>
            <TouchableOpacity style={filterStyles.resetButton} onPress={onClose}>
              <Text style={filterStyles.resetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={filterStyles.applyButton} onPress={onClose}>
              <Text style={filterStyles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const filterStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTextActive: { color: '#2563EB' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  resetButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
  resetText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  applyButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center' },
  applyText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

// ─── List View ────────────────────────────────────────────────────────

function ListView({ category, onBack, onSelectItem }: { category: CategoryId; onBack: () => void; onSelectItem: (item: any) => void }) {
  const config = CATEGORIES.find((c) => c.id === category)!;

  const renderItem = (item: any, index: number) => {
    let title = '';
    let subtitle = '';
    let badge = '';
    let badgeColor = '';

    if (category === 'consultations') {
      title = `${item.doctorName} • ${item.specialty}`;
      subtitle = `${item.facility} • ${item.date}`;
      badge = item.type === 'in-person' ? 'In-Person' : item.type === 'video' ? 'Video' : 'Audio';
      badgeColor = item.type === 'video' ? '#7C3AED' : item.type === 'audio' ? '#EA580C' : '#2563EB';
    } else if (category === 'visits') {
      title = item.facility;
      subtitle = `${item.department} • ${item.date}`;
      badge = item.visitType;
      badgeColor = '#7C3AED';
    } else if (category === 'prescriptions') {
      title = `Prescription from ${item.doctorName}`;
      subtitle = `${item.facility} • ${item.date} • ${item.medicineCount} medicines`;
      badge = item.status;
      badgeColor = item.status === 'active' ? '#16A34A' : '#9CA3AF';
    } else if (category === 'diagnostics') {
      title = item.testName;
      subtitle = `${item.facility} • ${item.date}`;
      badge = item.resultStatus === 'report_available' ? 'Report Available' : item.resultStatus === 'pending' ? 'Pending' : 'Review Needed';
      badgeColor = item.resultStatus === 'report_available' ? '#16A34A' : item.resultStatus === 'pending' ? '#F59E0B' : '#DC2626';
    } else if (category === 'referrals') {
      title = `Referred to ${item.referredFacility}`;
      subtitle = `${item.referringDoctor} • ${item.department} • ${item.date}`;
      badge = item.status.replace(/_/g, ' ');
      badgeColor = item.status === 'completed' ? '#16A34A' : item.status === 'cancelled' ? '#DC2626' : '#2563EB';
    } else if (category === 'appointments') {
      title = `${item.doctor} • ${item.department}`;
      subtitle = `${item.facility} • ${item.date} • ${item.time}`;
      badge = item.status;
      badgeColor = item.status === 'completed' ? '#16A34A' : item.status === 'missed' ? '#DC2626' : '#F59E0B';
    }

    return (
      <TouchableOpacity key={item.id} style={listStyles.card} activeOpacity={0.7} onPress={() => onSelectItem(item)}>
        <View style={listStyles.cardContent}>
          <Text style={listStyles.cardTitle} numberOfLines={1}>{title}</Text>
          <Text style={listStyles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
          <View style={listStyles.cardFooter}>
            <View style={[listStyles.badge, { backgroundColor: badgeColor + '18' }]}>
              <Text style={[listStyles.badgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  const getData = () => {
    if (category === 'consultations') return MOCK_CONSULTATIONS;
    if (category === 'visits') return MOCK_VISITS;
    if (category === 'prescriptions') return MOCK_PRESCRIPTIONS;
    if (category === 'diagnostics') return MOCK_DIAGNOSTICS;
    if (category === 'referrals') return MOCK_REFERRALS;
    return MOCK_APPOINTMENTS;
  };

  const data = getData();

  return (
    <View style={listStyles.container}>
      <View style={listStyles.header}>
        <TouchableOpacity onPress={onBack} style={listStyles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={listStyles.headerTitle}>{config.icon} {config.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={listStyles.count}>{data.length} records</Text>

      <ScrollView contentContainerStyle={listStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {data.length === 0 ? (
          <View style={listStyles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={listStyles.emptyText}>No {config.title.toLowerCase()} yet.</Text>
          </View>
        ) : (
          data.map((item, index) => renderItem(item, index))
        )}
      </ScrollView>
    </View>
  );
}

const listStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },
  count: { fontSize: 13, color: '#6B7280', paddingHorizontal: 20, marginBottom: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 10,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});

// ─── Detail View ──────────────────────────────────────────────────────

function DetailView({ category, item, onBack }: { category: CategoryId; item: any; onBack: () => void }) {
  const renderDetail = () => {
    if (category === 'consultations') {
      return (
        <View style={detailStyles.section}>
          <DetailRow label="Doctor" value={item.doctorName} />
          <DetailRow label="Specialty" value={item.specialty} />
          <DetailRow label="Facility" value={item.facility} />
          <DetailRow label="Date" value={item.date} />
          <DetailRow label="Type" value={item.type === 'in-person' ? 'In-Person' : item.type === 'video' ? 'Video Call' : 'Audio Call'} />
          <DetailRow label="Status" value={item.status} />
          {item.summary && (
            <View style={detailStyles.summaryBox}>
              <Text style={detailStyles.summaryLabel}>Consultation Summary</Text>
              <Text style={detailStyles.summaryText}>{item.summary}</Text>
            </View>
          )}
        </View>
      );
    }

    if (category === 'visits') {
      return (
        <View style={detailStyles.section}>
          <DetailRow label="Facility" value={item.facility} />
          <DetailRow label="Department" value={item.department} />
          <DetailRow label="Date" value={item.date} />
          {item.doctor && <DetailRow label="Doctor" value={item.doctor} />}
          <DetailRow label="Visit Type" value={item.visitType} />
          <DetailRow label="Status" value={item.status} />
        </View>
      );
    }

    if (category === 'prescriptions') {
      return (
        <View style={detailStyles.section}>
          <DetailRow label="Doctor" value={item.doctorName} />
          <DetailRow label="Facility" value={item.facility} />
          <DetailRow label="Date" value={item.date} />
          <DetailRow label="Status" value={item.status} />
          <Text style={detailStyles.subTitle}>Medicines ({item.medicines.length})</Text>
          {item.medicines.map((med: any, i: number) => (
            <View key={i} style={detailStyles.medCard}>
              <Text style={detailStyles.medName}>{med.name}</Text>
              <Text style={detailStyles.medDetail}>Dosage: {med.dosage}</Text>
              <Text style={detailStyles.medDetail}>Frequency: {med.frequency}</Text>
              <Text style={detailStyles.medDetail}>Duration: {med.duration}</Text>
              <Text style={detailStyles.medDetail}>Note: {med.instructions}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (category === 'diagnostics') {
      return (
        <View style={detailStyles.section}>
          <DetailRow label="Test" value={item.testName} />
          <DetailRow label="Facility" value={item.facility} />
          <DetailRow label="Date" value={item.date} />
          <DetailRow label="Status" value={item.resultStatus === 'report_available' ? 'Report Available' : item.resultStatus === 'pending' ? 'Pending' : 'Requires Review'} />
          {item.details && (
            <View style={detailStyles.summaryBox}>
              <Text style={detailStyles.summaryLabel}>Results</Text>
              <Text style={detailStyles.summaryText}>{item.details}</Text>
            </View>
          )}
        </View>
      );
    }

    if (category === 'referrals') {
      return (
        <View style={detailStyles.section}>
          <DetailRow label="Referring Doctor" value={item.referringDoctor} />
          <DetailRow label="From" value={item.referringFacility} />
          <DetailRow label="To" value={item.referredFacility} />
          <DetailRow label="Department" value={item.department} />
          <DetailRow label="Date" value={item.date} />
          <Text style={detailStyles.subTitle}>Referral Progress</Text>
          {item.timeline.map((step: any, i: number) => (
            <View key={i} style={detailStyles.timelineStep}>
              <View style={[detailStyles.timelineDot, step.done ? detailStyles.timelineDotDone : detailStyles.timelineDotPending]}>
                {step.done && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <View style={detailStyles.timelineInfo}>
                <Text style={[detailStyles.timelineLabel, step.done && detailStyles.timelineLabelDone]}>{step.step}</Text>
                {step.date && <Text style={detailStyles.timelineDate}>{step.date}</Text>}
              </View>
            </View>
          ))}
        </View>
      );
    }

    if (category === 'appointments') {
      return (
        <View style={detailStyles.section}>
          <DetailRow label="Doctor" value={item.doctor} />
          <DetailRow label="Facility" value={item.facility} />
          <DetailRow label="Department" value={item.department} />
          <DetailRow label="Date" value={item.date} />
          <DetailRow label="Time" value={item.time} />
          <DetailRow label="Type" value={item.type} />
          <DetailRow label="Status" value={item.status} />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={detailStyles.container}>
      <View style={detailStyles.header}>
        <TouchableOpacity onPress={onBack} style={detailStyles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={detailStyles.headerTitle}>Details</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={detailStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderDetail()}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      <Text style={detailStyles.value}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
  section: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 13, color: '#6B7280', flex: 1 },
  value: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1.5, textAlign: 'right' },
  summaryBox: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 },
  summaryText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  subTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 8, marginBottom: 4 },
  medCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  medName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  medDetail: { fontSize: 12, color: '#6B7280' },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 12 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  timelineDotDone: { backgroundColor: '#16A34A' },
  timelineDotPending: { backgroundColor: '#E5E7EB' },
  timelineInfo: { flex: 1 },
  timelineLabel: { fontSize: 14, color: '#6B7280' },
  timelineLabelDone: { color: '#111827', fontWeight: '600' },
  timelineDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});

// ─── Main History Tab ─────────────────────────────────────────────────

export default function History() {
  const { openMenu } = useSideMenu();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { openNotifications } = useNotifications();

  const getCategoryCount = (id: CategoryId): number => {
    if (id === 'consultations') return MOCK_CONSULTATIONS.length;
    if (id === 'visits') return MOCK_VISITS.length;
    if (id === 'prescriptions') return MOCK_PRESCRIPTIONS.length;
    if (id === 'diagnostics') return MOCK_DIAGNOSTICS.length;
    if (id === 'referrals') return MOCK_REFERRALS.length;
    return MOCK_APPOINTMENTS.length;
  };

  const getLatestPreview = (id: CategoryId): string => {
    if (id === 'consultations') return `Latest: ${MOCK_CONSULTATIONS[0].doctorName} • ${MOCK_CONSULTATIONS[0].specialty}`;
    if (id === 'visits') return `Latest: ${MOCK_VISITS[0].facility}`;
    if (id === 'prescriptions') return `Latest: ${MOCK_PRESCRIPTIONS[0].doctorName} • ${MOCK_PRESCRIPTIONS[0].medicineCount} medicines`;
    if (id === 'diagnostics') return `Latest: ${MOCK_DIAGNOSTICS[0].testName}`;
    if (id === 'referrals') return `Latest: ${MOCK_REFERRALS[0].referredFacility}`;
    return `Latest: ${MOCK_APPOINTMENTS[0].doctor} • ${MOCK_APPOINTMENTS[0].date}`;
  };

  const getLatestDate = (id: CategoryId): string => {
    if (id === 'consultations') return MOCK_CONSULTATIONS[0].date;
    if (id === 'visits') return MOCK_VISITS[0].date;
    if (id === 'prescriptions') return MOCK_PRESCRIPTIONS[0].date;
    if (id === 'diagnostics') return MOCK_DIAGNOSTICS[0].date;
    if (id === 'referrals') return MOCK_REFERRALS[0].date;
    return MOCK_APPOINTMENTS[0].date;
  };

  // Navigation stack: null = main, category = list, item = detail
  if (selectedItem && selectedCategory) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <DetailView category={selectedCategory} item={selectedItem} onBack={() => setSelectedItem(null)} />
      </SafeAreaView>
    );
  }

  if (selectedCategory) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ListView category={selectedCategory} onBack={() => setSelectedCategory(null)} onSelectItem={setSelectedItem} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Light gradient backdrop */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="Medical History"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        badgeCount={2}
        style={styles.header}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your health history…"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)} activeOpacity={0.7}>
            <Ionicons name="filter" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Category Cards */}
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryCard}
            activeOpacity={0.7}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.color + '15' }]}>
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{getCategoryCount(cat.id)} records</Text>
                <Text style={styles.categoryPreview}>{getLatestPreview(cat.id)}</Text>
                <Text style={styles.categoryDate}>{getLatestDate(cat.id)}</Text>
              </View>
            </View>
            <View style={styles.categoryRight}>
              <Text style={styles.viewHistoryText}>View history →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FilterModal visible={showFilter} onClose={() => setShowFilter(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0FAFA' },
  bgLight:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#F0FAFA' },
  bgTealTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,181,173,0.10)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  header:    { backgroundColor: 'transparent' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 80 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,181,173,0.20)', paddingHorizontal: 14, height: 48,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 15, color: '#0D3349' },
  filterButton: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(0,181,173,0.10)',
    borderWidth: 1, borderColor: 'rgba(0,181,173,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 16, marginBottom: 12,
  },
  categoryLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  categoryIconWrap: {
    width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  categoryEmoji: { fontSize: 24 },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 16, fontWeight: '700', color: '#0D3349', marginBottom: 2 },
  categoryCount: { fontSize: 12, color: '#8AACBA', marginBottom: 4 },
  categoryPreview: { fontSize: 13, color: '#4A7080', fontWeight: '500', marginBottom: 2 },
  categoryDate: { fontSize: 12, color: '#8AACBA' },
  categoryRight: { marginLeft: 8 },
  viewHistoryText: { fontSize: 12, fontWeight: '600', color: '#00B5AD' },
});
