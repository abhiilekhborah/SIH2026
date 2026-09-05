import React from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const BORDER = '#E5E7EB';

export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** Shows a red asterisk next to the label. Does not validate on its own. */
  required?: boolean;
  /** Grey text under the input, for things like "separate with commas". */
  hint?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
}

/** A labelled text input, styled like the ones on the sign up screen. */
export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  hint,
  keyboardType,
  autoCapitalize = 'sentences',
  maxLength,
  multiline = false,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>

      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export default FormField;

const styles = StyleSheet.create({
  field: {
    marginTop: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  asterisk: {
    color: '#DC2626',
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  inputMultiline: {
    height: 100,
    paddingTop: 14,
    paddingBottom: 14,
  },
  hint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
  },
});
