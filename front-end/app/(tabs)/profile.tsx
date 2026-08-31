import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { openMenu } = useSideMenu();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Profile"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={() => Alert.alert('Notifications', 'Profile notifications')}
      />
      <View style={styles.screen}>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});
