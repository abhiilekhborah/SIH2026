import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ── Warm-white & blue palette ─────────────────────────────────────────────────
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
  video: '#B4690E',
  videoLight: '#FFF3DF',
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Priority = 'critical' | 'high' | 'medium' | 'low';
type VisitMode = 'clinic' | 'video';

interface Appointment {
  id: string;
  patientName: string;
  age: number;
  problem: string;
  priority: Priority;
  visitMode: VisitMode;
  time: string;
  dateKey: string;   // "YYYY-MM-DD"
  notes: string;
  done: boolean;
}

// ── Configs ───────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  critical: { label: 'Critical', color: COLORS.danger,  bg: COLORS.dangerLight,  icon: 'alert-circle'       },
  high:     { label: 'High',     color: '#EA580C',       bg: '#FFF0E6',           icon: 'warning'            },
  medium:   { label: 'Medium',   color: COLORS.warning,  bg: COLORS.warningLight, icon: 'information-circle' },
  low:      { label: 'Low',      color: COLORS.success,  bg: COLORS.successLight, icon: 'checkmark-circle'   },
};

const VISIT_MODE_CONFIG: Record<VisitMode, { label: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  clinic: { label: 'In-clinic',  color: COLORS.primaryBlue, bg: COLORS.blueSoft,    icon: 'business'   },
  video:  { label: 'Online meet', color: COLORS.video,       bg: COLORS.videoLight,  icon: 'videocam'   },
};

// ── Date helpers ──────────────────────────────────────────────────────────────
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function buildDays(count = 7) {
  const today = new Date();
  today.setHours(0,0,0,0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: toKey(d),
      day: DAY_NAMES[d.getDay()],
      date: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      isToday: i === 0,
    };
  });
}

const DAYS = buildDays(7);
const TODAY_KEY = DAYS[0].key;
const TOMORROW_KEY = DAYS[1].key;

