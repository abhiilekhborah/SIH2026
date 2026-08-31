import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';

const BLUE = '#1A66E8';
const DARK_BLUE = '#123E9E';
const BORDER = '#E5E7EB';

/** Mirrors the fields of pharmacist_profiles that the pharmacist fills in. */
type PharmacyForm = {
  name: string;
  licenseNo: string;
};

const EMPTY_FORM: PharmacyForm = {
  name: '',
  licenseNo: '',
};

export default function PharmacyDetails() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState<PharmacyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const update = <Field extends keyof PharmacyForm>(
    field: Field,
    value: PharmacyForm[Field]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (saving) return;

    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    if (!form.licenseNo.trim()) {
      Alert.alert('Licence required', 'Please enter your pharmacy registration number.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        user_id: user?.id,
        name: form.name.trim(),
        license_no: form.licenseNo.trim(),
        // pharmacy_id points at a row in the pharmacies table, so it needs a
        // picker rather than a text box. Left for when that list exists.
      };

      // TODO: POST this to the backend that writes pharmacist_profiles.
      console.log('pharmacist_profiles payload', payload);

      router.replace('/home');
    } catch {
      Alert.alert('Could not save', 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Ionicons name="medkit-outline" size={26} color={BLUE} />
        <Text style={styles.logoText}>MediQuick</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Pharmacy details</Text>
        <Text style={styles.subtitle}>
          We use this to link you to your pharmacy.
        </Text>

        <FormField
          label="Full Name"
          value={form.name}
          onChangeText={(value) => update('name', value)}
          placeholder="Jane Doe"
          autoCapitalize="words"
          required
        />

        <FormField
          label="Pharmacy Registration Number"
          value={form.licenseNo}
          onChangeText={(value) => update('licenseNo', value)}
          placeholder="e.g. PCI-2020-11294"
          autoCapitalize="characters"
          required
        />

        <Pressable
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitText}>
            {saving ? 'Saving...' : 'Save and continue'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: BLUE,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    backgroundColor: DARK_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
