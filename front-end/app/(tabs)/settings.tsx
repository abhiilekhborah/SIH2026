import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const TEAL = '#00B5AD';

function SettingRow({ icon, label, sublabel, color = TEAL, toggle, value, onValueChange, onPress }: {
  icon: any; label: string; sublabel?: string; color?: string;
  toggle?: boolean; value?: boolean; onValueChange?: (v: boolean) => void; onPress?: () => void;
}) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.settingRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.settingIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {sublabel && <Text style={styles.settingSub}>{sublabel}</Text>}
      </View>
      {toggle
        ? <Switch value={value} onValueChange={onValueChange} trackColor={{ true: TEAL }} thumbColor="#fff" />
        : <Ionicons name="chevron-forward" size={18} color="#8AACBA" />
      }
    </Wrapper>
  );
}

export default function SettingsScreen() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();
  const [notifs, setNotifs]   = useState(true);
  const [biometric, setBio]   = useState(false);
  const [darkMode, setDark]   = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="Settings"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        style={styles.header}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.group}>
          <SettingRow icon="notifications-outline"  label="Push Notifications"  sublabel="Alerts for appointments & reports"   toggle value={notifs}    onValueChange={setNotifs} />
          <View style={styles.divider} />
          <SettingRow icon="finger-print-outline"   label="Biometric Login"     sublabel="Use Face ID or fingerprint to login" toggle value={biometric} onValueChange={setBio} />
          <View style={styles.divider} />
          <SettingRow icon="moon-outline"            label="Dark Mode"           sublabel="Coming soon"                         toggle value={darkMode}  onValueChange={setDark} color="#7B1FA2" />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Account</Text>
        <View style={styles.group}>
          <SettingRow icon="language-outline"         label="Language"           sublabel="English (India)"   onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="location-outline"         label="Region"             sublabel="India"              onPress={() => {}} />
          <View style={styles.divider} />
          <SettingRow icon="shield-checkmark-outline" label="Privacy & Security"                               onPress={() => {}} color="#1976D2" />
          <View style={styles.divider} />
          <SettingRow icon="document-text-outline"    label="Terms & Conditions"                               onPress={() => {}} color="#4A7080" />
          <View style={styles.divider} />
          <SettingRow icon="trash-outline"            label="Delete Account"     sublabel="This cannot be undone" onPress={() => {}} color="#E53935" />
        </View>

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>MediQuick v1.0.0  •  SIH 2026</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#F0FAFA' },
  bgLight:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#F0FAFA' },
  bgTealTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,181,173,0.12)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  header:    { backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#8AACBA', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, paddingLeft: 4 },
  group: { backgroundColor: 'rgba(255,255,255,0.80)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', overflow: 'hidden' },
  divider: { height: 1, backgroundColor: 'rgba(0,181,173,0.10)', marginLeft: 62 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#0D3349' },
  settingSub:   { fontSize: 11, color: '#8AACBA', marginTop: 1 },

  versionRow: { alignItems: 'center', marginTop: 28 },
  versionText: { fontSize: 12, color: '#8AACBA', fontWeight: '500' },
});

