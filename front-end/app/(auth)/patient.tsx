import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect } from '@/components/chip-select';
import { FormField } from '@/components/form-field';
import { apiPost } from '@/lib/api';

const BLUE = '#1A66E8';
const DARK_BLUE = '#123E9E';
const BORDER = '#E5E7EB';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

type PatientForm = {
  name: string;
  abhaId: string;
  bloodGroup: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  chronicConditions: string;
  address: string;
  villageTown: string;
  district: string;
  state: string;
  pincode: string;
};

const EMPTY_FORM: PatientForm = {
  name: '',
  abhaId: '',
  bloodGroup: [],
  emergencyContactName: '',
  emergencyContactPhone: '',
  allergies: '',
  chronicConditions: '',
  address: '',
  villageTown: '',
  district: '',
  state: '',
  pincode: '',
};

function toList(input: string): string[] {
  return input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function PatientDetails() {
  const router = useRouter();

  const [form, setForm] = useState<PatientForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const update = <Field extends keyof PatientForm>(
    field: Field,
    value: PatientForm[Field]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (saving) return;

    if (!form.name.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }

    if (form.pincode && form.pincode.length !== 6) {
      Alert.alert('Check the pincode', 'A pincode is 6 digits.');
      return;
    }

    setSaving(true);

    try {
      // Created through the API, not the Supabase client: `userauthenticate`
      // resolves the caller from their Clerk session and owns `user_id`, so the
      // NOT NULL column can no longer go missing. The old path built the
      // payload around a possibly-null id, dropped the column, and let Postgres
      // reject the row while the screen navigated on regardless.
      await apiPost('/api/v1/user/patient/add', {
        name: form.name.trim(),
        abhaId: form.abhaId.trim() || null,
        bloodGroup: form.bloodGroup[0] ?? null,
        emergencyContactName: form.emergencyContactName.trim() || null,
        emergencyContactPhone: form.emergencyContactPhone.trim() || null,
        allergies: toList(form.allergies),
        chronicConditions: toList(form.chronicConditions),
        address: form.address.trim() || null,
        villageTown: form.villageTown.trim() || null,
        district: form.district.trim() || null,
        state: form.state.trim() || null,
        pincode: form.pincode.trim() || null,
      });

      router.replace('/(tabs)/home');
    } catch (err: any) {
      // Stay on the form. Navigating away on failure is what let people reach
      // the home screen half-registered, with no patient profile and therefore
      // no prescriptions.
      Alert.alert(
        'Could not save your profile',
        err?.message ?? 'Check your connection and try again.'
      );
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
        <Text style={styles.title}>Patient details</Text>
        <Text style={styles.subtitle}>
          This helps doctors give you safer, faster care.
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
          label="ABHA ID"
          value={form.abhaId}
          onChangeText={(value) => update('abhaId', value)}
          placeholder="14-digit Ayushman Bharat Health Account number"
          keyboardType="number-pad"
          maxLength={14}
        />

        <ChipSelect
          label="Blood Group"
          options={BLOOD_GROUPS}
          value={form.bloodGroup}
          onChange={(value) => update('bloodGroup', value)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
        </View>

        <FormField
          label="Contact Name"
          value={form.emergencyContactName}
          onChangeText={(value) => update('emergencyContactName', value)}
          placeholder="e.g. John Doe (Brother)"
          autoCapitalize="words"
        />

        <FormField
          label="Contact Phone"
          value={form.emergencyContactPhone}
          onChangeText={(value) => update('emergencyContactPhone', value)}
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medical History</Text>
        </View>

        <FormField
          label="Allergies"
          value={form.allergies}
          onChangeText={(value) => update('allergies', value)}
          placeholder="Penicillin, Peanuts, Dust..."
          hint="Separate multiple entries with commas"
        />

        <FormField
          label="Chronic Conditions"
          value={form.chronicConditions}
          onChangeText={(value) => update('chronicConditions', value)}
          placeholder="Diabetes, Asthma, Hypertension..."
          hint="Separate multiple entries with commas"
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Location</Text>
        </View>

        <FormField
          label="Street Address / House No."
          value={form.address}
          onChangeText={(value) => update('address', value)}
          placeholder="House 42, Main Road"
        />

        <FormField
          label="Village / Town"
          value={form.villageTown}
          onChangeText={(value) => update('villageTown', value)}
          placeholder="Rampur"
          autoCapitalize="words"
        />

        <FormField
          label="District"
          value={form.district}
          onChangeText={(value) => update('district', value)}
          placeholder="Patna"
          autoCapitalize="words"
        />

        <FormField
          label="State"
          value={form.state}
          onChangeText={(value) => update('state', value)}
          placeholder="Bihar"
          autoCapitalize="words"
        />

        <FormField
          label="Pincode"
          value={form.pincode}
          onChangeText={(value) => update('pincode', value)}
          placeholder="800001"
          keyboardType="number-pad"
          maxLength={6}
        />

        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitText}>
            {saving ? 'Saving...' : 'Save & Continue'}
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
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 6,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  submitButton: {
    height: 56,
    borderRadius: 10,
    backgroundColor: DARK_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
