import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

export interface HamburgerButtonProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function HamburgerButton({
  onPress,
  size = 24,
  color = '#111827',
  backgroundColor = '#F3F4F6',
  style,
  testID = 'hamburger-button',
}: HamburgerButtonProps) {
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
      accessibilityLabel="Open menu"
    >
      <Ionicons name="menu-outline" size={size} color={color} />
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
  },
});
