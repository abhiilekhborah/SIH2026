import { AppHeader } from '@/components/app-header';
<<<<<<< HEAD
import { SideMenu } from '@/components/side-menu';
import { useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────

interface Hospital {
  id: string;
  name: string;
  distance: number;
  travelTime?: string;
  type: string;
  emergencyAvailable: boolean;
  specialties: string[];
  phone: string;
  isOpen?: boolean;
  latitude: number;
  longitude: number;
}
=======
import { useSideMenu } from '@/components/side-menu-context';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Emergency() {
  const { openMenu } = useSideMenu();
  const [unreadNotifications, setUnreadNotifications] = useState(1);
>>>>>>> a61a2324a2c91f6258a9d357f51537aa33d1b0ac

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  timestamp: number;
}

type EmergencyStatus = 'idle' | 'confirming' | 'sending' | 'active' | 'cancelled' | 'resolved';

type StatusStep = 'sos_sent' | 'location_shared' | 'hospital_selected' | 'help_requested' | 'resolved';

interface EmergencyEvent {
  id: string;
  timestamp: number;
  location: LocationData;
  status: EmergencyStatus;
  resolvedAt?: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────

const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Community Health Center',
    distance: 2.4,
    travelTime: '8 min',
    type: 'Primary Care',
    emergencyAvailable: true,
    specialties: ['General Medicine', 'Emergency', 'Pediatrics'],
    phone: '+91 98765 43210',
    isOpen: true,
    latitude: 28.6139,
    longitude: 77.209,
  },
  {
    id: 'h2',
    name: 'District Hospital',
    distance: 5.1,
    travelTime: '15 min',
    type: 'Government Hospital',
    emergencyAvailable: true,
    specialties: ['Surgery', 'Cardiology', 'Orthopedics', 'Emergency'],
    phone: '+91 98765 43211',
    isOpen: true,
    latitude: 28.62,
    longitude: 77.215,
  },
  {
    id: 'h3',
    name: 'Primary Health Sub-Center',
    distance: 1.2,
    travelTime: '4 min',
    type: 'PHC',
    emergencyAvailable: false,
    specialties: ['General Medicine'],
    phone: '+91 98765 43212',
    isOpen: true,
    latitude: 28.61,
    longitude: 77.205,
  },
  {
    id: 'h4',
    name: 'City Medical Center',
    distance: 8.3,
    travelTime: '22 min',
    type: 'Private Hospital',
    emergencyAvailable: true,
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency', 'ICU'],
    phone: '+91 98765 43213',
    isOpen: false,
    latitude: 28.63,
    longitude: 77.22,
  },
];

// ─── SOS Button ───────────────────────────────────────────────────────

function SOSButton({ onPress }: { onPress: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    );
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    glow.start();
    return () => { pulse.stop(); glow.stop(); };
  }, []);

  return (
<<<<<<< HEAD
    <Animated.View style={[sosStyles.wrapper, { transform: [{ scale: pulseAnim }] }]}>
      <Animated.View style={[sosStyles.glow, { opacity: glowAnim }]} />
      <TouchableOpacity
        style={sosStyles.button}
        activeOpacity={0.85}
        onPress={() => { Vibration.vibrate(50); onPress(); }}
        accessibilityLabel="Emergency SOS"
        accessibilityRole="button"
      >
        <Text style={sosStyles.icon}>🚨</Text>
        <Text style={sosStyles.label}>EMERGENCY SOS</Text>
        <Text style={sosStyles.sublabel}>Get immediate assistance</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const sosStyles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: 24 },
  glow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#DC2626', top: -10 },
  button: {
    width: 200, height: 200, borderRadius: 100, backgroundColor: '#DC2626',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#DC2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 12,
  },
  icon: { fontSize: 48, marginBottom: 4 },
  label: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, textAlign: 'center' },
  sublabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },
});

// ─── SOS Confirm Modal ────────────────────────────────────────────────

