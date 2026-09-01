import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuickCare() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="QuickCare"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
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
