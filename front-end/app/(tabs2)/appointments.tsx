import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Priority = 'low' | 'moderate' | 'high';
type AppointmentStatus = 'pending' | 'accepted' | 'completed' | 'rescheduled' | 'rejected';
type Appointment = {
  id: string;
  patientName: string;
  age: number;
  time: string;
  visit: 'In-clinic' | 'Video';
  dateKey: string;
  status: AppointmentStatus;
  done: boolean;
  priority: Priority;
};

type TabType = 'requests' | 'upcoming' | 'done';

const C = {
  blue: '#246BFD',
  ink: '#152B4F',
  muted: '#75839A',
  canvas: '#FBF7F2',
  card: '#FFFFFF',
  line: '#E6EAF0',
  soft: '#EEF4FF',
  low: '#10B981',
  moderate: '#D97706',
  high: '#E5484D',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const today = new Date();
today.setHours(0, 0, 0, 0);

// No mock roster. Two of the placeholders were `status: 'accepted'` dated
// today, which pinned the Upcoming tab to today's date and hid real accepted
// requests for any other day — and none of them carried a patientId, so
// tapping one could never open the prescription form.

const formatDate = (dateKey: string) =>
  new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const sheetReschedule = {
  marginTop: 10,
  minHeight: 46,
  borderRadius: 13,
  backgroundColor: '#EEF4FF',
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  flexDirection: 'row' as const,
  gap: 8,
};

export default function Appointments() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<TabType>('requests');
  // null = show every date. Only set when the doctor picks a day, so an
  // accepted appointment can never be filtered out by a date nobody chose.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
            const rawStatus = (r.status || 'pending').toLowerCase();
            const status: AppointmentStatus =
              rawStatus === 'completed' || rawStatus === 'done'
                ? 'completed'
                : rawStatus === 'accepted' || rawStatus === 'scheduled'
                ? 'accepted'
                : rawStatus === 'rescheduled'
                ? 'rescheduled'
                : rawStatus === 'rejected' || rawStatus === 'cancelled'
                ? 'rejected'
                : 'pending';

            return {
              id: r.id,
              patientName: r.patient?.name || 'Patient',
              age: r.patient?.age || (r.patient?.blood_group ? 28 : 34),
              time: r.requested_time || '10:00 AM',
              visit: r.request_type?.includes('teleconsultation') ? 'Video' : 'In-clinic',
              dateKey: reqDate,
              status,
              done: status === 'completed',
              priority: 'moderate',
            };
          });

          setAppointments(mapped);
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

  const isRequest = (item: Appointment) => item.status === 'pending' || item.status === 'rescheduled';
  const isUpcoming = (item: Appointment) => item.status === 'accepted' && !item.done;
  const isDone = (item: Appointment) => item.status === 'completed' || item.done;

  const requestsCount = useMemo(
    () => appointments.filter(isRequest).length,
    [appointments]
  );
  const upcomingCount = useMemo(
    () => appointments.filter(isUpcoming).length,
    [appointments]
  );
  const doneCount = useMemo(
    () => appointments.filter(isDone).length,
    [appointments]
  );

  const dayAppointments = useMemo(() => {
    const matchesDate = (item: Appointment) =>
      selectedDate === null || item.dateKey === selectedDate;

    return appointments.filter(item => {
      // Requests are never date-filtered — a request you have not answered
      // matters whatever day it is for.
      if (tab === 'requests') return isRequest(item);
      if (tab === 'upcoming') return isUpcoming(item) && matchesDate(item);
      return isDone(item) && matchesDate(item);
    });
  }, [appointments, selectedDate, tab]);

  const visible = useMemo(() => {
    return [...dayAppointments].sort((a, b) => {
      const aIsDb = a.id.length > 10;
      const bIsDb = b.id.length > 10;
      if (aIsDb && !bIsDb) return -1;
      if (!aIsDb && bIsDb) return 1;
      return a.time.localeCompare(b.time);
    });
  }, [dayAppointments]);

  const acceptRequest = async (id: string) => {
    setAppointments(items =>
      items.map(item => (item.id === id ? { ...item, status: 'accepted', done: false } : item))
    );
    setSelected(null);
    try {
      const { data: updatedReq, error: reqErr } = await supabase
        .from('appointment_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (!reqErr && updatedReq) {
        let scheduledAt = new Date().toISOString();
        try {
          const dPart = updatedReq.requested_date || new Date().toISOString().split('T')[0];
          const tPart = updatedReq.requested_time || '10:00 AM';
          scheduledAt = new Date(`${dPart} ${tPart}`).toISOString();
        } catch (_) {}

        const { data: existingAppt } = await supabase
          .from('appointments')
          .select('id')
          .eq('appointment_request_id', id)
          .maybeSingle();

        if (!existingAppt) {
          await supabase.from('appointments').insert({
            appointment_request_id: id,
            doctor_id: updatedReq.doctor_id,
            patient_id: updatedReq.patient_id,
            scheduled_at: scheduledAt,
            status: 'scheduled',
            mode: updatedReq.request_type?.includes('teleconsultation') ? 'video' : 'in_person',
            booked_by: 'patient',
            reason: updatedReq.notes || 'Consultation',
          });
        }
      }
    } catch (e) {
      console.warn('[Doctor Appointments] approve error:', e);
    }
  };

  const cancelAppointment = async (id: string) => {
    setAppointments(items =>
      items.map(item => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
    setSelected(null);
    try {
      await supabase
        .from('appointment_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', id);

      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('appointment_request_id', id);
    } catch (e) {
      console.warn('[Doctor Appointments] cancel error:', e);
    }
  };

  const rejectRequest = cancelAppointment;

  const setDone = async (id: string) => {
    setAppointments(items =>
      items.map(item => (item.id === id ? { ...item, status: 'completed', done: true } : item))
    );
    setSelected(null);
    try {
      await supabase
        .from('appointment_requests')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', id);

      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('appointment_request_id', id);
    } catch (e) {
      console.warn('[Doctor Appointments] complete error:', e);
    }
  };

  const setPriority = (id: string, priority: Priority) =>
    setAppointments(items =>
      items.map(item => (item.id === id ? { ...item, priority } : item))
    );

  const reschedule = async (id: string) => {
    const newTime = selected?.time === '03:00 PM' ? '04:00 PM' : '03:00 PM';
    setAppointments(items =>
      items.map(item => (item.id === id ? { ...item, time: newTime, status: 'rescheduled' } : item))
    );
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

      await supabase
        .from('appointments')
        .update({
          scheduled_at: proposedIso,
          status: 'rescheduled',
        })
        .eq('appointment_request_id', id);
    } catch (e) {
      console.warn('[Doctor Appointments] reschedule error:', e);
    }
  };

  const prescribe = (item: Appointment) => {
    setSelected(null);
    router.push({
      pathname: '/(tabs2)/new',
      params: { patientName: item.patientName, patientAge: String(item.age) },
    } as any);
  };

  const startConsultation = (item: Appointment) => {
    setSelected(null);
    router.push({
      pathname: '/(tabs2)/consultation' as any,
      params: {
        appointmentId: item.id,
        patientName: item.patientName,
        patientAge: String(item.age),
      },
    });
  };

  return (
    <SafeAreaView style={s.screen} edges={['top', 'left', 'right']}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Appointments</Text>
          <Text style={s.subtitle}>
            {selectedDate ? formatDate(selectedDate) : 'All dates'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {selectedDate !== null && (
            <Pressable style={s.calendarButton} onPress={() => setSelectedDate(null)}>
              <Ionicons name="close" size={19} color={C.blue} />
            </Pressable>
          )}
          <Pressable style={s.calendarButton} onPress={() => setCalendarOpen(true)}>
            <Ionicons name="calendar-outline" size={21} color={C.blue} />
          </Pressable>
        </View>
      </View>

      <View style={s.tabs}>
        <Tab
          label={`Requests (${requestsCount})`}
          active={tab === 'requests'}
          onPress={() => setTab('requests')}
        />
        <Tab
          label={`Upcoming (${upcomingCount})`}
          active={tab === 'upcoming'}
          onPress={() => setTab('upcoming')}
        />
        <Tab
          label={`Done (${doneCount})`}
          active={tab === 'done'}
          onPress={() => setTab('done')}
        />
      </View>

      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        <Text style={s.listCaption}>
          {tab === 'requests'
            ? 'Patient requests awaiting action'
            : tab === 'upcoming'
            ? 'Confirmed scheduled visits'
            : 'Completed visits'}
        </Text>
        {visible.length === 0 ? (
          <Empty tab={tab} />
        ) : (
          visible.map(item => (
            <AppointmentCard
              key={item.id}
              item={item}
              tab={tab}
              onPress={() => setSelected(item)}
              onPrescribe={() => prescribe(item)}
              selectedDate={selectedDate ?? undefined}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        {/* No filter set: open the calendar on today rather than nowhere. */}
        <CalendarPicker
          value={selectedDate ?? key(today)}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          onSelect={date => {
            setSelectedDate(date);
            setCalendarOpen(false);
          }}
          onClose={() => setCalendarOpen(false)}
        />
      </Modal>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />
          {selected && (
            <View style={s.sheet}>
              <View style={s.handle} />
              <Text style={s.sheetTitle}>{selected.patientName}</Text>
              <Text style={s.sheetMeta}>
                Age {selected.age} • {selected.time} • {selected.visit} • {formatDate(selected.dateKey)}
              </Text>

              {isDone(selected) ? (
                <>
                  <Text style={s.fieldLabel}>SET PRIORITY</Text>
                  <View style={s.priorityRow}>
                    {(['low', 'moderate', 'high'] as Priority[]).map(priority => (
                      <Pressable
                        key={priority}
                        onPress={() => {
                          setPriority(selected.id, priority);
                          setSelected({ ...selected, priority });
                        }}
                        style={[
                          s.priority,
                          selected.priority === priority && { backgroundColor: C[priority] },
                        ]}
                      >
                        <Text
                          style={[
                            s.priorityText,
                            selected.priority === priority && { color: '#fff' },
                          ]}
                        >
                          {priority}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Pressable style={s.primary} onPress={() => prescribe(selected)}>
                    <Ionicons name="document-text-outline" size={18} color="#fff" />
                    <Text style={s.primaryText}>Prescribe patient</Text>
                  </Pressable>
                </>
              ) : isUpcoming(selected) ? (
                <>
                  {selected.visit === 'Video' && (
                    <Pressable
                      style={[s.primary, { backgroundColor: '#0284C7' }]}
                      onPress={() => startConsultation(selected)}
                    >
                      <Ionicons name="videocam-outline" size={19} color="#fff" />
                      <Text style={s.primaryText}>Start Video Consultation</Text>
                    </Pressable>
                  )}
                  <Pressable style={s.primary} onPress={() => setDone(selected.id)}>
                    <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />
                    <Text style={s.primaryText}>Mark as done</Text>
                  </Pressable>
                  <Pressable style={s.secondary} onPress={() => prescribe(selected)}>
                    <Ionicons name="document-text-outline" size={18} color={C.blue} />
                    <Text style={s.secondaryText}>Prescribe patient</Text>
                  </Pressable>
                  <Pressable
                    style={[s.reschedule, sheetReschedule]}
                    onPress={() => reschedule(selected.id)}
                  >
                    <Ionicons name="time-outline" size={18} color={C.blue} />
                    <Text style={s.rescheduleText}>
                      Reschedule to {selected.time === '03:00 PM' ? '04:00 PM' : '03:00 PM'}
                    </Text>
                  </Pressable>
                  <Pressable style={s.dangerBtn} onPress={() => cancelAppointment(selected.id)}>
                    <Ionicons name="close-circle-outline" size={18} color={C.high} />
                    <Text style={s.dangerBtnText}>Cancel appointment</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={s.primary} onPress={() => acceptRequest(selected.id)}>
                    <Ionicons name="checkmark-circle-outline" size={19} color="#fff" />
                    <Text style={s.primaryText}>Accept request</Text>
                  </Pressable>
                  <Pressable
                    style={[s.reschedule, sheetReschedule]}
                    onPress={() => reschedule(selected.id)}
                  >
                    <Ionicons name="time-outline" size={18} color={C.blue} />
                    <Text style={s.rescheduleText}>
                      Reschedule to {selected.time === '03:00 PM' ? '04:00 PM' : '03:00 PM'}
                    </Text>
                  </Pressable>
                  <Pressable style={s.dangerBtn} onPress={() => cancelAppointment(selected.id)}>
                    <Ionicons name="close-circle-outline" size={18} color={C.high} />
                    <Text style={s.dangerBtnText}>Cancel / Reject request</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.tab, active && s.tabActive]}>
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Empty({ tab }: { tab: TabType }) {
  return (
    <View style={s.empty}>
      <Ionicons
        name={
          tab === 'requests'
            ? 'mail-unread-outline'
            : tab === 'upcoming'
            ? 'calendar-outline'
            : 'checkmark-done-outline'
        }
        size={42}
        color={C.muted}
      />
      <Text style={s.emptyText}>
        {tab === 'requests'
          ? 'No pending appointment requests.'
          : tab === 'upcoming'
          ? 'No upcoming appointments on this date.'
          : 'No completed appointments yet.'}
      </Text>
    </View>
  );
}

function AppointmentCard({
  item,
  tab,
  onPress,
  onPrescribe,
  selectedDate,
}: {
  item: Appointment;
  tab: TabType;
  onPress: () => void;
  onPrescribe: () => void;
  selectedDate?: string;
}) {
  return (
    <Pressable onPress={onPress} style={s.card}>
      <View style={s.time}>
        <Text style={s.timeText}>{item.time}</Text>
      </View>
      <View style={s.cardInfo}>
        <Text style={s.name}>{item.patientName}</Text>
        <Text style={s.meta}>
          Age {item.age} • {item.visit}
          {item.dateKey && selectedDate && item.dateKey !== selectedDate
            ? ` • ${formatDate(item.dateKey)}`
            : ''}
        </Text>
        {tab === 'done' ? (
          <View style={[s.priorityBadge, { backgroundColor: `${C[item.priority]}18` }]}>
            <Text style={[s.priorityBadgeText, { color: C[item.priority] }]}>
              {item.priority} priority
            </Text>
          </View>
        ) : tab === 'requests' ? (
          <View style={[s.priorityBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[s.priorityBadgeText, { color: '#D97706' }]}>New Request</Text>
          </View>
        ) : (
          <View style={[s.priorityBadge, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[s.priorityBadgeText, { color: C.blue }]}>Confirmed</Text>
          </View>
        )}
      </View>
      {tab === 'done' ? (
        <Pressable onPress={onPrescribe} style={s.rxButton}>
          <Ionicons name="document-text-outline" size={17} color={C.blue} />
          <Text style={s.rxText}>Prescribe</Text>
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={19} color={C.muted} />
      )}
    </Pressable>
  );
}

function CalendarPicker({
  value,
  month,
  onMonthChange,
  onSelect,
  onClose,
}: {
  value: string;
  month: Date;
  onMonthChange: (date: Date) => void;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: first.getDay() + days }, (_, index) =>
    index < first.getDay() ? null : index - first.getDay() + 1
  );
  const change = (amount: number) =>
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1));

  return (
    <View style={s.calendarOverlay}>
      <View style={s.calendarModal}>
        <View style={s.monthRow}>
          <Pressable onPress={() => change(-1)}>
            <Ionicons name="chevron-back" size={21} color={C.ink} />
          </Pressable>
          <Text style={s.monthTitle}>
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </Text>
          <Pressable onPress={() => change(1)}>
            <Ionicons name="chevron-forward" size={21} color={C.ink} />
          </Pressable>
        </View>
        <View style={s.weekRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Text key={`${day}${i}`} style={s.weekday}>
              {day}
            </Text>
          ))}
        </View>
        <View style={s.grid}>
          {cells.map((day, index) => {
            const active =
              !!day &&
              key(new Date(month.getFullYear(), month.getMonth(), day)) === value;
            return (
              <Pressable
                key={index}
                disabled={!day}
                onPress={() =>
                  day && onSelect(key(new Date(month.getFullYear(), month.getMonth(), day)))
                }
                style={[s.day, active && s.daySelected]}
              >
                <Text style={[s.dayText, active && { color: '#fff' }]}>{day || ''}</Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={onClose} style={s.closeCalendar}>
          <Text style={s.closeCalendarText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 23, fontWeight: '800', color: C.ink },
  subtitle: { marginTop: 3, color: C.muted, fontSize: 13 },
  calendarButton: { padding: 11, borderRadius: 13, backgroundColor: C.soft },
  tabs: { flexDirection: 'row', marginHorizontal: 16, padding: 4, borderRadius: 14, backgroundColor: C.soft, gap: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: C.blue },
  tabText: { fontSize: 12, fontWeight: '700', color: C.muted },
  tabTextActive: { color: '#fff' },
  list: { padding: 20, gap: 10 },
  listCaption: { color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  card: { minHeight: 84, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  time: { width: 64, alignItems: 'center' },
  timeText: { color: C.blue, fontWeight: '800', fontSize: 12 },
  cardInfo: { flex: 1 },
  name: { color: C.ink, fontSize: 15, fontWeight: '800' },
  meta: { color: C.muted, marginTop: 5, fontSize: 12 },
  priorityBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, marginTop: 7 },
  priorityBadgeText: { textTransform: 'capitalize', fontSize: 10, fontWeight: '800' },
  rxButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, borderRadius: 10, backgroundColor: C.soft },
  rxText: { color: C.blue, fontWeight: '800', fontSize: 11 },
  empty: { alignItems: 'center', gap: 12, marginTop: 80 },
  emptyText: { color: C.muted, fontSize: 14 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0006' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 38 },
  handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: C.line, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.ink },
  sheetMeta: { color: C.muted, marginTop: 6 },
  fieldLabel: { fontSize: 10, letterSpacing: 1, color: C.muted, fontWeight: '800', marginTop: 24, marginBottom: 9 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priority: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: C.soft },
  priorityText: { textTransform: 'capitalize', color: C.ink, fontWeight: '800', fontSize: 12 },
  primary: { marginTop: 20, minHeight: 48, borderRadius: 13, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  secondary: { marginTop: 10, minHeight: 46, borderRadius: 13, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  secondaryText: { color: C.blue, fontWeight: '800', fontSize: 13 },
  reschedule: { marginTop: 10, minHeight: 46, borderRadius: 13, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  rescheduleText: { color: C.blue, fontWeight: '800', fontSize: 13 },
  dangerBtn: { marginTop: 10, minHeight: 46, borderRadius: 13, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  dangerBtnText: { color: C.high, fontWeight: '800', fontSize: 13 },
  calendarOverlay: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#0006' },
  calendarModal: { backgroundColor: C.card, borderRadius: 20, padding: 18 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthTitle: { color: C.ink, fontSize: 16, fontWeight: '800' },
  weekRow: { flexDirection: 'row' },
  weekday: { width: '14.285%', textAlign: 'center', color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 9 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  day: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  daySelected: { backgroundColor: C.blue },
  dayText: { color: C.ink, fontSize: 13, fontWeight: '700' },
  closeCalendar: { marginTop: 15, alignItems: 'center', paddingVertical: 10 },
  closeCalendarText: { color: C.blue, fontWeight: '800' },
});
