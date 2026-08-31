import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { Ionicons } from '@expo/vector-icons';

export default function ReferralsScreen() {
  const { openMenu } = useSideMenu();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Referrals"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={() => Alert.alert('Notifications', 'No new notifications')}
      />
      <View style={styles.container}>
        <Ionicons name="people-outline" size={64} color="#1A66E8" />
        <Text style={styles.title}>Refer & Earn</Text>
        <Text style={styles.subtitle}>
          Invite friends and family to MediQuick and earn health rewards.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
