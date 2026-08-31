import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const BLUE = '#1A66E8';
const BORDER = '#E5E7EB';

export interface ChipSelectProps {
  label: string;
  options: string[];
  /** Currently chosen options. One entry unless `multiple` is set. */
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  /** Allow more than one option at a time. */
  multiple?: boolean;
}

/**
 * A row of tappable chips, for short fixed lists like blood group.
 *
 * Always works in arrays, even for single choice, so the caller does not have
 * to handle two different shapes. Single choice just returns a one-item array.
 */
export function ChipSelect({
  label,
  options,
  value,
  onChange,
  required = false,
  multiple = false,
}: ChipSelectProps) {
  const toggle = (option: string) => {
    if (!multiple) {
      // Tapping the chosen chip again clears it, so a field can be emptied.
      onChange(value.includes(option) ? [] : [option]);
      return;
    }

    onChange(
      value.includes(option)
        ? value.filter((entry) => entry !== option)
        : [...value, option]
    );
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>

      <View style={styles.chipRow}>
        {options.map((option) => {
          const selected = value.includes(option);

          return (
            <Pressable
              key={option}
              onPress={() => toggle(option)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  asterisk: {
    color: '#DC2626',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    borderColor: BLUE,
    backgroundColor: '#EFF6FF',
  },
  chipText: {
    fontSize: 15,
    color: '#374151',
  },
  chipTextSelected: {
    color: BLUE,
    fontWeight: '700',
  },
});
