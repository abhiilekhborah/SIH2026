import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

interface PartnerDoctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  activeReferrals: number;
  distance: string;
}

const PARTNER_DOCTORS: PartnerDoctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Alok Verma, MD (Internal Medicine)',
    specialty: 'Physician & Diabetology',
    hospital: 'Apex Rural District Hospital',
    phone: '+91 98765 43210',
    activeReferrals: 18,
    distance: '1.2 km',
  },
  {
    id: 'doc-2',
    name: 'Dr. Priya Nair, MBBS, DNB',
    specialty: 'Family Medicine & General Practice',
    hospital: 'Community Health Centre PHC-104',
    phone: '+91 98231 11223',
    activeReferrals: 12,
    distance: '0.6 km',
  },
  {
    id: 'doc-3',
    name: 'Dr. Suresh Rao, MD (Cardiology)',
    specialty: 'Cardiovascular Care',
    hospital: 'City General Clinic & ECG Centre',
    phone: '+91 97112 34567',
    activeReferrals: 7,
    distance: '3.4 km',
  },
  {
    id: 'doc-4',
    name: 'Dr. Neha Kapoor, DGO',
    specialty: 'Gynecology & Maternal Care',
    hospital: 'Maternity Care Clinic',
    phone: '+91 99887 76655',
    activeReferrals: 9,
    distance: '2.1 km',
  },
];

export default function DoctorReferralsScreen() {
  const { openMenu } = useSideMenu();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Doctor Referrals"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Doctor & Clinic Network</Text>
            <Text style={styles.headerSubtitle}>4 Connected Healthcare Partners</Text>
          </View>
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Network Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>MediQuick Clinical Link</Text>
              <Text style={styles.summarySub}>Direct pharmacist-to-physician fast-track hotline</Text>
            </View>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>46 Orders This Week</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Registered Partner Doctors</Text>

        {PARTNER_DOCTORS.map((doc) => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docCardTop}>
              <View style={styles.avatar}>
                <Ionicons name="medical" size={20} color="#1A66E8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docSpecialty}>{doc.specialty}</Text>
                <Text style={styles.docHospital}>{doc.hospital} • {doc.distance}</Text>
              </View>
            </View>

            <View style={styles.docMetaRow}>
              <View style={styles.referralBadge}>
                <Ionicons name="documents-outline" size={14} color="#1D4ED8" />
                <Text style={styles.referralText}>{doc.activeReferrals} Prescriptions Linked</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Alert.alert('Calling Doctor', `Dialing direct clinical line: ${doc.phone}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={15} color="#15803D" />
                <Text style={styles.callBtnText}>Call Clinic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() => Alert.alert('Clarification Request', `Sending Rx query note to ${doc.name}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbox-ellipses" size={15} color={PRIMARY_BLUE} />
                <Text style={styles.msgBtnText}>Rx Clarification</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG_PAGE },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK },
  headerSubtitle: { fontSize: 11, color: PRIMARY_BLUE, fontWeight: '600' },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 14 },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: '#1E40AF' },
  summarySub: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  activePill: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activePillText: { fontSize: 11, fontWeight: '700', color: '#1D4ED8' },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: TEXT_DARK, marginTop: 4 },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 10,
  },
  docCardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: { fontSize: 15, fontWeight: '800', color: TEXT_DARK },
  docSpecialty: { fontSize: 12, color: PRIMARY_BLUE, fontWeight: '600', marginTop: 1 },
  docHospital: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },
  docMetaRow: { flexDirection: 'row', alignItems: 'center' },
  referralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  referralText: { fontSize: 11, fontWeight: '700', color: '#334155' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  callBtnText: { fontSize: 13, fontWeight: '700', color: '#15803D' },
  msgBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  msgBtnText: { fontSize: 13, fontWeight: '700', color: PRIMARY_BLUE },
});
