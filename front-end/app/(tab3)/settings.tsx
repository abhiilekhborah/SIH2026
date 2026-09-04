import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
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

export default function StoreSettingsScreen() {
  const { openMenu } = useSideMenu();

  const [pushNotifs, setPushNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [soundSiren, setSoundSiren] = useState(false);
  const [offlineSync, setOfflineSync] = useState(true);
  const [autoBarcodeBeep, setAutoBarcodeBeep] = useState(true);
  const [lowStockSmsDistributor, setLowStockSmsDistributor] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Store Settings"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Dispensary Preferences</Text>
            <Text style={styles.headerSubtitle}>System & Alert Automations</Text>
          </View>
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Alert Notifications */}
        <Text style={styles.sectionHeader}>Alerts & Sound Alarms</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSub}>Incoming new prescription request banners</Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={pushNotifs ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Emergency Sound Siren</Text>
              <Text style={styles.settingSub}>Audible alarm for urgent priority prescriptions</Text>
            </View>
            <Switch
              value={soundSiren}
              onValueChange={setSoundSiren}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={soundSiren ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Barcode Scanner Audio Feedback</Text>
              <Text style={styles.settingSub}>Beep confirmation when scanning medicine batches</Text>
            </View>
            <Switch
              value={autoBarcodeBeep}
              onValueChange={setAutoBarcodeBeep}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={autoBarcodeBeep ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>
        </View>

        {/* Section 2: Supply Chain Automations */}
        <Text style={styles.sectionHeader}>Distributor Auto-Restock</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Auto-Dispatch Distributor Restock PO</Text>
              <Text style={styles.settingSub}>
                Send SMS purchase order when Paracetamol/Antibiotics hit min threshold
              </Text>
            </View>
            <Switch
              value={lowStockSmsDistributor}
              onValueChange={setLowStockSmsDistributor}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={lowStockSmsDistributor ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.settingTitle}>Offline Local Cache Sync</Text>
              <Text style={styles.settingSub}>Cache inventory locally during rural internet dropouts</Text>
            </View>
            <Switch
              value={offlineSync}
              onValueChange={setOfflineSync}
              trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
              thumbColor={offlineSync ? PRIMARY_BLUE : '#F1F5F9'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => Alert.alert('Settings Saved', 'Pharmacy preferences synchronized successfully.')}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-done-circle" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Preferences</Text>
        </TouchableOpacity>
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
  sectionHeader: { fontSize: 15, fontWeight: '800', color: TEXT_DARK, marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  settingSub: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 14,
    marginTop: 6,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