function SOSConfirmModal({ visible, onConfirm, onCancel }: { visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={confirmStyles.overlay}>
        <View style={confirmStyles.card}>
          <View style={confirmStyles.iconContainer}>
            <Text style={confirmStyles.icon}>🚨</Text>
          </View>
          <Text style={confirmStyles.title}>Are you facing an emergency?</Text>
          <Text style={confirmStyles.description}>
            This will send your location to emergency services and your healthcare provider.
          </Text>
          <View style={confirmStyles.buttonGroup}>
            <Pressable
              style={[confirmStyles.button, confirmStyles.confirmButton]}
              onPress={() => { Vibration.vibrate(100); onConfirm(); }}
              accessibilityLabel="Yes, send SOS"
              accessibilityRole="button"
            >
              <Ionicons name="warning" size={22} color="#FFFFFF" />
              <Text style={confirmStyles.confirmText}>YES — SEND SOS</Text>
            </Pressable>
            <Pressable
              style={[confirmStyles.button, confirmStyles.cancelButton]}
              onPress={onCancel}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={confirmStyles.cancelText}>CANCEL</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const confirmStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  },
  iconContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  icon: { fontSize: 36 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  buttonGroup: { width: '100%', gap: 12 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, gap: 8 },
  confirmButton: { backgroundColor: '#DC2626' },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  cancelButton: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
});

// ─── Cancel Emergency Modal ───────────────────────────────────────────

function CancelEmergencyModal({ visible, onConfirm, onCancel }: { visible: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={cancelModalStyles.overlay}>
        <View style={cancelModalStyles.card}>
          <View style={cancelModalStyles.iconContainer}>
            <Ionicons name="alert-circle" size={36} color="#F59E0B" />
          </View>
          <Text style={cancelModalStyles.title}>Cancel Emergency?</Text>
          <Text style={cancelModalStyles.description}>
            Are you sure you want to cancel this emergency? Emergency services will be notified.
          </Text>
          <View style={cancelModalStyles.buttonGroup}>
            <Pressable style={[cancelModalStyles.button, cancelModalStyles.confirmButton]} onPress={onConfirm}>
              <Text style={cancelModalStyles.confirmText}>YES, CANCEL SOS</Text>
            </Pressable>
            <Pressable style={[cancelModalStyles.button, cancelModalStyles.cancelButton]} onPress={onCancel}>
              <Text style={cancelModalStyles.cancelText}>KEEP ACTIVE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const cancelModalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10,
  },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  buttonGroup: { width: '100%', gap: 12 },
  button: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  confirmButton: { backgroundColor: '#F59E0B' },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  cancelButton: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
});

// ─── Location Status ──────────────────────────────────────────────────

