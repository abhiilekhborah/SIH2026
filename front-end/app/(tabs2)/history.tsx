import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ── Warm-white & blue palette (matches appointments.tsx) ──────────────────────
const COLORS = {
  white: '#FFFFFF',
  warmCard: '#FFFEFB',
  canvas: '#FBF7F2',
  line: '#F0E9E0',
  primaryBlue: '#246BFD',
  primaryBlueDeep: '#1A66E8',
  blueSoft: '#EEF4FF',
  blueSofter: '#F5F9FF',
  textDark: '#152B4F',
  textSecondary: '#75839A',
  danger: '#E5484D',
  dangerLight: '#FEF2F2',
  warning: '#D97706',
  warningLight: '#FFF7E8',
  success: '#10B981',
  successLight: '#ECFDF5',
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Status = 'completed' | 'rescheduled' | 'cancelled';

interface Prescription {
  medicine: string;
  dose: string;
  timing: string;
  duration: string;
}

interface HistoryRecord {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  doctor: string;
  date: string;
  time: string;
  visitMode: 'clinic' | 'video';
  status: Status;
  diagnosis: string;
  prescriptions: Prescription[];
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  completed:   { label: 'Completed',   color: COLORS.success, bg: COLORS.successLight, icon: 'checkmark-circle'   },
  rescheduled: { label: 'Rescheduled', color: COLORS.warning, bg: COLORS.warningLight, icon: 'calendar-outline'    },
  cancelled:   { label: 'Cancelled',   color: COLORS.danger,  bg: COLORS.dangerLight,  icon: 'close-circle'       },
};

const VISIT_MODE_CONFIG: Record<HistoryRecord['visitMode'], { label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  clinic: { label: 'In-clinic', icon: 'business' },
  video:  { label: 'Online meet', icon: 'videocam' },
};

// ── Seed data ─────────────────────────────────────────────────────────────────
const HISTORY: HistoryRecord[] = [
  {
    id: '1',
    patientName: 'Riya Sharma',
    age: 34,
    gender: 'Female',
    doctor: 'Dr. Ali Khan',
    date: '18 Nov, 2026',
    time: '09:00 AM',
    visitMode: 'clinic',
    status: 'completed',
    diagnosis: 'Acute viral bronchitis with mild fever.',
    prescriptions: [
      { medicine: 'Azithromycin 500mg', dose: '1 tablet', timing: 'Once daily', duration: '5 days' },
      { medicine: 'Paracetamol 650mg', dose: '1 tablet', timing: 'After food', duration: '3 days' },
      { medicine: 'Cough syrup', dose: '10 ml', timing: 'Before sleep', duration: '5 days' },
    ],
  },
  {
    id: '2',
    patientName: 'Arjun Mehta',
    age: 52,
    gender: 'Male',
    doctor: 'Dr. Priya Nair',
    date: '16 Nov, 2026',
    time: '10:30 AM',
    visitMode: 'video',
    status: 'rescheduled',
    diagnosis: 'Essential hypertension, Stage 2 — review ongoing.',
    prescriptions: [
      { medicine: 'Amlodipine 10mg', dose: '1 tablet', timing: 'After food', duration: '2 weeks' },
    ],
  },
  {
    id: '3',
    patientName: 'Suresh Kumar',
    age: 61,
    gender: 'Male',
    doctor: 'Dr. Ali Khan',
    date: '14 Nov, 2026',
    time: '11:15 AM',
    visitMode: 'clinic',
    status: 'cancelled',
    diagnosis: 'Post-operative follow-up — unhealed',
    prescriptions: [],
  },
  {
    id: '4',
    patientName: 'Meena Joshi',
    age: 38,
    gender: 'Female',
    doctor: 'Dr. Vikram Singh',
    date: '12 Nov, 2026',
    time: '12:00 PM',
    visitMode: 'video',
    status: 'completed',
    diagnosis: 'Chronic migraine without aura.',
    prescriptions: [
      { medicine: 'Sumatriptan 50mg', dose: '1 tablet', timing: 'At onset', duration: 'As needed' },
      { medicine: 'Propranolol 40mg', dose: '1 tablet', timing: 'Twice daily', duration: '1 month' },
    ],
  },
  {
    id: '5',
    patientName: 'Raj Patel',
    age: 55,
    gender: 'Male',
    doctor: 'Dr. Ananya Bose',
    date: '10 Nov, 2026',
    time: '02:00 PM',
    visitMode: 'clinic',
    status: 'completed',
    diagnosis: 'Type 2 diabetes — controlled on current regimen.',
    prescriptions: [
      { medicine: 'Metformin 1000mg', dose: '1 tablet', timing: 'After food', duration: '1 month' },
    ],
  },
  {
    id: '6',
    patientName: 'Divya Nair',
    age: 23,
    gender: 'Female',
    doctor: 'Dr. Priya Nair',
    date: '08 Nov, 2026',
    time: '02:30 PM',
    visitMode: 'clinic',
    status: 'rescheduled',
    diagnosis: 'Allergic rhinitis — seasonal.',
    prescriptions: [
      { medicine: 'Cetirizine 10mg', dose: '1 tablet', timing: 'Before sleep', duration: '2 weeks' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

// ── Small shared components ───────────────────────────────────────────────────
function StatusBadge({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const cfg = STATUS_CONFIG[status];
  const isMd = size === 'md';
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }, isMd && styles.statusBadgeMd]}>
      <Ionicons name={cfg.icon} size={isMd ? 14 : 11} color={cfg.color} />
      <Text style={[styles.statusBadgeText, { color: cfg.color }, isMd && styles.statusBadgeTextMd]}>{cfg.label}</Text>
    </View>
  );
}

function MedicineRow({ medicine }: { medicine: Prescription }) {
  return (
    <View style={styles.medicineRow}>
      <View style={styles.medicineDot} />
      <Text style={styles.medicineName} numberOfLines={1}>{medicine.medicine}</Text>
      <Text style={styles.medicineDose}>{medicine.dose} · {medicine.timing}</Text>
      <View style={styles.medicineDuration}>
        <Text style={styles.medicineDurationText}>{medicine.duration}</Text>
      </View>
    </View>
  );
}

// ── History Card Component ────────────────────────────────────────────────────
function HistoryCard({ record }: { record: HistoryRecord }) {
  const [expanded, setExpanded] = useState(false);
  const vm = VISIT_MODE_CONFIG[record.visitMode];

  return (
    <View style={styles.card}>
      {/* ── Brief Details ────────────── */}
      <View style={styles.cardHead}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(record.patientName)}</Text>
        </View>
        <View style={styles.headInfo}>
          <Text style={styles.patientName}>{record.patientName}</Text>
          <View style={styles.briefDateRow}>
             <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
             <Text style={styles.metaText}>{record.date} · {record.time}</Text>
          </View>
        </View>
        <StatusBadge status={record.status} />
      </View>
      
      <Pressable onPress={() => setExpanded(!expanded)} style={styles.expandButton}>
         <Text style={styles.expandButtonText}>{expanded ? 'Hide Details' : 'Show Details'}</Text>
         <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.primaryBlue} />
      </Pressable>

      {/* ── Expanded Content ────────────── */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.metaLineExpanded}>
            <Text style={styles.metaTextExpanded}>Age {record.age} · {record.gender}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaTextExpanded}>{record.doctor}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name={vm.icon} size={11} color={COLORS.textSecondary} />
            <Text style={styles.metaTextExpanded}>{vm.label}</Text>
          </View>

          {/* ── Diagnosis ───────────────────────────────────── */}
          <View style={styles.diagnosisBlock}>
            <View style={styles.labelRow}>
              <Ionicons name="pulse-outline" size={12} color={COLORS.primaryBlue} />
              <Text style={styles.blockLabel}>Diagnosis</Text>
            </View>
            <Text style={styles.diagnosisText}>{record.diagnosis}</Text>
          </View>

          {/* ── Prescriptions ───────────────────────────────── */}
          {record.prescriptions.length > 0 ? (
            <View style={styles.prescriptionBlock}>
              <View style={styles.labelRow}>
                <Ionicons name="document-text-outline" size={12} color={COLORS.primaryBlue} />
                <Text style={styles.blockLabel}>Prescribed</Text>
                <View style={styles.rxPill}><Text style={styles.rxPillText}>Rx</Text></View>
              </View>
              {record.prescriptions.map((med, i) => (
                <MedicineRow key={`${record.id}-${i}`} medicine={med} />
              ))}
            </View>
          ) : (
            <View style={styles.noRxBlock}>
              <Text style={styles.noRxText}>No prescription issued for this visit.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function History() {
  const [filter, setFilter] = useState<'all' | Status>('all');

  const visible = useMemo(
    () => filter === 'all' ? HISTORY : HISTORY.filter(r => r.status === filter),
    [filter],
  );

  const counts = useMemo(() => ({
    all: HISTORY.length,
    completed: HISTORY.filter(r => r.status === 'completed').length,
    rescheduled: HISTORY.filter(r => r.status === 'rescheduled').length,
    cancelled: HISTORY.filter(r => r.status === 'cancelled').length,
  }), []);

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'completed', label: `Done (${counts.completed})` },
    { key: 'rescheduled', label: `Resched (${counts.rescheduled})` },
    { key: 'cancelled', label: `Cancel (${counts.cancelled})` },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="time" size={18} color={COLORS.primaryBlue} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Visit History</Text>
          <Text style={styles.headerSub}>{HISTORY.length} past appointments recorded</Text>
        </View>
      </View>

      {/* ── Status filter chips ─────────────────────────────────── */}
      <View style={styles.filterStrip}>
        {FILTERS.map(f => {
          const isActive = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text 
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ── History list ────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {visible.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="file-tray-outline" size={36} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.emptyText}>No records under this filter.</Text>
          </View>
        )}

        {visible.map(record => (
          <HistoryCard key={record.id} record={record} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.canvas },

  // Header
  header: {
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  headerIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },

  // Filter chips
  filterStrip: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', gap: 6 },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2, paddingVertical: 8, borderRadius: 12,
    backgroundColor: COLORS.warmCard, borderWidth: 1, borderColor: COLORS.line,
  },
  filterChipActive: { backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue },
  filterChipText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  filterChipTextActive: { color: COLORS.white },

  // List
  list: { paddingHorizontal: 16 },

  // Card
  card: {
    backgroundColor: COLORS.warmCard, borderRadius: 18, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.line, padding: 14, overflow: 'hidden',
    shadowColor: '#8A6E4E', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },

  // Head
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLORS.primaryBlue },
  headInfo: { flex: 1, justifyContent: 'center' },
  patientName: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  briefDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  
  // Expand Button
  expandButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, paddingVertical: 8, gap: 4,
    backgroundColor: COLORS.blueSofter, borderRadius: 8,
  },
  expandButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryBlue },

  // Expanded Content
  expandedContent: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: COLORS.line,
  },
  metaLineExpanded: { 
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6,
    backgroundColor: COLORS.canvas, padding: 8, borderRadius: 8
  },
  metaTextExpanded: { fontSize: 12, color: COLORS.textDark, fontWeight: '500' },
  metaDot: { color: COLORS.textSecondary, fontSize: 12 },

  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  statusBadgeMd: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, gap: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  statusBadgeTextMd: { fontSize: 11 },

  // Diagnosis
  diagnosisBlock: { marginTop: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  blockLabel: {
    fontSize: 11, fontWeight: '800', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  diagnosisText: { fontSize: 13, lineHeight: 19, color: COLORS.textDark },

  // Prescriptions
  prescriptionBlock: { marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.line, paddingTop: 12 },
  rxPill: {
    marginLeft: 2, borderRadius: 6, backgroundColor: COLORS.primaryBlue,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  rxPillText: { fontSize: 9, fontWeight: '900', fontStyle: 'italic', color: COLORS.white },
  medicineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  medicineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primaryBlue },
  medicineName: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  medicineDose: { fontSize: 11, color: COLORS.textSecondary },
  medicineDuration: {
    backgroundColor: COLORS.blueSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  medicineDurationText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryBlue },

  noRxBlock: {
    marginTop: 12, padding: 10, borderRadius: 10,
    backgroundColor: COLORS.warningLight,
  },
  noRxText: { fontSize: 12, color: COLORS.warning, fontWeight: '600' },

  // Empty state
  emptyState: { alignItems: 'center', marginTop: 48, gap: 12 },
  emptyIcon: {
    width: 68, height: 68, borderRadius: 22,
    backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
});
