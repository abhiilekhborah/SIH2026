import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Priority = 'low' | 'moderate' | 'high';
type Appointment = { id: string; patientName: string; age: number; time: string; visit: 'In-clinic' | 'Video'; dateKey: string; done: boolean; priority: Priority };
const C = { blue: '#246BFD', ink: '#152B4F', muted: '#75839A', canvas: '#FBF7F2', card: '#FFFFFF', line: '#E6EAF0', soft: '#EEF4FF', low: '#10B981', moderate: '#D97706', high: '#E5484D' };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = new Date(); today.setHours(0, 0, 0, 0);
const initial: Appointment[] = [['Riya Sharma', 34, '09:00 AM', 'In-clinic'], ['Arjun Mehta', 52, '09:30 AM', 'In-clinic'], ['Priya Das', 28, '10:15 AM', 'Video'], ['Suresh Kumar', 61, '11:00 AM', 'In-clinic'], ['Ananya Bose', 19, '11:30 AM', 'Video']].map(([patientName, age, time, visit], index) => ({ id: String(index + 1), patientName: patientName as string, age: age as number, time: time as string, visit: visit as Appointment['visit'], dateKey: key(today), done: index === 4, priority: 'moderate' }));
const formatDate = (dateKey: string) => new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
const sheetReschedule = { marginTop: 10, minHeight: 46, borderRadius: 13, backgroundColor: '#EEF4FF', alignItems: 'center' as const, justifyContent: 'center' as const, flexDirection: 'row' as const, gap: 8 };

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState(initial);
  const [tab, setTab] = useState<'pending' | 'done'>('pending');
  const [selectedDate, setSelectedDate] = useState(key(today));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date(today));
  const [selected, setSelected] = useState<Appointment | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDoctorAppointments = async () => {
      try {
        const { data: reqs, error } = await supabase
          .from('appointment_requests')
          .select('*, patient:patient_profiles(*)')
          .order('created_at', { ascending: false });

        if (!cancelled && reqs && !error) {
          const mapped: Appointment[] = reqs.map((r: any) => {
            const reqDate = r.requested_date || key(today);
            return {
              id: r.id,
              patientName: r.patient?.name || 'Patient',
              age: r.patient?.age || (r.patient?.blood_group ? 28 : 34),
              time: r.requested_time || '10:00 AM',
              visit: r.request_type?.includes('teleconsultation') ? 'Video' : 'In-clinic',
              dateKey: reqDate,
              done: r.status === 'accepted',
              priority: 'moderate',
            };
          });

          setAppointments(prev => {
            const existingIds = new Set(mapped.map(m => m.id));
            const remainingInitial = initial.filter(i => !existingIds.has(i.id));
            return [...mapped, ...remainingInitial];
          });
        }
      } catch (err) {
        console.warn('[Doctor Appointments] load error:', err);
      }
    };

    loadDoctorAppointments();

    const channel = supabase
      .channel('doctor_appointments_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointment_requests',
        },
        () => {
          loadDoctorAppointments();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const dayAppointments = useMemo(() => appointments.filter(item => item.dateKey === selectedDate), [appointments, selectedDate]);
  const visible = dayAppointments.filter(item => tab === 'done' ? item.done : !item.done).sort((a, b) => a.time.localeCompare(b.time));
  const setDone = async (id: string) => {
    setAppointments(items => items.map(item => item.id === id ? { ...item, done: true } : item));
    setSelected(null);
    try {
      await supabase
        .from('appointment_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (e) {
      console.warn('[Doctor Appointments] approve error:', e);
    }
  };
  const setPriority = (id: string, priority: Priority) => setAppointments(items => items.map(item => item.id === id ? { ...item, priority } : item));
  const reschedule = async (id: string) => {
    const newTime = selected?.time === '03:00 PM' ? '04:00 PM' : '03:00 PM';
    setAppointments(items => items.map(item => item.id === id ? { ...item, time: newTime } : item));
    setSelected(null);
    try {
      const targetDate = selected?.dateKey || key(today);
      const proposedIso = new Date(`${targetDate} ${newTime}`).toISOString();
      await supabase
        .from('appointment_requests')
        .update({
          status: 'rescheduled',
          proposed_time: proposedIso,
          requested_time: newTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (e) {
      console.warn('[Doctor Appointments] reschedule error:', e);
    }
  };
  const prescribe = (item: Appointment) => { setSelected(null); router.push({ pathname: '/(tabs2)/new', params: { patientName: item.patientName, patientAge: String(item.age) } } as any); };
  return <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}><View style={s.header}><View><Text style={s.title}>Appointments</Text><Text style={s.subtitle}>{formatDate(selectedDate)}</Text></View><Pressable style={s.calendarButton} onPress={() => setCalendarOpen(true)}><Ionicons name="calendar-outline" size={21} color={C.blue} /></Pressable></View><View style={s.tabs}><Tab label={`Pending (${dayAppointments.filter(a => !a.done).length})`} active={tab === 'pending'} onPress={() => setTab('pending')} /><Tab label={`Done (${dayAppointments.filter(a => a.done).length})`} active={tab === 'done'} onPress={() => setTab('done')} /></View><ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}><Text style={s.listCaption}>{tab === 'pending' ? 'Scheduled visits' : 'Completed visits'}</Text>{visible.length === 0 ? <Empty tab={tab} /> : visible.map(item => <AppointmentCard key={item.id} item={item} tab={tab} onPress={() => setSelected(item)} onPrescribe={() => prescribe(item)} />)}</ScrollView><Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}><CalendarPicker value={selectedDate} month={calendarMonth} onMonthChange={setCalendarMonth} onSelect={date => { setSelectedDate(date); setCalendarOpen(false); }} onClose={() => setCalendarOpen(false)} /></Modal><Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}><View style={s.overlay}><Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />{selected && <View style={s.sheet}><View style={s.handle} /><Text style={s.sheetTitle}>{selected.patientName}</Text><Text style={s.sheetMeta}>Age {selected.age}  •  {selected.time}  •  {selected.visit}</Text>{selected.done ? <><Text style={s.fieldLabel}>SET PRIORITY</Text><View style={s.priorityRow}>{(['low', 'moderate', 'high'] as Priority[]).map(priority => <Pressable key={priority} onPress={() => { setPriority(selected.id, priority); setSelected({ ...selected, priority }); }} style={[s.priority, selected.priority === priority && { backgroundColor: C[priority] }]}><Text style={[s.priorityText, selected.priority === priority && { color: '#fff' }]}>{priority}</Text></Pressable>)}</View><Pressable style={s.primary} onPress={() => prescribe(selected)}><Ionicons name="document-text-outline" size={18} color="#fff" /><Text style={s.primaryText}>Prescribe patient</Text></Pressable></> : <><Pressable style={s.primary} onPress={() => setDone(selected.id)}><Ionicons name="checkmark-circle-outline" size={19} color="#fff" /><Text style={s.primaryText}>Mark as done</Text></Pressable><Pressable style={[s.reschedule,sheetReschedule]} onPress={() => reschedule(selected.id)}><Ionicons name="time-outline" size={18} color={C.blue}/><Text style={s.rescheduleText}>Reschedule to {selected.time === '03:00 PM' ? '04:00 PM' : '03:00 PM'}</Text></Pressable></>}</View>}</View></Modal></SafeAreaView>;
}
function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[s.tab, active && s.tabActive]}><Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text></Pressable>; }
function Empty({ tab }: { tab: 'pending' | 'done' }) { return <View style={s.empty}><Ionicons name={tab === 'pending' ? 'calendar-outline' : 'checkmark-done-outline'} size={42} color={C.muted} /><Text style={s.emptyText}>{tab === 'pending' ? 'No appointments on this date.' : 'No completed appointments yet.'}</Text></View>; }
function AppointmentCard({ item, tab, onPress, onPrescribe }: { item: Appointment; tab: 'pending' | 'done'; onPress: () => void; onPrescribe: () => void }) { return <Pressable onPress={onPress} style={s.card}><View style={s.time}><Text style={s.timeText}>{item.time}</Text></View><View style={s.cardInfo}><Text style={s.name}>{item.patientName}</Text><Text style={s.meta}>Age {item.age}  •  {item.visit}</Text>{tab === 'done' && <View style={[s.priorityBadge, { backgroundColor: `${C[item.priority]}18` }]}><Text style={[s.priorityBadgeText, { color: C[item.priority] }]}>{item.priority} priority</Text></View>}</View>{tab === 'done' ? <Pressable onPress={onPrescribe} style={s.rxButton}><Ionicons name="document-text-outline" size={17} color={C.blue} /><Text style={s.rxText}>Prescribe</Text></Pressable> : <Ionicons name="chevron-forward" size={19} color={C.muted} />}</Pressable>; }
function CalendarPicker({ value, month, onMonthChange, onSelect, onClose }: { value: string; month: Date; onMonthChange: (date: Date) => void; onSelect: (date: string) => void; onClose: () => void }) { const first = new Date(month.getFullYear(), month.getMonth(), 1); const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); const cells = Array.from({ length: first.getDay() + days }, (_, index) => index < first.getDay() ? null : index - first.getDay() + 1); const change = (amount: number) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1)); return <View style={s.calendarOverlay}><View style={s.calendarModal}><View style={s.monthRow}><Pressable onPress={() => change(-1)}><Ionicons name="chevron-back" size={21} color={C.ink} /></Pressable><Text style={s.monthTitle}>{MONTHS[month.getMonth()]} {month.getFullYear()}</Text><Pressable onPress={() => change(1)}><Ionicons name="chevron-forward" size={21} color={C.ink} /></Pressable></View><View style={s.weekRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <Text key={`${day}${i}`} style={s.weekday}>{day}</Text>)}</View><View style={s.grid}>{cells.map((day, index) => { const active = !!day && key(new Date(month.getFullYear(), month.getMonth(), day)) === value; return <Pressable key={index} disabled={!day} onPress={() => day && onSelect(key(new Date(month.getFullYear(), month.getMonth(), day)))} style={[s.day, active && s.daySelected]}><Text style={[s.dayText, active && { color: '#fff' }]}>{day || ''}</Text></Pressable>; })}</View><Pressable onPress={onClose} style={s.closeCalendar}><Text style={s.closeCalendarText}>Close</Text></Pressable></View></View>; }
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: C.canvas }, header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { fontSize: 23, fontWeight: '800', color: C.ink }, subtitle: { marginTop: 3, color: C.muted, fontSize: 13 }, calendarButton: { padding: 11, borderRadius: 13, backgroundColor: C.soft }, tabs: { flexDirection: 'row', marginHorizontal: 16, padding: 4, borderRadius: 14, backgroundColor: C.soft }, tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 }, tabActive: { backgroundColor: C.blue }, tabText: { fontSize: 13, fontWeight: '700', color: C.muted }, tabTextActive: { color: '#fff' }, list: { padding: 20, gap: 10 }, listCaption: { color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 2 }, card: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.line }, time: { width: 64, alignItems: 'center' }, timeText: { color: C.blue, fontWeight: '800', fontSize: 12 }, cardInfo: { flex: 1 }, name: { color: C.ink, fontSize: 15, fontWeight: '800' }, meta: { color: C.muted, marginTop: 5, fontSize: 12 }, priorityBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginTop: 7 }, priorityBadgeText: { textTransform: 'capitalize', fontSize: 10, fontWeight: '800' }, rxButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, borderRadius: 10, backgroundColor: C.soft }, rxText: { color: C.blue, fontWeight: '800', fontSize: 11 }, empty: { alignItems: 'center', gap: 12, marginTop: 80 }, emptyText: { color: C.muted, fontSize: 14 }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0006' }, sheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 38 }, handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: C.line, alignSelf: 'center', marginBottom: 18 }, sheetTitle: { fontSize: 20, fontWeight: '800', color: C.ink }, sheetMeta: { color: C.muted, marginTop: 6 }, fieldLabel: { fontSize: 10, letterSpacing: 1, color: C.muted, fontWeight: '800', marginTop: 24, marginBottom: 9 }, priorityRow: { flexDirection: 'row', gap: 8 }, priority: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: C.soft }, priorityText: { textTransform: 'capitalize', color: C.ink, fontWeight: '800', fontSize: 12 }, primary: { marginTop: 23, minHeight: 48, borderRadius: 13, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 }, reschedule: { marginTop: 10, minHeight: 46, borderRadius: 13, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, rescheduleText: { color: C.blue, fontWeight: '800', fontSize: 13 }, calendarOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0006' }, calendarModal: { backgroundColor: C.card, borderRadius: 20, padding: 18 }, monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, monthTitle: { color: C.ink, fontSize: 16, fontWeight: '800' }, weekRow: { flexDirection: 'row' }, weekday: { width: '14.285%', textAlign: 'center', color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 9 }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, day: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 18 }, daySelected: { backgroundColor: C.blue }, dayText: { color: C.ink, fontSize: 13, fontWeight: '700' }, closeCalendar: { marginTop: 15, alignItems: 'center', paddingVertical: 10 }, closeCalendarText: { color: C.blue, fontWeight: '800' } });
