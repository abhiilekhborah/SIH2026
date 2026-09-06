import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MQ } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import DoctorProfileCard from './DoctorProfileCard';
import ScheduleModal from './ScheduleModal';

// Hardcoded IDs for SIH rural simulation & testing
export const HARDCODED_DOCTOR_UUID = '11111111-1111-1111-1111-111111111111';
export const TEST_PATIENT_UUID = '22222222-2222-2222-2222-222222222222';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_CONSULTATION_API_URL || 'http://localhost:5006';

/**
 * PatientHome
 * Coordinates Patient Doctor Profile Card, Digital Selection Modal, Schedule Modal,
 * and Supabase Realtime WebSocket synchronization.
 * Zero Push Notifications / FCM.
 */
export default function PatientHome({
  patientId = TEST_PATIENT_UUID,
  doctorId = HARDCODED_DOCTOR_UUID,
}) {
  // Doctor & Request State
  const [doctorName, setDoctorName] = useState('Dr. Alexander Smith');
  const [specialty, setSpecialty] = useState('Senior Physician • 15 Yrs Exp');
  const [requestStatus, setRequestStatus] = useState(null); // 'pending' | 'accepted' | 'rejected' | 'rescheduled'
  const [proposedTime, setProposedTime] = useState(null);
  const [activeRequestId, setActiveRequestId] = useState(null);

  // Modals
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [initialScheduleType, setInitialScheduleType] = useState('scheduled_teleconsultation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── 1. Fetch initial request status on mount (Rural cold-start support) ────────
  const fetchLatestRequest = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[PatientHome] Could not fetch initial request:', error.message);
        return;
      }

      if (data) {
        setActiveRequestId(data.id);
        setRequestStatus(data.status);
        setProposedTime(data.proposed_time);
      }
    } catch (err) {
      console.warn('[PatientHome] Initial load error:', err);
    }
  }, [patientId]);

  useEffect(() => {
    fetchLatestRequest();
  }, [fetchLatestRequest]);

  // ── 2. Attach Supabase Realtime WebSocket for UPDATE events ────────────────
  useEffect(() => {
    console.log(`[PatientHome] Subscribing to Supabase Realtime for patient: ${patientId}`);

    const channel = supabase
      .channel(`patient_realtime_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointment_requests',
          filter: `patient_id=eq.${patientId}`,
        },
        (payload) => {
          console.log('⚡ [PatientHome Realtime WebSocket UPDATE]:', payload.new);
          if (payload.new) {
            setRequestStatus(payload.new.status);
            setProposedTime(payload.new.proposed_time || null);
            setActiveRequestId(payload.new.id);

            // Optional in-app gentle alert banner for feedback
            if (payload.new.status === 'accepted') {
              Alert.alert('Appointment Accepted! 🎉', 'The doctor has accepted your consultation request.');
            } else if (payload.new.status === 'rescheduled') {
              const formattedTime = payload.new.proposed_time
                ? new Date(payload.new.proposed_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              Alert.alert('Appointment Rescheduled 📅', `Doctor suggested new time: ${formattedTime}`);
            } else if (payload.new.status === 'rejected') {
              Alert.alert('Consultation Update', 'The doctor is currently unavailable and had to decline.');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[PatientHome] Realtime channel status: ${status}`);
      });

    return () => {
      console.log('[PatientHome] Unsubscribing from Realtime WebSocket');
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  // ── 3. Submit Appointment Request to Backend Engine ────────────────────────
  const handleAppointmentSubmit = async ({ requestType, requestedDate, requestedTime, notes }) => {
    setIsSubmitting(true);
    // Optimistic UI state
    setRequestStatus('pending');
    setProposedTime(null);

    const payload = {
      doctor_id: doctorId,
      patient_id: patientId,
      request_type: requestType,
      requested_date: requestedDate,
      requested_time: requestedTime,
      notes: notes,
    };

    try {
      // 1. Send via Backend API Endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/consultation/appointments/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Server error creating request');
      }

      console.log('[PatientHome] Appointment Request Created Successfully:', json.data);
      setActiveRequestId(json.data.id);
      setShowScheduleModal(false);
      Alert.alert(
        'Request Sent! ⏳',
        'Your appointment request has been submitted. Status is now Pending and will update live when the doctor responds.'
      );
    } catch (apiErr) {
      console.warn('[PatientHome] API failed, attempting direct Supabase insert fallback:', apiErr.message);

      // Rural offline/direct fallback to Supabase Postgres
      try {
        const { data, error } = await supabase
          .from('appointment_requests')
          .insert({
            doctor_id: doctorId,
            patient_id: patientId,
            request_type: requestType,
            requested_date: requestedDate,
            requested_time: requestedTime,
            notes: notes || null,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;

        setActiveRequestId(data.id);
        setShowScheduleModal(false);
        Alert.alert('Request Sent! ⏳', 'Request sent to doctor via fallback link. Status: Pending.');
      } catch (fallbackErr) {
        console.error('[PatientHome] Fallback insert failed:', fallbackErr);
        Alert.alert('Connection Notice', 'Could not send request over current network. Please retry.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Doctor Profile Card */}
      <DoctorProfileCard
        doctorName={doctorName}
        specialty={specialty}
        requestStatus={requestStatus}
        proposedTime={proposedTime}
        onRequestDigitalPress={() => setShowChoiceModal(true)}
      />

      {/* Digital Appointment Type Choice Modal */}
      <Modal
        visible={showChoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowChoiceModal(false)}
            >
              <Ionicons name="close" size={24} color={MQ.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Digital Appointment</Text>
            <Text style={styles.modalSub}>
              How would you like to connect with {doctorName}?
            </Text>

            {/* Option 1: Request Direct Teleconsultation */}
            <TouchableOpacity
              style={styles.modalOptionBtn}
              activeOpacity={0.7}
              onPress={() => {
                setShowChoiceModal(false);
                setInitialScheduleType('direct_teleconsultation');
                setShowScheduleModal(true);
              }}
            >
              <View style={[styles.modalOptionIconWrap, { backgroundColor: MQ.purpleLight }]}>
                <Ionicons name="chatbubbles-outline" size={24} color={MQ.purple} />
              </View>
              <View style={styles.modalOptionTextWrap}>
                <Text style={styles.modalOptionTitle}>Request Direct Teleconsultation</Text>
                <Text style={styles.modalOptionSub}>Connect instantly via direct call or video.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={MQ.textMuted} />
            </TouchableOpacity>

            {/* Option 2: Schedule Teleconsultation */}
            <TouchableOpacity
              style={styles.modalOptionBtn}
              activeOpacity={0.7}
              onPress={() => {
                setShowChoiceModal(false);
                setInitialScheduleType('scheduled_teleconsultation');
                setShowScheduleModal(true);
              }}
            >
              <View style={[styles.modalOptionIconWrap, { backgroundColor: MQ.tealLight }]}>
                <Ionicons name="calendar-outline" size={24} color={MQ.teal} />
              </View>
              <View style={styles.modalOptionTextWrap}>
                <Text style={styles.modalOptionTitle}>Schedule Teleconsultation</Text>
                <Text style={styles.modalOptionSub}>Pick a date and time for a scheduled video visit.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={MQ.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date/Time Picker Modal */}
      <ScheduleModal
        visible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSubmit={handleAppointmentSubmit}
        initialRequestType={initialScheduleType}
        doctorName={doctorName}
        isSubmitting={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: MQ.bgWhite,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: MQ.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    marginTop: 10,
  },
  modalSub: {
    fontSize: 13,
    color: MQ.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  modalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MQ.bgLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
    padding: 16,
    marginBottom: 12,
  },
  modalOptionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalOptionTextWrap: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: MQ.textPrimary,
    marginBottom: 4,
  },
  modalOptionSub: {
    fontSize: 12,
    color: MQ.textSecondary,
    lineHeight: 16,
  },
});