// ── Seed data — uses real date keys ──────────────────────────────────────────
const INITIAL: Appointment[] = [
  { id:'1',  patientName:'Riya Sharma',   age:34, problem:'Acute Chest Pain',        priority:'critical', visitMode:'clinic', time:'09:00 AM', dateKey: TODAY_KEY,    notes:'Possible MI — ECG ordered',       done:false },
  { id:'2',  patientName:'Arjun Mehta',   age:52, problem:'Severe Hypertension',     priority:'critical', visitMode:'clinic', time:'09:30 AM', dateKey: TODAY_KEY,    notes:'BP 200/120, medication review',   done:false },
  { id:'3',  patientName:'Priya Das',     age:28, problem:'Diabetic Ketoacidosis',   priority:'high',     visitMode:'clinic', time:'10:00 AM', dateKey: TODAY_KEY,    notes:'BS 450 mg/dL, insulin drip',      done:false },
  { id:'4',  patientName:'Suresh Kumar',  age:61, problem:'Post-Op Follow-up',       priority:'high',     visitMode:'video',  time:'10:45 AM', dateKey: TODAY_KEY,    notes:'Appendectomy — Day 3 review',     done:false },
  { id:'5',  patientName:'Ananya Bose',   age:19, problem:'Severe Asthma Attack',    priority:'high',     visitMode:'clinic', time:'11:15 AM', dateKey: TODAY_KEY,    notes:'Peak flow 40%, nebuliser given',  done:false },
  { id:'6',  patientName:'Vikram Singh',  age:45, problem:'Lower Back Pain',         priority:'medium',   visitMode:'video',  time:'12:00 PM', dateKey: TODAY_KEY,    notes:'MRI referral pending',            done:false },
  { id:'7',  patientName:'Meena Joshi',   age:38, problem:'Migraine — Recurrent',    priority:'medium',   visitMode:'video',  time:'12:30 PM', dateKey: TODAY_KEY,    notes:'Third episode this month',        done:false },
  { id:'8',  patientName:'Raj Patel',     age:55, problem:'Routine Cardiac Checkup', priority:'low',      visitMode:'clinic', time:'02:00 PM', dateKey: TODAY_KEY,    notes:'Annual review, stable',           done:false },
  { id:'9',  patientName:'Divya Nair',    age:23, problem:'General Health Checkup',  priority:'low',      visitMode:'clinic', time:'02:30 PM', dateKey: TODAY_KEY,    notes:'No specific complaints',          done:false },
  { id:'10', patientName:'Amit Ghosh',    age:47, problem:'Thyroid Function Review', priority:'low',      visitMode:'video',  time:'09:00 AM', dateKey: TOMORROW_KEY, notes:'TSH results ready',               done:false },
  { id:'11', patientName:'Sunita Roy',    age:66, problem:'Arthritis Follow-up',     priority:'medium',   visitMode:'clinic', time:'10:30 AM', dateKey: TOMORROW_KEY, notes:'Joint swelling, new X-ray needed', done:false },
  { id:'12', patientName:'Karan Verma',   age:31, problem:'Allergy Testing',         priority:'low',      visitMode:'video',  time:'11:00 AM', dateKey: TOMORROW_KEY, notes:'Skin-prick test scheduled',        done:false },
  { id:'13', patientName:'Fatima Khan',   age:43, problem:'Chronic Kidney Disease',  priority:'high',     visitMode:'clinic', time:'09:30 AM', dateKey: DAYS[2].key,  notes:'eGFR declining — nephrology ref', done:false },
  { id:'14', patientName:'Rohit Jain',    age:27, problem:'Sports Injury Review',    priority:'medium',   visitMode:'video',  time:'11:00 AM', dateKey: DAYS[2].key,  notes:'ACL tear follow-up',              done:false },
  { id:'15', patientName:'Deepa Reddy',   age:50, problem:'Pre-Surgery Consult',     priority:'critical', visitMode:'clinic', time:'08:30 AM', dateKey: DAYS[3].key,  notes:'Hip replacement prep',            done:false },
  { id:'16', patientName:'Mohan Tiwari',  age:58, problem:'Lipid Panel Review',      priority:'low',      visitMode:'video',  time:'02:00 PM', dateKey: DAYS[4].key,  notes:'Cholesterol management',          done:false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
}
function priorityOrder(p: Priority) {
  return { critical:0, high:1, medium:2, low:3 }[p];
}

// ── Small shared components ───────────────────────────────────────────────────
function VisitModeBadge({ mode, size = 'sm' }: { mode: VisitMode; size?: 'sm' | 'md' }) {
  const cfg = VISIT_MODE_CONFIG[mode];
  const isMd = size === 'md';
  return (
    <View style={[styles.visitBadge, { backgroundColor: cfg.bg }, isMd && styles.visitBadgeMd]}>
      <Ionicons name={cfg.icon} size={isMd ? 13 : 11} color={cfg.color} />
      <Text style={[styles.visitBadgeText, { color: cfg.color }, isMd && styles.visitBadgeTextMd]}>{cfg.label}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL);
  const [selectedDay, setSelectedDay]   = useState(TODAY_KEY);
  const [filterDone, setFilterDone]     = useState(false);
  const [selected, setSelected]         = useState<Appointment | null>(null);
  const [notesText, setNotesText]       = useState('');

  const toggle = (id: string) =>
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, done: !a.done } : a));

  const openDetail = (a: Appointment) => { setSelected(a); setNotesText(a.notes); };

  const saveNotes = () => {
    if (!selected) return;
    setAppointments(prev => prev.map(a => a.id === selected.id ? { ...a, notes: notesText } : a));
    setSelected(null);
  };

  const dayAppts   = useMemo(() => appointments.filter(a => a.dateKey === selectedDay), [appointments, selectedDay]);
  const doneCount  = dayAppts.filter(a => a.done).length;
  const totalCount = dayAppts.length;

  const visible = dayAppts
    .filter(a => filterDone ? a.done : !a.done)
    .sort((a,b) => priorityOrder(a.priority) - priorityOrder(b.priority));

  const progress = totalCount > 0 ? doneCount / totalCount : 0;
  const selectedDate = DAYS.find(day => day.key === selectedDay);

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerIcon}><Ionicons name="calendar" size={18} color={COLORS.primaryBlue} /></View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Appointments</Text>
          <Text style={styles.headerSub}>
            {totalCount === 0
              ? 'No appointments this day'
              : `${doneCount} of ${totalCount} completed`}
          </Text>
        </View>
        <View style={styles.progressPill}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* ── Main List Area (Takes up remaining space) ──────────── */}
      <View style={{ flex: 1 }}>
        {/* Pending / Done Toggle */}
        <View style={styles.filterRow}>
          <Pressable
            style={[styles.filterBtn, !filterDone && styles.filterBtnActive]}
            onPress={() => setFilterDone(false)}
          >
            <Text style={[styles.filterBtnText, !filterDone && styles.filterBtnTextActive]}>
              Pending ({dayAppts.filter(a => !a.done).length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterBtn, filterDone && styles.filterBtnActive]}
            onPress={() => setFilterDone(true)}
          >
            <Text style={[styles.filterBtnText, filterDone && styles.filterBtnTextActive]}>
              Done ({doneCount})
            </Text>
          </Pressable>
        </View>

        {/* Appointment List */}
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <View style={styles.listHeading}>
            <View>
              <Text style={styles.listTitle}>{filterDone ? 'Completed visits' : 'Upcoming visits'}</Text>
              <Text style={styles.listSubtitle}>{visible.length} appointment{visible.length === 1 ? '' : 's'} to review</Text>
            </View>
            {!filterDone && totalCount > 0 && (
              <View style={styles.listCountPill}>
                <Ionicons name="time-outline" size={12} color={COLORS.primaryBlue} />
                <Text style={styles.listCountText}>{totalCount} total</Text>
              </View>
            )}
          </View>

          {visible.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={filterDone ? 'calendar-outline' : 'checkmark-done-circle'}
                  size={40}
                  color={filterDone ? COLORS.textSecondary : COLORS.success}
                />
              </View>
              <Text style={styles.emptyText}>
                {filterDone
                  ? 'No completed appointments yet.'
                  : totalCount === 0
                    ? 'No appointments scheduled.'
                    : 'All done for this day! 🎉'}
              </Text>
            </View>
          )}

          <View style={styles.timelineContainer}>
            {visible.map((appt, index) => {
              // Map priority to a "Follow-up" / "Upcoming" badge style similar to the image
              let pillBg = COLORS.blueSoft;
              let pillColor = COLORS.primaryBlue;
              let pillLabel = "Upcoming";
              
              if (appt.priority === 'critical' || appt.priority === 'high') {
                pillBg = COLORS.dangerLight;
                pillColor = COLORS.danger;
                pillLabel = "Urgent";
              } else if (appt.visitMode === 'video') {
                pillBg = COLORS.videoLight;
                pillColor = COLORS.video;
                pillLabel = "Online";
              } else if (appt.priority === 'medium') {
                pillBg = COLORS.successLight;
                pillColor = COLORS.success;
                pillLabel = "Follow-up";
              }

              if (appt.done) {
                pillBg = COLORS.line;
                pillColor = COLORS.textSecondary;
                pillLabel = "Done";
              }

              const isLast = index === visible.length - 1;

              return (
                <Pressable
                  key={appt.id}
                  style={({ pressed }) => [styles.timelineRow, appt.done && styles.cardDone, pressed && styles.cardPressed]}
                  onPress={() => openDetail(appt)}
                >
                  <View style={styles.timelineTimeCol}>
                    <Text style={styles.timelineTimeText}>{appt.time}</Text>
                  </View>
                  
                  <View style={styles.timelineLineCol}>
                     <View style={[styles.timelineDot, { backgroundColor: pillColor }]} />
                     {!isLast && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={[styles.timelineContentCol, !isLast && styles.timelineContentBorder]}>
                    <View style={styles.timelineInfo}>
                      <Text style={[styles.timelineName, appt.done && styles.strikethrough]}>{appt.patientName}</Text>
                      <Text style={styles.timelineProblem}>{appt.problem}</Text>
                    </View>
                    <View style={styles.timelineRight}>
                      <View style={[styles.timelinePill, { backgroundColor: pillBg }]}>
                        <Text style={[styles.timelinePillText, { color: pillColor }]}>{pillLabel}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* ── 7-Day Calendar Strip (Bottom fixed) ────────────────── */}
      <View style={styles.calendarSection}>
        <View style={styles.calendarLabelRow}>
          <Text style={styles.calendarLabel}>Schedule</Text>
          <View style={styles.selectedDateChip}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.primaryBlue} />
            <Text style={styles.selectedDateLabel}>
              {selectedDate ? `${selectedDate.day}, ${selectedDate.month} ${selectedDate.date}` : ''}
            </Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarStrip}
        >
          {DAYS.map(d => {
            const isActive = d.key === selectedDay;
            const dayApptCount = appointments.filter(a => a.dateKey === d.key).length;
            return (
              <Pressable
                key={d.key}
                onPress={() => { setSelectedDay(d.key); setFilterDone(false); }}
                style={({ pressed }) => [
                  styles.dayCell,
                  isActive && styles.dayCellActive,
                  pressed && !isActive && styles.dayCellPressed,
                ]}
              >
                <Text style={[styles.dayName, isActive && styles.dayNameActive]}>{d.day}</Text>
                <Text style={[styles.dayNum, isActive && styles.dayNumActive]}>{d.date}</Text>
                <Text style={[styles.dayMonth, isActive && styles.dayMonthActive]}>{d.month}</Text>
                
                {dayApptCount > 0 && (
                  <View style={[styles.apptDot, isActive && styles.apptDotActive]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Detail Bottom Sheet ─────────────────────────────────── */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)} />
          {selected && (() => {
            const pc = PRIORITY_CONFIG[selected.priority];
            return (
              <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.sheetHeader}>
                  <View style={[styles.sheetAvatar, { backgroundColor: pc.bg }]}>
                    <Text style={[styles.sheetAvatarText, { color: pc.color }]}>
                      {getInitials(selected.patientName)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetName}>{selected.patientName}</Text>
                    <Text style={styles.sheetAge}>Age {selected.age} · {selected.time}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: pc.bg }]}>
                    <Ionicons name={pc.icon} size={11} color={pc.color} />
                    <Text style={[styles.badgeText, { color: pc.color }]}>{pc.label}</Text>
                  </View>
                </View>

                <View style={styles.sheetSection}>
                  <Text style={styles.sheetLabel}>Problem</Text>
                  <Text style={styles.sheetValue}>{selected.problem}</Text>
                </View>

                <View style={styles.sheetSection}>
                  <Text style={styles.sheetLabel}>Visit</Text>
                  <VisitModeBadge mode={selected.visitMode} size="md" />
                </View>

                <View style={styles.sheetSection}>
                  <Text style={styles.sheetLabel}>Priority</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['critical', 'high', 'medium', 'low'] as Priority[]).map(p => {
                      const cfg = PRIORITY_CONFIG[p];
                      const isSelected = selected.priority === p;
                      return (
                        <Pressable 
                          key={p} 
                          onPress={() => {
                            setAppointments(prev => prev.map(a => a.id === selected.id ? { ...a, priority: p } : a));
                            setSelected({ ...selected, priority: p });
                          }}
                          style={[styles.badge, { backgroundColor: isSelected ? cfg.color : cfg.bg, borderWidth: 1, borderColor: cfg.color, paddingVertical: 6, paddingHorizontal: 10 }]}
                        >
                          <Text style={[styles.badgeText, { color: isSelected ? COLORS.white : cfg.color }]}>{cfg.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.sheetSection}>
                  <Text style={styles.sheetLabel}>Doctor&apos;s Notes</Text>
                  <TextInput
                    style={styles.notesInput}
                    multiline
                    value={notesText}
                    onChangeText={setNotesText}
                    placeholder="Add clinical notes…"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.sheetActions}>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: selected.done ? COLORS.dangerLight : COLORS.successLight }, pressed && styles.actionBtnPressed]}
                    onPress={() => { toggle(selected.id); setSelected(null); }}
                  >
                    <Ionicons
                      name={selected.done ? 'close-circle' : 'checkmark-circle'}
                      size={20}
                      color={selected.done ? COLORS.danger : COLORS.success}
                    />
                    <Text style={[styles.actionBtnText, { color: selected.done ? COLORS.danger : COLORS.success }]}>
                      {selected.done ? 'Mark Pending' : 'Mark as Done'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, styles.saveBtn, pressed && styles.actionBtnPressed]}
                    onPress={saveNotes}
                  >
                    <Ionicons name="save-outline" size={20} color={COLORS.white} />
                    <Text style={[styles.actionBtnText, { color: COLORS.white }]}>Save Notes</Text>
                  </Pressable>
                </View>
              </View>
            );
          })()}
        </View>
      </Modal>
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
  progressPill: { width: 74, height: 8, borderRadius: 4, backgroundColor: COLORS.line, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primaryBlue, borderRadius: 4 },

  // Filter toggle
  filterRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: COLORS.blueSoft, borderRadius: 14, padding: 4,
  },
  filterBtn:           { flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center' },
  filterBtnActive:     { backgroundColor: COLORS.primaryBlue, shadowColor: COLORS.primaryBlue, shadowOpacity: 0.2, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 3 },
  filterBtnText:       { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  filterBtnTextActive: { color: COLORS.white },

  // List
  list: { paddingHorizontal: 16 },
  listHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 2 },
  listTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  listSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  listCountPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.blueSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99,
  },
  listCountText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryBlue },

  emptyState: { alignItems: 'center', marginTop: 48, gap: 12 },
  emptyIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: COLORS.blueSoft, alignItems: 'center', justifyContent: 'center' },
  emptyText:  { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },

  // Minimal Cards
  minimalCard: {
    flexDirection: 'row', backgroundColor: COLORS.warmCard, borderRadius: 16,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.line, overflow: 'hidden',
    shadowColor: '#8A6E4E', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  cardDone:    { opacity: 0.5 },
  stripe:      { width: 4 },
  minimalCardContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  minimalCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  minimalCardTime: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary, minWidth: 60 },
  minimalCardName: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, flex: 1 },
  strikethrough:{ textDecorationLine: 'line-through', color: COLORS.textSecondary },

  badge:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  visitBadge:     { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  visitBadgeMd:   { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, gap: 4 },
  visitBadgeText:     { fontSize: 10, fontWeight: '700' },
  visitBadgeTextMd:   { fontSize: 11 },

  // Calendar strip (bottom)
  calendarSection: { paddingVertical: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.line },
  calendarLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  calendarLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  selectedDateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.blueSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
  },
  selectedDateLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primaryBlue },
  calendarStrip: { paddingHorizontal: 16, gap: 8 },
  dayCell: {
    width: 52,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.warmCard,
  },
  dayCellPressed: { transform: [{ scale: 0.96 }], opacity: 0.85 },
  dayCellActive: {
    backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue,
    shadowColor: COLORS.primaryBlue, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  dayName:       { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 2 },
  dayNameActive: { color: 'rgba(255,255,255,0.8)' },
  dayNum:        { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  dayNumActive:  { color: COLORS.white },
  dayMonth:      { fontSize: 9, fontWeight: '600', color: COLORS.textSecondary, marginTop: 2 },
  dayMonthActive:{ color: 'rgba(255,255,255,0.75)' },
  apptDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.primaryBlue, marginTop: 4 },
  apptDotActive: { backgroundColor: COLORS.white },

  // Modal sheet
  modalOverlay:  { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(21,43,79,0.45)' },
  sheet: {
    backgroundColor: COLORS.warmCard, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.line, alignSelf: 'center', marginBottom: 20 },

  sheetHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetAvatar:     { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  sheetAvatarText: { fontSize: 18, fontWeight: '800' },
  sheetName:       { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  sheetAge:        { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  sheetSection: { marginBottom: 16 },
  sheetLabel:   { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  sheetValue:   { fontSize: 16, fontWeight: '600', color: COLORS.textDark },

  notesInput: {
    borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, padding: 12,
    minHeight: 90, fontSize: 14, color: COLORS.textDark,
    textAlignVertical: 'top', backgroundColor: COLORS.white,
  },

  sheetActions:   { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16 },
  actionBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  saveBtn:        { backgroundColor: COLORS.primaryBlue },
  actionBtnText:  { fontSize: 14, fontWeight: '700' },
  
  // Timeline Styles
  timelineContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: COLORS.line,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineTimeCol: {
    width: 80,
    paddingVertical: 20,
    alignItems: 'center',
  },
  timelineTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryBlueDeep,
  },
  timelineLineCol: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 22,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 32,
    bottom: -22,
    width: 2,
    backgroundColor: COLORS.line,
    zIndex: 1,
  },
  timelineContentCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingRight: 16,
    paddingLeft: 12,
  },
  timelineContentBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  timelineProblem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timelineRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelinePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timelinePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});