import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export interface NotificationButtonProps {
  onPress?: () => void;
  badgeCount?: number;
  hasUnread?: boolean;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function NotificationButton({
  onPress,
  badgeCount = 0,
  hasUnread = false,
  size = 22,
  color = '#111827',
  backgroundColor = '#F3F4F6',
  style,
  testID = 'notification-button',
}: NotificationButtonProps) {
  const showBadge = badgeCount > 0 || hasUnread;
  const displayCount = badgeCount > 99 ? '99+' : badgeCount.toString();

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.button,
        backgroundColor ? { backgroundColor } : null,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
    >
      <Ionicons name="notifications-outline" size={size} color={color} />
      {showBadge && (
        <View
          style={[
            styles.badge,
            badgeCount > 0 ? styles.countBadge : styles.dotBadge,
          ]}
        >
          {badgeCount > 0 && (
            <Text style={styles.badgeText}>{displayCount}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#EF4444',
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBadge: {
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  countBadge: {
    top: 2,
    right: 1,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
