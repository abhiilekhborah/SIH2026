import { AppHeader } from '@/components/app-header';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function History() {
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleOpenMenu = () => {
    Alert.alert('Menu', 'Side navigation menu opened');
  };

  const handleOpenNotifications = () => {
    Alert.alert('Notifications', 'Medical history notifications');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="History"
        showMenu={true}
        showNotification={true}
        onPressMenu={handleOpenMenu}
        onPressNotification={handleOpenNotifications}
        badgeCount={unreadNotifications}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Medical History</Text>
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
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});
