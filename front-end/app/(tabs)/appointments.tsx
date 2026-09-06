import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MQ } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

const HARDCODED_DOCTOR_UUID = '11111111-1111-1111-1111-111111111111';
const TEST_PATIENT_UUID = '22222222-2222-2222-2222-222222222222';
const API_BASE_URL = process.env.EXPO_PUBLIC_CONSULTATION_API_URL || 'http://localhost:5006';

const { width } = Dimensions.get('window');

function AppointmentCard({ doctorName, specialty, date, time, status, rating, style }: { doctorName: string; specialty: string; date: string; time: string; status: string; rating: string; style?: any }) {
  const isUpcoming = status === 'Upcoming';
  return (
    <TouchableOpacity style={[styles.appointmentCard, style]} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <View style={styles.doctorInfoRow}>
          <View style={styles.avatarPlaceholder}>
             <Ionicons name="person" size={24} color={MQ.teal} />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <Text style={styles.specialty}>{specialty}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={MQ.amber} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: isUpcoming ? MQ.blueLight : MQ.greenLight }]}>
          <Text style={[styles.statusText, { color: isUpcoming ? MQ.blue : MQ.green }]}>{status}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardFooter}>
        <View style={styles.dateTimeRow}>
          <Ionicons name="calendar-outline" size={16} color={MQ.textSecondary} />
          <Text style={styles.dateTimeText}>{date}</Text>
          <View style={styles.dotSeparator} />
          <Ionicons name="time-outline" size={16} color={MQ.textSecondary} />
          <Text style={styles.dateTimeText}>{time}</Text>
        </View>
        {isUpcoming && (
          <TouchableOpacity style={styles.rescheduleBtn}>
            <Text style={styles.rescheduleBtnText}>Reschedule</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function DoctorSearchCard({ name, specialty, rating, imageColor }: { name: string, specialty: string, rating: string, imageColor: string }) {
  return (
    <TouchableOpacity style={styles.searchCard} activeOpacity={0.8}>
      <View style={[styles.searchCardImage, { backgroundColor: imageColor }]}>
        <Ionicons name="person" size={24} color={MQ.bgWhite} />
      </View>
      <View style={styles.searchCardInfo}>
        <Text style={styles.searchCardTitle}>{name}</Text>
        <Text style={styles.searchCardSub}>{specialty}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={MQ.amber} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={MQ.textMuted} />
    </TouchableOpacity>
  );
}

function LabCard({ name, tests, rating }: { name: string, tests: string, rating: string }) {
  return (
    <TouchableOpacity style={styles.searchCard} activeOpacity={0.8}>
      <View style={[styles.searchCardImage, { backgroundColor: MQ.purpleLight }]}>
        <Ionicons name="flask" size={24} color={MQ.purple} />
      </View>
      <View style={styles.searchCardInfo}>
        <Text style={styles.searchCardTitle}>{name}</Text>
        <Text style={styles.searchCardSub}>{tests}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={MQ.amber} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={MQ.textMuted} />
    </TouchableOpacity>
  );
}

export default function AppointmentsScreen() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInVisitModal, setShowInVisitModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Dynamic Database & Realtime Status States ─────────────────────────────
  const [doctorName, setDoctorName] = useState('Dr. Alexander Smith');
  const [specialty, setSpecialty] = useState('Senior Physician • 15 Yrs Exp');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [proposedTime, setProposedTime] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [requestType, setRequestType] = useState<'direct_teleconsultation' | 'scheduled_teleconsultation'>('scheduled_teleconsultation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Realtime Sync: Fetch initial state and attach WebSocket listener ─────
  useEffect(() => {
    let cancelled = false;

    const loadInitialRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('appointment_requests')
          .select('*')
          .eq('patient_id', TEST_PATIENT_UUID)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && data && !error) {
          setRequestStatus(data.status);
          setProposedTime(data.proposed_time);
          setActiveRequestId(data.id);
        }
      } catch (err) {
        console.warn('[AppointmentsScreen] Error loading initial request:', err);
      }
    };

    loadInitialRequest();

    // Supabase Realtime WebSocket listener for UPDATE events
    const channel = supabase
      .channel(`patient_appointments_${TEST_PATIENT_UUID}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointment_requests',
          filter: `patient_id=eq.${TEST_PATIENT_UUID}`,
        },
        (payload) => {
          console.log('⚡ [AppointmentsScreen Realtime UPDATE]:', payload.new);
          if (payload.new) {
            setRequestStatus(payload.new.status);
            setProposedTime(payload.new.proposed_time || null);
            setActiveRequestId(payload.new.id);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Dispatch Appointment Request to Backend API ────────────────────────────
  const handleSendAppointmentRequest = async (overrideType?: 'direct_teleconsultation' | 'scheduled_teleconsultation') => {
    const finalType = overrideType || requestType;
    setIsSubmitting(true);
    setRequestStatus('pending');
    setProposedTime(null);

    const formattedDate = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];

    const payload = {
      doctor_id: HARDCODED_DOCTOR_UUID,
      patient_id: TEST_PATIENT_UUID,
      request_type: finalType,
      requested_date: formattedDate,
      requested_time: selectedTime,
      notes: searchQuery ? `Patient Note: ${searchQuery}` : null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/consultation/appointments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Request failed');
      setActiveRequestId(json.data?.id);
    } catch (_) {
      // Direct Supabase fallback
      try {
        const { data } = await supabase
          .from('appointment_requests')
          .insert({ ...payload, status: 'pending' })
          .select()
          .single();
        if (data) setActiveRequestId(data.id);
      } catch (err) {
        console.warn('[AppointmentsScreen] Direct insert fallback error:', err);
      }
    } finally {
      setIsSubmitting(false);
      setShowScheduleModal(false);
      setShowDigitalModal(false);
    }
  };
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const renderCalendar = () => {
    const days = generateCalendarDays();
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-back" size={20} color={MQ.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.calMonthText}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-forward" size={20} color={MQ.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.calWeekRow}>
          {weekDays.map(day => (
            <Text key={day} style={styles.calWeekText}>{day}</Text>
          ))}
        </View>
        <View style={styles.calDaysGrid}>
          {days.map((date, index) => {
            if (!date) return <View key={`empty-${index}`} style={styles.calDayBox} />;
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.calDayBox, isSelected && styles.calDayActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.calDayText, isSelected && { color: MQ.bgWhite }, isToday && !isSelected && { color: MQ.teal, fontWeight: '800' }]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const availableTimes = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '04:00 PM'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Light gradient backdrop */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="Appointments"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        style={styles.header}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Assigned Doctor Section */}
        <View style={[styles.sectionHeader, { marginTop: 0 }]}>
          <Text style={styles.sectionTitle}>Assigned Doctor</Text>
        </View>
        
        <View style={styles.assignedDoctorCard}>
          {requestStatus && (
            <View style={[
              styles.doctorStatusBadge,
              {
                backgroundColor:
                  requestStatus === 'accepted'
                    ? MQ.greenLight
                    : requestStatus === 'rejected'
                    ? MQ.redLight
                    : requestStatus === 'rescheduled'
                    ? MQ.blueLight
                    : MQ.amberLight,
              },
            ]}>
              <Ionicons
                name={
                  requestStatus === 'accepted'
                    ? 'checkmark-circle'
                    : requestStatus === 'rejected'
                    ? 'close-circle'
                    : requestStatus === 'rescheduled'
                    ? 'calendar'
                    : 'time'
                }
                size={14}
                color={
                  requestStatus === 'accepted'
                    ? MQ.green
                    : requestStatus === 'rejected'
                    ? MQ.red
                    : requestStatus === 'rescheduled'
                    ? MQ.blue
                    : MQ.amber
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.doctorStatusBadgeText,
                  {
                    color:
                      requestStatus === 'accepted'
                        ? MQ.green
                        : requestStatus === 'rejected'
                        ? MQ.red
                        : requestStatus === 'rescheduled'
                        ? MQ.blue
                        : MQ.amber,
                  },
                ]}
              >
                {requestStatus === 'rescheduled' && proposedTime
                  ? `Rescheduled at ${new Date(proposedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : requestStatus === 'pending'
                  ? 'Request Pending'
                  : requestStatus.charAt(0).toUpperCase() + requestStatus.slice(1)}
              </Text>
            </View>
          )}

          <View style={styles.assignedDoctorInfo}>
            <View style={styles.doctorPhotoWrap}>
              <Ionicons name="person" size={32} color={MQ.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assignedDoctorName}>{doctorName}</Text>
              <Text style={styles.assignedDoctorSpecialty}>{specialty}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={MQ.amber} />
                <Text style={styles.ratingText}>4.9 (120 Reviews)</Text>
              </View>
            </View>
          </View>
          <View style={styles.assignedDoctorButtons}>
            <TouchableOpacity style={styles.digitalBtn} onPress={() => setShowDigitalModal(true)}>
              <Ionicons name="videocam-outline" size={18} color={MQ.teal} style={{marginRight: 6}} />
              <Text style={styles.digitalBtnText}>Digital Appt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inVisitBtn} onPress={() => setShowInVisitModal(true)}>
              <Ionicons name="business-outline" size={18} color={MQ.bgWhite} style={{marginRight: 6}} />
              <Text style={styles.inVisitBtnText}>In-visit Appt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={MQ.textSecondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search doctors, labs, tests..."
            placeholderTextColor={MQ.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
        </View>
        <DoctorSearchCard name="Dr. Sophia Williams" specialty="Neurologist" rating="4.9 (140 Reviews)" imageColor={MQ.blue} />
        <DoctorSearchCard name="Dr. Michael Chang" specialty="Orthopedic" rating="4.8 (95 Reviews)" imageColor={MQ.teal} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Labs</Text>
        </View>
        <LabCard name="HealthPlus Diagnostics" tests="Blood Test, MRI, X-Ray" rating="4.7 (200 Reviews)" />
        <LabCard name="CityCare PathLab" tests="Full Body Checkup, ECG" rating="4.6 (150 Reviews)" />

        {/* Upcoming Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>
        
        <AppointmentCard 
          doctorName="Dr. Sarah Jenkins"
          specialty="Cardiologist"
          date="Today"
          time="2:30 PM"
          status="Upcoming"
          rating="4.9"
        />

        <AppointmentCard 
          doctorName="Dr. Robert Chen"
          specialty="General Physician"
          date="Tomorrow, 12 Aug"
          time="10:00 AM"
          status="Upcoming"
          rating="4.8"
        />

        {/* Past Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
          <AppointmentCard 
            doctorName="Dr. Emily White"
            specialty="Dermatologist"
            date="05 Aug 2023"
            time="4:15 PM"
            status="Completed"
            rating="4.7"
            style={styles.carouselCard}
          />
          <AppointmentCard 
            doctorName="Dr. John Davis"
            specialty="Cardiologist"
            date="20 Jul 2023"
            time="11:30 AM"
            status="Completed"
            rating="4.9"
            style={styles.carouselCard}
          />
          <AppointmentCard 
            doctorName="Dr. Sarah Jenkins"
            specialty="General Physician"
            date="10 Jun 2023"
            time="09:00 AM"
            status="Completed"
            rating="4.6"
            style={styles.carouselCard}
          />
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Digital Appointment Modal */}
      <Modal
        visible={showDigitalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDigitalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowDigitalModal(false)}>
              <Ionicons name="close" size={24} color={MQ.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Digital Appointment</Text>
            <Text style={styles.modalSub}>How would you like to connect with Dr. Alexander Smith?</Text>

            <TouchableOpacity 
              style={styles.modalOptionBtn} 
              activeOpacity={0.7}
              onPress={() => {
                setRequestType('direct_teleconsultation');
                setShowDigitalModal(false);
                setShowScheduleModal(true);
              }}
            >
              <View style={[styles.modalOptionIconWrap, { backgroundColor: MQ.purpleLight }]}>
                <Ionicons name="chatbubbles-outline" size={24} color={MQ.purple} />
              </View>
              <View style={styles.modalOptionTextWrap}>
                <Text style={styles.modalOptionTitle}>Request Direct Teleconsultation</Text>
                <Text style={styles.modalOptionSub}>Connect instantly via chat or call.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={MQ.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOptionBtn} 
              activeOpacity={0.7} 
              onPress={() => { 
                setRequestType('scheduled_teleconsultation');
                setShowDigitalModal(false); 
                setShowScheduleModal(true); 
              }}
            >
              <View style={[styles.modalOptionIconWrap, { backgroundColor: MQ.tealLight }]}>
                <Ionicons name="calendar-outline" size={24} color={MQ.teal} />
              </View>
              <View style={styles.modalOptionTextWrap}>
                <Text style={styles.modalOptionTitle}>Schedule Teleconsultation</Text>
                <Text style={styles.modalOptionSub}>Pick a date and time for a video visit.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={MQ.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Schedule Digital Appointment Modal */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => { setShowScheduleModal(false); setShowDigitalModal(true); }}>
                <Ionicons name="arrow-back" size={24} color={MQ.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Schedule Appointment</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={24} color={MQ.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.scheduleSectionTitle}>Select Date</Text>
            {renderCalendar()}

            <Text style={styles.scheduleSectionTitle}>Select Time</Text>
            <View style={styles.timeGrid}>
              {availableTimes.map(time => (
                <TouchableOpacity 
                  key={time} 
                  style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && { color: MQ.bgWhite }]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.addApptBtn, isSubmitting && { opacity: 0.7 }]} 
              onPress={() => handleSendAppointmentRequest()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={MQ.bgWhite} />
              ) : (
                <Text style={styles.addApptBtnText}>Confirm & Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* In-visit Appointment Modal */}
      <Modal
        visible={showInVisitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInVisitModal(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetBox}>
            <View style={styles.sheetHeader}>
              <View style={{ width: 24 }} />
              <Text style={styles.sheetTitle}>In-visit Appointment</Text>
              <TouchableOpacity onPress={() => setShowInVisitModal(false)}>
                <Ionicons name="close" size={24} color={MQ.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.scheduleSectionTitle}>Select Date</Text>
            {renderCalendar()}

            <Text style={styles.scheduleSectionTitle}>Select Time</Text>
            <View style={styles.timeGrid}>
              {availableTimes.map(time => (
                <TouchableOpacity 
                  key={time} 
                  style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[styles.timeText, selectedTime === time && { color: MQ.bgWhite }]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addApptBtn} onPress={() => setShowInVisitModal(false)}>
              <Text style={styles.addApptBtnText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: MQ.bgLight },
  bgLight:   { ...StyleSheet.absoluteFillObject, backgroundColor: MQ.bgLight },
  bgTealTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: MQ.tealWash, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  header:    { backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: MQ.bgWhite, borderRadius: 16, paddingHorizontal: 16, height: 50, marginBottom: 20, borderWidth: 1, borderColor: MQ.tealBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: MQ.textPrimary, height: '100%' },
  
  searchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: MQ.bgWhite, borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: MQ.tealBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchCardImage: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  searchCardInfo: { flex: 1 },
  searchCardTitle: { fontSize: 15, fontWeight: '700', color: MQ.textPrimary, marginBottom: 2 },
  searchCardSub: { fontSize: 13, color: MQ.textSecondary, marginBottom: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 4, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: MQ.textPrimary, letterSpacing: 0.2 },

  carouselContainer: { paddingBottom: 10, paddingRight: 16 },
  carouselCard: { width: width * 0.75, marginBottom: 0, marginRight: 16 },

  appointmentCard: { backgroundColor: MQ.bgWhite, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: MQ.tealBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  doctorInfoRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: MQ.tealLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '700', color: MQ.textPrimary, marginBottom: 2 },
  specialty: { fontSize: 13, color: MQ.textSecondary, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, fontWeight: '600', color: MQ.textSecondary, marginLeft: 4 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  
  divider: { height: 1, backgroundColor: MQ.tealBorder, marginVertical: 14 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center' },
  dateTimeText: { fontSize: 13, color: MQ.textSecondary, marginLeft: 6, fontWeight: '500' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: MQ.textMuted, marginHorizontal: 8 },
  
  rescheduleBtn: { backgroundColor: MQ.tealLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rescheduleBtnText: { color: MQ.teal, fontWeight: '700', fontSize: 12 },

  assignedDoctorCard: { backgroundColor: MQ.glassBg, borderRadius: 20, borderWidth: 1, borderColor: MQ.tealBorder, padding: 18, marginBottom: 20 },
  assignedDoctorInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  doctorPhotoWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: MQ.tealLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  assignedDoctorName: { fontSize: 18, fontWeight: '800', color: MQ.textPrimary, marginBottom: 4 },
  assignedDoctorSpecialty: { fontSize: 13, color: MQ.textSecondary, marginBottom: 6 },
  assignedDoctorButtons: { flexDirection: 'row', gap: 10 },
  digitalBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: MQ.tealLight, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: MQ.tealBorder },
  digitalBtnText: { color: MQ.teal, fontWeight: '700', fontSize: 13 },
  inVisitBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: MQ.teal, paddingVertical: 12, borderRadius: 12 },
  inVisitBtnText: { color: MQ.bgWhite, fontWeight: '700', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', backgroundColor: MQ.bgWhite, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: MQ.textPrimary, textAlign: 'center', marginBottom: 6, marginTop: 10 },
  modalSub: { fontSize: 13, color: MQ.textSecondary, textAlign: 'center', marginBottom: 24, paddingHorizontal: 10, lineHeight: 18 },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },
  modalOptionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: MQ.bgLight, borderRadius: 16, borderWidth: 1, borderColor: MQ.tealBorder, padding: 16, marginBottom: 12 },
  modalOptionIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  modalOptionTextWrap: { flex: 1 },
  modalOptionTitle: { fontSize: 15, fontWeight: '700', color: MQ.textPrimary, marginBottom: 4 },
  modalOptionSub: { fontSize: 12, color: MQ.textSecondary, lineHeight: 16 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetBox: { backgroundColor: MQ.bgWhite, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: MQ.textPrimary },
  scheduleSectionTitle: { fontSize: 15, fontWeight: '700', color: MQ.textPrimary, marginBottom: 12, marginTop: 4 },
  calendarContainer: { backgroundColor: MQ.bgWhite, borderRadius: 16, borderWidth: 1, borderColor: MQ.tealBorder, padding: 12, marginBottom: 20 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calNavBtn: { padding: 4 },
  calMonthText: { fontSize: 15, fontWeight: '700', color: MQ.textPrimary },
  calWeekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  calWeekText: { fontSize: 12, color: MQ.textMuted, width: 36, textAlign: 'center', fontWeight: '600' },
  calDaysGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  calDayBox: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, marginBottom: 6 },
  calDayActive: { backgroundColor: MQ.teal },
  calDayText: { fontSize: 14, color: MQ.textPrimary, fontWeight: '500' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  timeChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: MQ.bgLight, borderWidth: 1, borderColor: MQ.tealBorder },
  timeChipActive: { backgroundColor: MQ.teal, borderColor: MQ.teal },
  timeText: { fontSize: 13, fontWeight: '600', color: MQ.textPrimary },
  addApptBtn: { backgroundColor: MQ.teal, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  addApptBtnText: { color: MQ.bgWhite, fontSize: 16, fontWeight: '700' },
  doctorStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  doctorStatusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
