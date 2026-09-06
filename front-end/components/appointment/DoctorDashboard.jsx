import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MQ } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import ActionButtons from './ActionButtons';

export const HARDCODED_DOCTOR_UUID = '11111111-1111-1111-1111-111111111111';
const API_BASE_URL =
  process.env.EXPO_PUBLIC_CONSULTATION_API_URL || 'http://localhost:5006';

/**
 * DoctorDashboard
 * Subscribes in real time via Supabase Realtime WebSockets to incoming `appointment_requests`
 * for the doctor and provides immediate Accept, Reject, and Reschedule controls.
 * Zero Push Notifications / FCM.
 */
export default function DoctorDashboard({
  doctorId = HARDCODED_DOCTOR_UUID,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── 1. Fetch initial pending requests (low-bandwidth rural sync) ────────────
  const fetchRequests = useCallback(async () => {
    try {
      // Primary: attempt via backend API
      const res = await fetch(`${API_BASE_URL}/api/v1/consultation/appointments/doctor/${doctorId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRequests(json.data);
          return;
        }
      }
    } catch (_) {
      // Backend not yet running or rural connection blip, proceed to direct Supabase query
    }

    // Direct Supabase query fallback
    try {
      const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setRequests(data);
      }
    } catch (err) {
      console.warn('[DoctorDashboard] Load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── 2. Attach Supabase Realtime WebSocket for INSERT & UPDATE events ───────
  useEffect(() => {
    console.log(`[DoctorDashboard] Attaching Supabase Realtime WebSocket for doctor: ${doctorId}`);

    const channel = supabase
      .channel(`doctor_realtime_${doctorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointment_requests',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          console.log('⚡ [DoctorDashboard Realtime WebSocket INSERT]:', payload.new);
          if (payload.new) {
            setRequests((prev) => {
              // Avoid duplicate insertion
              if (prev.some((r) => r.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointment_requests',
          filter: `doctor_id=eq.${doctorId}`,
        },
        (payload) => {
          console.log('⚡ [DoctorDashboard Realtime WebSocket UPDATE]:', payload.new);
          if (payload.new) {
            setRequests((prev) =>
              prev.map((r) => (r.id === payload.new.id ? { ...r, ...payload.new } : r))
            );
          }
        }
      )
      .subscribe((status) => {
        console.log(`[DoctorDashboard] Realtime WebSocket connection status: ${status}`);
      });

    return () => {
      console.log('[DoctorDashboard] Unsubscribing from Doctor Realtime WebSocket');
      supabase.removeChannel(channel);
    };
  }, [doctorId]);

  const handleActionCompleted = (requestId, newStatus) => {
    setRequests((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, status: newStatus } : item
      )
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Incoming Teleconsultation Requests</Text>
          <Text style={styles.subtitle}>
            Live WebSocket Sync • Zero Push Notifications
          </Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.pulsingDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={MQ.teal} />
          <Text style={styles.loadingText}>Syncing requests...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={38} color={MQ.textMuted} />
          <Text style={styles.emptyTitle}>No Pending Requests</Text>
          <Text style={styles.emptySub}>
            New patient appointment requests will pop up in real time via WebSockets.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[MQ.teal]} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {requests.map((item) => {
            const isDirect = item.request_type === 'direct_teleconsultation';
            const isPending = item.status === 'pending';

            return (
              <View key={item.id} style={styles.requestCard}>
                {/* Header: Patient & Request Type */}
                <View style={styles.cardTopRow}>
                  <View style={styles.patientAvatar}>
                    <Ionicons name="person" size={20} color={MQ.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>
                      {item.patient?.name || 'Rural Patient'}
                    </Text>
                    <Text style={styles.requestTimeAgo}>
                      Requested: {item.requested_date} • {item.requested_time}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: isDirect ? MQ.purpleLight : MQ.blueLight },
                    ]}
                  >
                    <Ionicons
                      name={isDirect ? 'flash' : 'calendar'}
                      size={11}
                      color={isDirect ? MQ.purple : MQ.blue}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: isDirect ? MQ.purple : MQ.blue },
                      ]}
                    >
                      {isDirect ? 'Direct Call' : 'Scheduled'}
                    </Text>
                  </View>
                </View>

                {/* Notes if provided */}
                {item.notes ? (
                  <View style={styles.notesBox}>
                    <Ionicons name="medical-outline" size={14} color={MQ.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.notesText}>{item.notes}</Text>
                  </View>
                ) : null}

                {/* Status Indicator */}
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Current State:</Text>
                  <Text
                    style={[
                      styles.statusValue,
                      {
                        color:
                          item.status === 'accepted'
                            ? MQ.green
                            : item.status === 'rejected'
                            ? MQ.red
                            : item.status === 'rescheduled'
                            ? MQ.blue
                            : MQ.amber,
                      },
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>

                {/* Accept, Reschedule, Reject Action Buttons */}
                <ActionButtons
                  requestId={item.id}
                  currentStatus={item.status}
                  onActionCompleted={(action, data) =>
                    handleActionCompleted(item.id, data?.status || action)
                  }
                />
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: MQ.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: MQ.textSecondary,
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MQ.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: MQ.green,
    marginRight: 5,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: MQ.green,
  },
  centerLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: MQ.textSecondary,
  },
  emptyCard: {
    backgroundColor: MQ.bgWhite,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: MQ.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: MQ.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  requestCard: {
    backgroundColor: MQ.bgWhite,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MQ.tealBorder,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: MQ.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: MQ.textPrimary,
  },
  requestTimeAgo: {
    fontSize: 11,
    color: MQ.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MQ.bgLight,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  notesText: {
    fontSize: 12,
    color: MQ.textPrimary,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 12,
    color: MQ.textSecondary,
    marginRight: 6,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '800',
  },
});