function LocationStatus({ location, isSharing, error }: { location: LocationData | null; isSharing: boolean; error?: string }) {
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <View style={locStyles.container}>
      <View style={locStyles.header}>
        <Ionicons name="location" size={18} color="#2563EB" />
        <Text style={locStyles.title}>LOCATION</Text>
      </View>
      {error ? (
        <View style={locStyles.errorBox}>
          <Ionicons name="alert-circle" size={18} color="#DC2626" />
          <Text style={locStyles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={locStyles.statusGrid}>
          <View style={locStyles.statusRow}>
            <Text style={locStyles.label}>Sharing</Text>
            <View style={locStyles.statusBadge}>
              <View style={[locStyles.dot, isSharing ? locStyles.dotActive : locStyles.dotInactive]} />
              <Text style={[locStyles.value, isSharing ? locStyles.valueActive : locStyles.valueInactive]}>
                {isSharing ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>
          {location && (
            <>
              <View style={locStyles.statusRow}>
                <Text style={locStyles.label}>Coordinates</Text>
                <Text style={locStyles.value}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
              </View>
              {location.address && (
                <View style={locStyles.statusRow}>
                  <Text style={locStyles.label}>Address</Text>
                  <Text style={locStyles.value} numberOfLines={2}>{location.address}</Text>
                </View>
              )}
              <View style={locStyles.statusRow}>
                <Text style={locStyles.label}>Accuracy</Text>
                <Text style={locStyles.value}>±{Math.round(location.accuracy)} m</Text>
              </View>
              <View style={locStyles.statusRow}>
                <Text style={locStyles.label}>Updated</Text>
                <Text style={locStyles.value}>{formatTime(location.timestamp)}</Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const locStyles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 13, fontWeight: '700', color: '#475569', letterSpacing: 0.8 },
  statusGrid: { gap: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 13, color: '#6B7280', flex: 1 },
  value: { fontSize: 13, fontWeight: '600', color: '#111827', flex: 1, textAlign: 'right' },
  valueActive: { color: '#16A34A' },
  valueInactive: { color: '#9CA3AF' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { backgroundColor: '#16A34A' },
  dotInactive: { backgroundColor: '#D1D5DB' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', padding: 12, borderRadius: 10 },
  errorText: { fontSize: 13, color: '#DC2626', flex: 1, lineHeight: 18 },
});

// ─── Nearest Hospitals ────────────────────────────────────────────────

function NearestHospitals({
  hospitals, onSelectHospital, onCallHospital, onGetDirections, onViewMap, isOffline,
}: {
  hospitals: Hospital[];
  onSelectHospital: (h: Hospital) => void;
  onCallHospital: (phone: string) => void;
  onGetDirections: (lat: number, lng: number) => void;
  onViewMap: () => void;
  isOffline?: boolean;
}) {
  if (hospitals.length === 0) {
    return (
      <View style={hospStyles.container}>
        <View style={hospStyles.header}>
          <Ionicons name="medical" size={18} color="#2563EB" />
          <Text style={hospStyles.title}>NEAREST HOSPITALS</Text>
        </View>
        <Text style={hospStyles.emptyText}>No hospital data available</Text>
      </View>
    );
  }

  const topHospital = hospitals[0];
  const remaining = hospitals.slice(1);

  return (
    <View style={hospStyles.container}>
      <View style={hospStyles.header}>
        <Ionicons name="medical" size={18} color="#2563EB" />
        <Text style={hospStyles.title}>NEAREST HOSPITALS</Text>
        {isOffline && (
          <View style={hospStyles.offlineBadge}>
            <Text style={hospStyles.offlineText}>CACHED</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={hospStyles.primaryCard} activeOpacity={0.8} onPress={() => onSelectHospital(topHospital)}>
        <View style={hospStyles.primaryHeader}>
          <View style={hospStyles.hospitalIcon}>
            <Ionicons name="business" size={20} color="#FFFFFF" />
          </View>
          <View style={hospStyles.hospitalInfo}>
            <Text style={hospStyles.hospitalName} numberOfLines={1}>{topHospital.name}</Text>
            <Text style={hospStyles.hospitalMeta}>
              {topHospital.distance.toFixed(1)} km{topHospital.travelTime ? ` • ~${topHospital.travelTime}` : ''}
            </Text>
          </View>
          {topHospital.isOpen !== undefined && (
            <View style={[hospStyles.openBadge, topHospital.isOpen ? hospStyles.openActive : hospStyles.openClosed]}>
              <Text style={[hospStyles.openText, topHospital.isOpen ? hospStyles.openTextActive : hospStyles.openTextClosed]}>
                {topHospital.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          )}
        </View>

        <View style={hospStyles.hospitalDetails}>
          <View style={hospStyles.detailChip}>
            <Ionicons name="shield-checkmark" size={14} color={topHospital.emergencyAvailable ? '#16A34A' : '#9CA3AF'} />
            <Text style={[hospStyles.detailText, topHospital.emergencyAvailable && hospStyles.detailTextActive]}>
              Emergency {topHospital.emergencyAvailable ? 'Available' : 'N/A'}
            </Text>
          </View>
          <Text style={hospStyles.detailDot}>•</Text>
          <Text style={hospStyles.detailText}>{topHospital.type}</Text>
        </View>

        {topHospital.specialties.length > 0 && (
          <View style={hospStyles.specialtiesRow}>
            {topHospital.specialties.slice(0, 3).map((s) => (
              <View key={s} style={hospStyles.specialtyChip}>
                <Text style={hospStyles.specialtyText}>{s}</Text>
              </View>
            ))}
            {topHospital.specialties.length > 3 && (
              <Text style={hospStyles.moreText}>+{topHospital.specialties.length - 3}</Text>
            )}
          </View>
        )}

        <View style={hospStyles.actionRow}>
          <TouchableOpacity style={[hospStyles.actionButton, hospStyles.callButton]} onPress={() => onCallHospital(topHospital.phone)} activeOpacity={0.7}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={hospStyles.actionButtonText}>Call Hospital</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[hospStyles.actionButton, hospStyles.directionsButton]} onPress={() => onGetDirections(topHospital.latitude, topHospital.longitude)} activeOpacity={0.7}>
            <Ionicons name="navigate" size={16} color="#2563EB" />
            <Text style={hospStyles.directionsText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[hospStyles.actionButton, hospStyles.mapButton]} onPress={onViewMap} activeOpacity={0.7}>
            <Ionicons name="map" size={16} color="#2563EB" />
            <Text style={hospStyles.directionsText}>Map</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {remaining.map((h) => (
        <TouchableOpacity key={h.id} style={hospStyles.secondaryCard} activeOpacity={0.8} onPress={() => onSelectHospital(h)}>
          <View style={hospStyles.secondaryLeft}>
            <Text style={hospStyles.secondaryName} numberOfLines={1}>{h.name}</Text>
            <Text style={hospStyles.secondaryMeta}>
              {h.distance.toFixed(1)} km{h.travelTime ? ` • ~${h.travelTime}` : ''} • {h.type}
            </Text>
          </View>
          <View style={hospStyles.secondaryActions}>
            <TouchableOpacity onPress={() => onCallHospital(h.phone)} style={hospStyles.smallAction}>
              <Ionicons name="call" size={14} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onGetDirections(h.latitude, h.longitude)} style={hospStyles.smallAction}>
              <Ionicons name="navigate" size={14} color="#2563EB" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={hospStyles.viewMore} onPress={onViewMap} activeOpacity={0.7}>
        <Text style={hospStyles.viewMoreText}>View More Hospitals</Text>
        <Ionicons name="chevron-forward" size={16} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
}

const hospStyles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title: { fontSize: 13, fontWeight: '700', color: '#475569', letterSpacing: 0.8, flex: 1 },
  offlineBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  offlineText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 },
  primaryCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#BFDBFE', padding: 16, marginBottom: 10 },
  primaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  hospitalIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  hospitalInfo: { flex: 1 },
  hospitalName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  hospitalMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  openBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  openActive: { backgroundColor: '#DCFCE7' },
  openClosed: { backgroundColor: '#FEE2E2' },
  openText: { fontSize: 11, fontWeight: '600' },
  openTextActive: { color: '#16A34A' },
  openTextClosed: { color: '#DC2626' },
  hospitalDetails: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#6B7280' },
  detailTextActive: { color: '#16A34A', fontWeight: '600' },
  detailDot: { color: '#D1D5DB' },
  specialtiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  specialtyChip: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  specialtyText: { fontSize: 11, color: '#2563EB', fontWeight: '500' },
  moreText: { fontSize: 11, color: '#9CA3AF', alignSelf: 'center' },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  callButton: { backgroundColor: '#2563EB' },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  directionsButton: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  mapButton: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  directionsText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  secondaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, marginBottom: 8 },
  secondaryLeft: { flex: 1 },
  secondaryName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  secondaryMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  secondaryActions: { flexDirection: 'row', gap: 8 },
  smallAction: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  viewMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10 },
  viewMoreText: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
});

// ─── Emergency Actions ────────────────────────────────────────────────

function openPhoneCall(number: string, label: string) {
  Alert.alert(`Call ${label}`, `Dial ${number}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`).catch(() => Alert.alert('Unable to Call', `Could not initiate call to ${number}. Please dial manually.`)) },
  ]);
}

function EmergencyActions({
  hospitalPhone, hospitalName, onShareLocation,
}: {
  hospitalPhone?: string;
  hospitalName?: string;
  onShareLocation?: () => void;
}) {
  return (
    <View style={actionStyles.container}>
      <TouchableOpacity style={[actionStyles.actionCard, actionStyles.emergencyCard]} activeOpacity={0.8} onPress={() => openPhoneCall('112', 'Emergency Services')}>
        <View style={actionStyles.emergencyIconWrap}>
          <Ionicons name="call" size={24} color="#FFFFFF" />
        </View>
        <View style={actionStyles.actionInfo}>
          <Text style={actionStyles.actionTitle}>CALL EMERGENCY SERVICES</Text>
          <Text style={actionStyles.actionSubtitle}>Dial 112</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      {hospitalPhone && (
        <TouchableOpacity style={[actionStyles.actionCard, actionStyles.hospitalCard]} activeOpacity={0.8} onPress={() => openPhoneCall(hospitalPhone, hospitalName || 'Hospital')}>
          <View style={actionStyles.hospitalIconWrap}>
            <Ionicons name="medical" size={22} color="#2563EB" />
          </View>
          <View style={actionStyles.actionInfo}>
            <Text style={actionStyles.actionTitleDark}>CALL HOSPITAL</Text>
            <Text style={actionStyles.actionSubtitleDark}>{hospitalName || 'Nearest hospital'} • {hospitalPhone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}

      <View style={actionStyles.contactSection}>
        <View style={actionStyles.contactHeader}>
          <Ionicons name="people" size={18} color="#2563EB" />
          <Text style={actionStyles.contactTitle}>EMERGENCY CONTACT</Text>
        </View>
        <View style={actionStyles.contactCard}>
          <View style={actionStyles.contactAvatar}>
            <Text style={actionStyles.contactInitial}>F</Text>
          </View>
          <View style={actionStyles.contactInfo}>
            <Text style={actionStyles.contactName}>Family Member</Text>
            <Text style={actionStyles.contactPhone}>+91 98765 43210</Text>
          </View>
        </View>
        <View style={actionStyles.contactActions}>
          <TouchableOpacity style={actionStyles.contactButton} onPress={() => openPhoneCall('+91 98765 43210', 'Family Member')} activeOpacity={0.7}>
            <Ionicons name="call" size={16} color="#FFFFFF" />
            <Text style={actionStyles.contactButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[actionStyles.contactButton, actionStyles.shareButton]} onPress={onShareLocation} activeOpacity={0.7}>
            <Ionicons name="location" size={16} color="#2563EB" />
            <Text style={actionStyles.shareButtonText}>Share Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const actionStyles = StyleSheet.create({
  container: { gap: 12, marginBottom: 16 },
  actionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, gap: 14 },
  emergencyCard: { backgroundColor: '#DC2626', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
  emergencyIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
  actionSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  hospitalCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  hospitalIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  actionTitleDark: { fontSize: 15, fontWeight: '700', color: '#111827', letterSpacing: 0.5 },
  actionSubtitleDark: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  contactSection: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16 },
  contactHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  contactTitle: { fontSize: 13, fontWeight: '700', color: '#475569', letterSpacing: 0.8 },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  contactInitial: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  contactPhone: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: 10 },
  contactButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#2563EB', gap: 6 },
  contactButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  shareButton: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  shareButtonText: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
});

// ─── Status Timeline ──────────────────────────────────────────────────

const TIMELINE_STEPS: { key: StatusStep; label: string; icon: string }[] = [
  { key: 'sos_sent', label: 'SOS Sent', icon: 'warning' },
  { key: 'location_shared', label: 'Location Shared', icon: 'location' },
  { key: 'hospital_selected', label: 'Hospital Selected', icon: 'medical' },
  { key: 'help_requested', label: 'Help Requested', icon: 'call' },
  { key: 'resolved', label: 'Resolved', icon: 'checkmark-circle' },
];

function StatusTimeline({ currentStep }: { currentStep: StatusStep }) {
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <View style={timelineStyles.container}>
      <Text style={timelineStyles.title}>STATUS</Text>
      <View style={timelineStyles.timeline}>
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <View key={step.key} style={timelineStyles.stepWrapper}>
              <View style={timelineStyles.stepLeft}>
                <View style={[timelineStyles.dot, isCompleted ? timelineStyles.dotCompleted : timelineStyles.dotPending, isCurrent && timelineStyles.dotCurrent]}>
                  {isCompleted && <Ionicons name={step.icon as any} size={12} color="#FFFFFF" />}
                </View>
                {index < TIMELINE_STEPS.length - 1 && (
                  <View style={[timelineStyles.line, index < currentIndex ? timelineStyles.lineCompleted : timelineStyles.linePending]} />
                )}
              </View>
              <Text style={[timelineStyles.stepLabel, isCompleted ? timelineStyles.stepLabelCompleted : timelineStyles.stepLabelPending]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 16 },
  title: { fontSize: 13, fontWeight: '700', color: '#475569', letterSpacing: 0.8, marginBottom: 14 },
  timeline: { gap: 0 },
  stepWrapper: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 36 },
  stepLeft: { alignItems: 'center', width: 28 },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dotCompleted: { backgroundColor: '#2563EB' },
  dotPending: { backgroundColor: '#E5E7EB' },
  dotCurrent: { backgroundColor: '#DC2626', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  line: { width: 2, flex: 1, minHeight: 12 },
  lineCompleted: { backgroundColor: '#2563EB' },
  linePending: { backgroundColor: '#E5E7EB' },
  stepLabel: { fontSize: 13, marginLeft: 10, paddingBottom: 8, lineHeight: 24 },
  stepLabelCompleted: { fontWeight: '600', color: '#111827' },
  stepLabelPending: { color: '#9CA3AF' },
});

// ─── Emergency History ────────────────────────────────────────────────

function EmergencyHistory({ events }: { events: EmergencyEvent[] }) {
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={histStyles.container}>
      <View style={histStyles.header}>
        <Ionicons name="time" size={18} color="#6B7280" />
        <Text style={histStyles.title}>EMERGENCY HISTORY</Text>
      </View>
      {events.length === 0 ? (
        <View style={histStyles.emptyState}>
          <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
          <Text style={histStyles.emptyText}>No previous emergencies</Text>
        </View>
      ) : (
        <View style={histStyles.list}>
          {events.map((event) => (
            <View key={event.id} style={histStyles.eventCard}>
              <View style={histStyles.eventLeft}>
                <View style={[histStyles.statusDot, event.status === 'resolved' ? histStyles.dotResolved : histStyles.dotActive]} />
                <View>
                  <Text style={histStyles.eventId}>#{event.id.slice(-6).toUpperCase()}</Text>
                  <Text style={histStyles.eventDate}>{formatDate(event.timestamp)}</Text>
                </View>
              </View>
              <View style={histStyles.eventRight}>
                <Text style={histStyles.eventTime}>{formatTime(event.timestamp)}</Text>
                <View style={[histStyles.eventBadge, event.status === 'resolved' ? histStyles.badgeResolved : histStyles.badgeActive]}>
                  <Text style={[histStyles.eventBadgeText, event.status === 'resolved' ? histStyles.badgeTextResolved : histStyles.badgeTextActive]}>
                    {event.status === 'resolved' ? 'Resolved' : 'Cancelled'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const histStyles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, marginBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title: { fontSize: 13, fontWeight: '700', color: '#475569', letterSpacing: 0.8 },
  emptyState: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  list: { gap: 8 },
  eventCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
  eventLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotResolved: { backgroundColor: '#16A34A' },
  dotActive: { backgroundColor: '#DC2626' },
  eventId: { fontSize: 14, fontWeight: '600', color: '#111827' },
  eventDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  eventRight: { alignItems: 'flex-end', gap: 4 },
  eventTime: { fontSize: 12, color: '#6B7280' },
  eventBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeResolved: { backgroundColor: '#DCFCE7' },
  badgeActive: { backgroundColor: '#FEE2E2' },
  eventBadgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextResolved: { color: '#16A34A' },
  badgeTextActive: { color: '#DC2626' },
});

// ─── Active Emergency Dashboard ───────────────────────────────────────

function ActiveDashboard({
  emergencyId, activatedAt, location, locationError, isSharingLocation,
  hospitals, selectedHospital, statusStep,
  onCancel, onStopSharing, onSelectHospital, onCallHospital, onGetDirections, onViewMap, onShareLocation,
}: {
  emergencyId: string;
  activatedAt: number;
  location: LocationData | null;
  locationError?: string;
  isSharingLocation: boolean;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  statusStep: StatusStep;
  onCancel: () => void;
  onStopSharing: () => void;
  onSelectHospital: (h: Hospital) => void;
  onCallHospital: (phone: string) => void;
  onGetDirections: (lat: number, lng: number) => void;
  onViewMap: () => void;
  onShareLocation: () => void;
}) {
  const bannerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(bannerAnim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(bannerAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={dashStyles.container}>
      <Animated.View style={[dashStyles.banner, { opacity: bannerAnim }]}>
        <Ionicons name="warning" size={22} color="#FFFFFF" />
        <Text style={dashStyles.bannerText}>🚨 EMERGENCY ACTIVE</Text>
      </Animated.View>

      <View style={dashStyles.infoCard}>
        <View style={dashStyles.infoRow}>
          <Text style={dashStyles.infoLabel}>Case ID</Text>
          <Text style={dashStyles.infoValue}>#{emergencyId.slice(-6).toUpperCase()}</Text>
        </View>
        <View style={dashStyles.infoRow}>
          <Text style={dashStyles.infoLabel}>Activated</Text>
          <Text style={dashStyles.infoValue}>{formatTime(activatedAt)}</Text>
        </View>
        <View style={dashStyles.infoRow}>
          <Text style={dashStyles.infoLabel}>Location</Text>
          <Text style={dashStyles.infoValue}>{isSharingLocation ? 'SHARING' : 'NOT SHARING'}</Text>
        </View>
        {selectedHospital && (
          <View style={dashStyles.infoRow}>
            <Text style={dashStyles.infoLabel}>Hospital</Text>
            <Text style={dashStyles.infoValue} numberOfLines={1}>{selectedHospital.name}</Text>
          </View>
        )}
      </View>

      <StatusTimeline currentStep={statusStep} />
      <LocationStatus location={location} isSharing={isSharingLocation} error={locationError} />

      {isSharingLocation && (
        <TouchableOpacity style={dashStyles.stopButton} onPress={onStopSharing} activeOpacity={0.7}>
          <Ionicons name="location" size={18} color="#DC2626" />
          <Text style={dashStyles.stopText}>Stop Sharing Location</Text>
        </TouchableOpacity>
      )}

      <NearestHospitals hospitals={hospitals} onSelectHospital={onSelectHospital} onCallHospital={onCallHospital} onGetDirections={onGetDirections} onViewMap={onViewMap} />

      <EmergencyActions hospitalPhone={selectedHospital?.phone} hospitalName={selectedHospital?.name} onShareLocation={onShareLocation} />

      <TouchableOpacity style={dashStyles.cancelButton} onPress={onCancel} activeOpacity={0.8}>
        <Ionicons name="close-circle" size={20} color="#FFFFFF" />
        <Text style={dashStyles.cancelButtonText}>CANCEL EMERGENCY</Text>
      </TouchableOpacity>
    </View>
  );
}

const dashStyles = StyleSheet.create({
  container: { paddingBottom: 24 },
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#DC2626',
    paddingVertical: 14, borderRadius: 14, gap: 10, marginBottom: 16,
    shadowColor: '#DC2626', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
  },
  bannerText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  infoCard: { backgroundColor: '#FEF2F2', borderRadius: 14, borderWidth: 1, borderColor: '#FECACA', padding: 16, marginBottom: 16, gap: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#111827', maxWidth: '60%', textAlign: 'right' },
  stopButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', marginBottom: 16,
  },
  stopText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  cancelButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6B7280', paddingVertical: 16, borderRadius: 14, marginTop: 8,
  },
  cancelButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 },
});

// ─── Main Emergency Tab ───────────────────────────────────────────────

export default function Emergency() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>('idle');
  const [emergencyId, setEmergencyId] = useState('');
  const [activatedAt, setActivatedAt] = useState(0);
  const [statusStep, setStatusStep] = useState<StatusStep>('sos_sent');

  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | undefined>();
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const [hospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isOffline] = useState(false);

  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyEvent[]>([]);
  const locationWatchRef = useRef<number | null>(null);

  const startLocationSharing = useCallback(() => {
    setIsSharingLocation(true);
    const simulatedLocation: LocationData = {
      latitude: 28.6139 + (Math.random() - 0.5) * 0.01,
      longitude: 77.209 + (Math.random() - 0.5) * 0.01,
      accuracy: Math.round(8 + Math.random() * 15),
      address: 'Near Community Health Center, Sector 12',
      timestamp: Date.now(),
    };
    setLocation(simulatedLocation);
    setLocationError(undefined);
    locationWatchRef.current = setInterval(() => {
      setLocation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          latitude: prev.latitude + (Math.random() - 0.5) * 0.0002,
          longitude: prev.longitude + (Math.random() - 0.5) * 0.0002,
          accuracy: Math.round(8 + Math.random() * 15),
          timestamp: Date.now(),
        };
      });
    }, 5000) as any;
  }, []);

  const stopLocationSharing = useCallback(() => {
    Alert.alert('Stop Location Sharing', 'Are you sure you want to stop sharing your live location?', [
      { text: 'Keep Sharing', style: 'cancel' },
      {
        text: 'Stop', style: 'destructive',
        onPress: () => {
          setIsSharingLocation(false);
          if (locationWatchRef.current) { clearInterval(locationWatchRef.current); locationWatchRef.current = null; }
        },
      },
    ]);
  }, []);

  const handleSOSPress = useCallback(() => setShowConfirmModal(true), []);

  const handleConfirmSOS = useCallback(() => {
    setShowConfirmModal(false);
    setEmergencyStatus('sending');
    const id = `EMG-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setEmergencyId(id);
    setActivatedAt(Date.now());
    setTimeout(() => {
      setEmergencyStatus('active');
      setStatusStep('sos_sent');
      startLocationSharing();
      setTimeout(() => setStatusStep('location_shared'), 1500);
    }, 1000);
  }, [startLocationSharing]);

  const handleCancelSOS = useCallback(() => setShowCancelModal(true), []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    setEmergencyStatus('cancelled');
    setIsSharingLocation(false);
    if (locationWatchRef.current) { clearInterval(locationWatchRef.current); locationWatchRef.current = null; }
    setEmergencyHistory((prev) => [
      { id: emergencyId, timestamp: activatedAt, location: location || { latitude: 0, longitude: 0, accuracy: 0, timestamp: Date.now() }, status: 'cancelled', resolvedAt: Date.now() },
      ...prev,
    ]);
    setTimeout(() => {
      setEmergencyStatus('idle');
      setEmergencyId('');
      setActivatedAt(0);
      setLocation(null);
      setSelectedHospital(null);
      setStatusStep('sos_sent');
    }, 500);
  }, [emergencyId, activatedAt, location]);

  const handleSelectHospital = useCallback((hospital: Hospital) => {
    setSelectedHospital(hospital);
    setStatusStep('hospital_selected');
  }, []);

  const handleCallHospital = useCallback((phone: string) => {
    Alert.alert('Call Hospital', `Dial ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => {} },
    ]);
  }, []);

  const handleGetDirections = useCallback((lat: number, lng: number) => {
    Alert.alert('Directions', `Opening maps for ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }, []);

  const handleViewMap = useCallback(() => Alert.alert('Hospital Map', 'Opening hospital map view'), []);
  const handleShareLocation = useCallback(() => Alert.alert('Location Shared', 'Your live location has been shared with your emergency contact.'), []);
  const handleOpenNotifications = useCallback(() => Alert.alert('Notifications', 'Emergency alerts & notifications'), []);

  const isActive = emergencyStatus === 'active' || emergencyStatus === 'sending';

  return (
    <SafeAreaView style={mainStyles.safeArea} edges={['top', 'left', 'right']}>
      <SideMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
=======
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
>>>>>>> a61a2324a2c91f6258a9d357f51537aa33d1b0ac
      <AppHeader
        title="Emergency"
        showMenu={true}
        showNotification={true}
<<<<<<< HEAD
        onPressMenu={() => setIsMenuOpen(true)}
=======
        onPressMenu={openMenu}
>>>>>>> a61a2324a2c91f6258a9d357f51537aa33d1b0ac
        onPressNotification={handleOpenNotifications}
        badgeCount={0}
      />

      <ScrollView style={mainStyles.scrollView} contentContainerStyle={mainStyles.scrollContent} showsVerticalScrollIndicator={false}>
        {isActive ? (
          <ActiveDashboard
            emergencyId={emergencyId} activatedAt={activatedAt} location={location} locationError={locationError}
            isSharingLocation={isSharingLocation} hospitals={hospitals} selectedHospital={selectedHospital}
            statusStep={statusStep} onCancel={handleCancelSOS} onStopSharing={stopLocationSharing}
            onSelectHospital={handleSelectHospital} onCallHospital={handleCallHospital}
            onGetDirections={handleGetDirections} onViewMap={handleViewMap} onShareLocation={handleShareLocation}
          />
        ) : (
          <>
            <View style={mainStyles.sosSection}>
              <SOSButton onPress={handleSOSPress} />
            </View>

            <View style={mainStyles.quickInfo}>
              <View style={mainStyles.infoItem}>
                <Text style={mainStyles.infoIcon}>📍</Text>
                <Text style={mainStyles.infoText}>GPS Ready</Text>
              </View>
              <View style={mainStyles.divider} />
              <View style={mainStyles.infoItem}>
                <Text style={mainStyles.infoIcon}>🏥</Text>
                <Text style={mainStyles.infoText}>{hospitals.length} Hospitals Nearby</Text>
              </View>
              <View style={mainStyles.divider} />
              <View style={mainStyles.infoItem}>
                <Text style={mainStyles.infoIcon}>📞</Text>
                <Text style={mainStyles.infoText}>112 Ready</Text>
              </View>
            </View>

            <LocationStatus location={location} isSharing={isSharingLocation} error={locationError} />
            <NearestHospitals
              hospitals={hospitals} onSelectHospital={handleSelectHospital} onCallHospital={handleCallHospital}
              onGetDirections={handleGetDirections} onViewMap={handleViewMap} isOffline={isOffline}
            />
            <EmergencyHistory events={emergencyHistory} />
          </>
        )}
      </ScrollView>

      <SOSConfirmModal visible={showConfirmModal} onConfirm={handleConfirmSOS} onCancel={() => setShowConfirmModal(false)} />
      <CancelEmergencyModal visible={showCancelModal} onConfirm={handleConfirmCancel} onCancel={() => setShowCancelModal(false)} />
    </SafeAreaView>
  );
}

const mainStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  sosSection: { alignItems: 'center', paddingVertical: 20 },
  quickInfo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0',
    paddingVertical: 14, paddingHorizontal: 16, marginBottom: 16,
  },
  infoItem: { flex: 1, alignItems: 'center', gap: 4 },
  infoIcon: { fontSize: 18 },
  infoText: { fontSize: 12, fontWeight: '600', color: '#475569', textAlign: 'center' },
  divider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },
});
