import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useAuth, useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useMyProfile } from '@/hooks/useMyProfile';
import { formatPlace } from '@/lib/profile';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

export default function PharmacistProfileScreen() {
  const { openMenu } = useSideMenu();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [isOpenForOrders, setIsOpenForOrders] = useState(true);
  const [autoReorderAlerts, setAutoReorderAlerts] = useState(true);
  const [coldChainAlerts, setColdChainAlerts] = useState(true);
  const [emergencySiren, setEmergencySiren] = useState(false);

  const { data, loading, error } = useMyProfile();

  const pharmacist = data?.role === 'pharmacist' ? data.profile : null;
  const pharmacy = data?.role === 'pharmacist' ? data.pharmacy : null;

  // Clerk is only the fallback while the profile request is in flight.
  const userName =
    pharmacist?.name || data?.user.name || user?.fullName || user?.firstName || 'Pharmacist';
  const userEmail =
    data?.user.email || user?.primaryEmailAddress?.emailAddress || '—';

  const dash = (value?: string | null) => (value && value.trim()) || '—';
  const pharmacyPlace = formatPlace([
    pharmacy?.address,
    pharmacy?.villageTown,
    pharmacy?.district,
    pharmacy?.state,
    pharmacy?.pincode,
  ]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (e) {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Profile"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Dispensary & Pharmacist Profile</Text>
            <Text style={styles.headerSubtitle}>
              {pharmacist?.licenseNo ? `Licence ${pharmacist.licenseNo}` : 'Pharmacist profile'}
            </Text>
          </View>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Say why fields are blank rather than showing empty rows. */}
        {loading && !data && (
          <View style={styles.statusBanner}>
            <ActivityIndicator size="small" color={PRIMARY_BLUE} />
            <Text style={styles.statusText}>Loading your profile…</Text>
          </View>
        )}
        {!!error && (
          <View style={[styles.statusBanner, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="alert-circle" size={18} color="#B91C1C" />
            <Text style={[styles.statusText, { color: '#B91C1C' }]}>{error}</Text>
          </View>
        )}
        {!loading && !error && data?.role === 'pharmacist' && !pharmacy && (
          <View style={styles.statusBanner}>
            <Ionicons name="information-circle" size={18} color={TEXT_MUTED} />
            <Text style={styles.statusText}>
              You are not linked to a pharmacy yet, so no orders can reach you.
            </Text>
          </View>
        )}

        {/* Pharmacist Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarLarge}>
              <Ionicons name="medkit" size={32} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userNameText}>{userName}</Text>
              <Text style={styles.roleTag}>
                {pharmacist ? `Registered Pharmacist • ${pharmacist.licenseNo}` : 'Pharmacist'}
              </Text>
              <Text style={styles.userEmailText}>{userEmail}</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.storeDetailsGrid}>
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={16} color={PRIMARY_BLUE} />
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: '700' }}>Store: </Text>
                {dash(pharmacy?.name)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={PRIMARY_BLUE} />
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: '700' }}>Location: </Text>
                {dash(pharmacyPlace)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color={PRIMARY_BLUE} />
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: '700' }}>Phone: </Text>
                {dash(pharmacy?.phone)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#15803D" />
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: '700' }}>Pharmacy Lic: </Text>
                {dash(pharmacy?.licenseNo)}
              </Text>
            </View>
          </View>
        </View>

        {/* Store Automation Preferences & Controls */}
        <Text style={styles.sectionHeader}>Dispensary Settings & Automations</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Accept Digital Orders</Text>
              <Text style={styles.settingSub}>Receive live prescription uploads from nearby patients</Text>
            </View>
            <Switch
              value={isOpenForOrders}
              onValueChange={setIsOpenForOrders}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={isOpenForOrders ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Low Stock Reorder Alerts</Text>
              <Text style={styles.settingSub}>Auto-notify when essential medicine falls below threshold</Text>
            </View>
            <Switch
              value={autoReorderAlerts}
              onValueChange={setAutoReorderAlerts}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={autoReorderAlerts ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Cold Chain Monitor (2-8°C)</Text>
              <Text style={styles.settingSub}>Trigger siren if insulin storage exceeds 8°C</Text>
            </View>
            <Switch
              value={coldChainAlerts}
              onValueChange={setColdChainAlerts}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={coldChainAlerts ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Emergency Sound Siren</Text>
              <Text style={styles.settingSub}>High-priority alert sound for urgent emergency deliveries</Text>
            </View>
            <Switch
              value={emergencySiren}
              onValueChange={setEmergencySiren}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={emergencySiren ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.actionOutlineBtn}
          onPress={() => Alert.alert('Report Downloaded', 'Audit summary for August 2026 exported to device.')}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-download-outline" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.actionOutlineBtnText}>Export Drug Audit & GST Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.signOutBtnText}>Sign Out from Dispensary</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  statusText: { fontSize: 14, color: TEXT_MUTED, flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  headerSubtitle: {
    fontSize: 11,
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_BLUE,
    marginTop: 2,
  },
  userEmailText: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  storeDetailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },

  // Stats Grid
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_DARK,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginTop: 2,
    textAlign: 'center',
  },

  // Settings Card
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  settingSub: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // Actions
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 6,
  },
  actionOutlineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
