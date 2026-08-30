import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuickCare() {
  const { openMenu } = useSideMenu();
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const handleOpenNotifications = () => {
    Alert.alert('Notifications', 'QuickCare notifications');
    if (unreadNotifications > 0) {
      setUnreadNotifications(0);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="QuickCare"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={handleOpenNotifications}
        badgeCount={unreadNotifications}
      />
      <View style={styles.container}>
        <Text style={styles.text}>QuickCare Content</Text>
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
