import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface RoleCardProps {
  label: string;
  description: string;
  image: ImageSourcePropType;
  /** Colour of the title and the chevron. */
  accent: string;
  backgroundColor: string;
  borderColor: string;
  onPress: () => void;
  /** Greys the card out and ignores taps, while a choice is being saved. */
  disabled?: boolean;
}

/**
 * One role choice on the role screen: avatar, title, description, chevron.
 *
 * Only the look is shared. Each card is placed by hand with its own onPress,
 * because the three roles go to three different screens.
 */
export function RoleCard({
  label,
  description,
  image,
  accent,
  backgroundColor,
  borderColor,
  onPress,
  disabled = false,
}: RoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor, borderColor },
        pressed && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${description}`}
    >
      {/* The artwork is a square with a coloured disc on white, so the wrapper
          clips it to a circle and the image is oversized to push the white
          margin outside the clip. */}
      <View style={styles.avatarWrap}>
        <Image source={image} style={styles.avatar} contentFit="cover" />
      </View>

      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: accent }]}>{label}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>

      <Ionicons name="chevron-forward" size={26} color={accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    overflow: 'hidden',
  },
  avatar: {
    width: '116%',
    height: '116%',
    marginLeft: '-8%',
    marginTop: '-8%',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    color: '#5B6B7F',
    lineHeight: 20,
    marginTop: 4,
  },
});
