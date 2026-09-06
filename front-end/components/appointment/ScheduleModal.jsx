import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MQ } from '@/constants/theme';

const AVAILABLE_TIMES = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '02:00 PM',
  '02:30 PM',
  '04:00 PM',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * ScheduleModal
 * Preserves the exact MediQuick calendar and time picker UI,
 * allowing rural patients to submit direct or scheduled teleconsultation requests.
 */
export default function ScheduleModal({
  visible,
  onClose,
  onSubmit,
  initialRequestType = 'scheduled_teleconsultation',
  doctorName = 'Dr. Alexander Smith',
  isSubmitting = false,
}) {
  const [requestType, setRequestType] = useState(initialRequestType);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

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

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const renderCalendar = () => {
    const days = generateCalendarDays();
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-back" size={20} color={MQ.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.calMonthText}>
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
            <Ionicons name="chevron-forward" size={20} color={MQ.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.calWeekRow}>
          {WEEK_DAYS.map((day) => (
            <Text key={day} style={styles.calWeekText}>{day}</Text>
          ))}
        </View>
        <View style={styles.calDaysGrid}>
          {days.map((date, index) => {
            if (!date) return <View key={`empty-${index}`} style={styles.calDayBox} />;
            const isSelected =
              selectedDate && selectedDate.toDateString() === date.toDateString();
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.calDayBox, isSelected && styles.calDayActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.calDayText,
                    isSelected && { color: MQ.bgWhite, fontWeight: '700' },
                    isToday && !isSelected && { color: MQ.teal, fontWeight: '800' },
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const handleSubmit = () => {
    const dateFormatted = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];

    onSubmit({
      requestType,
      requestedDate: dateFormatted,
      requestedTime: selectedTime,
      notes: notes.trim(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <View style={styles.sheetBox}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Schedule Teleconsultation</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color={MQ.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Request Type Selector */}
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                style={[
                  styles.typeChip,
                  requestType === 'direct_teleconsultation' && styles.typeChipActive,
                ]}
                onPress={() => setRequestType('direct_teleconsultation')}
              >
                <Ionicons
                  name="flash-outline"
                  size={16}
                  color={requestType === 'direct_teleconsultation' ? MQ.bgWhite : MQ.teal}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    requestType === 'direct_teleconsultation' && styles.typeChipTextActive,
                  ]}
                >
                  Direct Teleconsult
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeChip,
                  requestType === 'scheduled_teleconsultation' && styles.typeChipActive,
                ]}
                onPress={() => setRequestType('scheduled_teleconsultation')}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={requestType === 'scheduled_teleconsultation' ? MQ.bgWhite : MQ.teal}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    requestType === 'scheduled_teleconsultation' && styles.typeChipTextActive,
                  ]}
                >
                  Schedule Visit
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.scheduleSectionTitle}>Select Date</Text>
            {renderCalendar()}

            <Text style={styles.scheduleSectionTitle}>Select Time Slot</Text>
            <View style={styles.timeGrid}>
              {AVAILABLE_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && { color: MQ.bgWhite, fontWeight: '700' },
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.scheduleSectionTitle}>Symptoms / Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Fever, cough for 2 days, mild dizziness..."
              placeholderTextColor={MQ.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.addApptBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={MQ.bgWhite} />
              ) : (
                <Text style={styles.addApptBtnText}>Confirm & Send Request</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetBox: {
    maxHeight: '90%',
    backgroundColor: MQ.bgWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: MQ.textPrimary,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: MQ.tealLight,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
  },
  typeChipActive: {
    backgroundColor: MQ.teal,
    borderColor: MQ.teal,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: MQ.teal,
  },
  typeChipTextActive: {
    color: MQ.bgWhite,
  },
  scheduleSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: MQ.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  calendarContainer: {
    backgroundColor: MQ.bgWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
    padding: 12,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calNavBtn: {
    padding: 4,
  },
  calMonthText: {
    fontSize: 15,
    fontWeight: '700',
    color: MQ.textPrimary,
  },
  calWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calWeekText: {
    fontSize: 12,
    color: MQ.textMuted,
    width: 36,
    textAlign: 'center',
    fontWeight: '600',
  },
  calDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calDayBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginBottom: 6,
  },
  calDayActive: {
    backgroundColor: MQ.teal,
  },
  calDayText: {
    fontSize: 14,
    color: MQ.textPrimary,
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: MQ.bgLight,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
  },
  timeChipActive: {
    backgroundColor: MQ.teal,
    borderColor: MQ.teal,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: MQ.textPrimary,
  },
  notesInput: {
    backgroundColor: MQ.bgLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
    padding: 12,
    fontSize: 14,
    color: MQ.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  addApptBtn: {
    backgroundColor: MQ.teal,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: MQ.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addApptBtnText: {
    color: MQ.bgWhite,
    fontSize: 15,
    fontWeight: '700',
  },
});
