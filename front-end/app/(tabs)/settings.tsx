import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getActivePushToken, scheduleDevTestNotification } from '@/utils/pushNotification';

const TEAL = '#00B5AD';

const getNotificationsModule = () => {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    if (requireNativeModule) {
      const nativeMod = requireNativeModule('ExpoPushTokenManager');
      if (!nativeMod) return null;
    }
  } catch (e) {
    return null;
  }

  try {
    return require('expo-notifications');
  } catch (e) {
    return null;
  }
};

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
  const { openNotifications, expoPushToken } = useNotifications();
  const [notifs, setNotifs]   = useState(true);
  const [biometric, setBio]   = useState(false);
  const [darkMode, setDark]   = useState(false);

  // Check the actual notification permission status on mount
  useEffect(() => {
    (async () => {
      const Notifications = getNotificationsModule();
      if (Notifications?.getPermissionsAsync) {
        const { status } = await Notifications.getPermissionsAsync();
        setNotifs(status === 'granted');
      }
    })();
  }, []);

  /**
   * Handle push notification toggle.
   * - If enabling: request permission (if not already granted)
   * - If disabling: guide user to system settings (can't revoke programmatically)
   */
  const handleNotifToggle = useCallback(async (enabled: boolean) => {
    const Notifications = getNotificationsModule();
    if (enabled) {
      // Request permission
      if (Notifications?.requestPermissionsAsync) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          setNotifs(true);
          return;
        }
      }
      // Permission denied — guide to settings
      Alert.alert(
        'Notifications Blocked',
        'Please enable notifications in your device settings to receive appointment alerts and updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    } else {
      // Can't revoke permissions programmatically — guide to system settings
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to your device settings for MediQuick.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }
  }, []);

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
          <SettingRow icon="notifications-outline"  label="Push Notifications"  sublabel={notifs ? 'Enabled — receiving alerts' : 'Disabled — tap to enable'}   toggle value={notifs}    onValueChange={handleNotifToggle} />
          <View style={styles.divider} />
          <SettingRow
            icon="key-outline"
            label="Device Push Token"
            sublabel={
              expoPushToken
                ? `${expoPushToken.slice(0, 24)}... (Tap to view)`
                : 'Tap to view token status'
            }
            color="#1976D2"
            onPress={() => {
              if (expoPushToken) {
                Alert.alert('Device Push Token', expoPushToken, [{ text: 'OK' }]);
              } else {
                Alert.alert(
                  'Push Token Status',
                  'No push token generated yet.\n\nPush tokens are generated when running on a physical phone with native build enabled.'
                );
              }
            }}
          />
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

        {/* Everything below is stripped from production builds by __DEV__. */}
        {__DEV__ && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Developer</Text>
            <View style={styles.group}>
              <SettingRow
                icon="flask-outline"
                label="Fire a test notification"
                sublabel="Local notification — works free, no server needed"
                color="#16A34A"
                onPress={() => {
                  Alert.alert(
                    'Fire a test notification',
                    'Pick a delay. Use the 10 second option to background or fully close the app first, so you can check the tray notification and tap-to-navigate.',
                    [
                      {
                        text: 'Now (app open)',
                        onPress: async () => {
                          try {
                            await scheduleDevTestNotification(1);
                          } catch (err: any) {
                            Alert.alert('Could not schedule', err?.message ?? String(err));
                          }
                        },
                      },
                      {
                        text: 'In 10 seconds',
                        onPress: async () => {
                          try {
                            await scheduleDevTestNotification(10);
                            Alert.alert(
                              'Scheduled',
                              'Close or background the app now. It will fire in 10 seconds.'
                            );
                          } catch (err: any) {
                            Alert.alert('Could not schedule', err?.message ?? String(err));
                          }
                        },
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }}
              />
            </View>
          </>
        )}

        {/* Dev only: the tokens the external push testing tools need.
            Both are also printed in full in the Metro terminal at startup,
            which is the practical way to copy them. */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugRow}
            onPress={() => {
              const native = getActivePushToken();
              Alert.alert(
                'Push tokens (dev only)',
                [
                  native
                    ? `${native.tokenType.toUpperCase()} — for Firebase Console:\n${native.token}`
                    : 'No native token yet. Needs a development build on a physical device with notifications allowed.',
                  '',
                  expoPushToken
                    ? `Expo — for expo.dev/notifications:\n${expoPushToken}`
                    : 'No Expo token. Run `eas init` in front-end/ to create an EAS project.',
                  '',
                  'Both are printed in full in the Metro terminal.',
                ].join('\n'),
                [{ text: 'OK' }]
              );
            }}
          >
            <Ionicons name="bug-outline" size={14} color="#8AACBA" />
            <Text style={styles.debugText} numberOfLines={1}>
              {getActivePushToken()
                ? `${getActivePushToken()!.tokenType.toUpperCase()} token ready — tap to view`
                : 'Waiting for a device push token…'}
            </Text>
          </TouchableOpacity>
        )}

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

  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#8AACBA',
    fontFamily: 'monospace',
    flex: 1,
  },
});
