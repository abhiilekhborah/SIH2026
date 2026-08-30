import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { HamburgerButton } from './hamburger-button';
import { NotificationButton } from './notification-button';

export interface AppHeaderProps {
  title?: string;
  showMenu?: boolean;
  showNotification?: boolean;
  onPressMenu?: () => void;
  onPressNotification?: () => void;
  badgeCount?: number;
  hasUnreadNotifications?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  centerElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  buttonBackgroundColor?: string;
}

export function AppHeader({
  title,
  showMenu = true,
  showNotification = true,
  onPressMenu,
  onPressNotification,
  badgeCount = 0,
  hasUnreadNotifications = false,
  leftElement,
  rightElement,
  centerElement,
  style,
  buttonBackgroundColor = '#F3F4F6',
}: AppHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Left Slot: Hamburger Button or custom left element */}
      <View style={styles.leftSlot}>
        {leftElement ? (
          leftElement
        ) : showMenu ? (
          <HamburgerButton
            onPress={onPressMenu}
            backgroundColor={buttonBackgroundColor}
          />
        ) : null}
      </View>

      {/* Center Slot: Title or custom center element */}
      <View style={styles.centerSlot}>
        {centerElement ? (
          centerElement
        ) : title ? (
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      {/* Right Slot: Notification Button or custom right element */}
      <View style={styles.rightSlot}>
        {rightElement ? (
          rightElement
        ) : showNotification ? (
          <NotificationButton
            onPress={onPressNotification}
            badgeCount={badgeCount}
            hasUnread={hasUnreadNotifications}
            backgroundColor={buttonBackgroundColor}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  leftSlot: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rightSlot: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
