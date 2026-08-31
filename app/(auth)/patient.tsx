import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect } from '@/components/chip-select';
import { FormField } from '@/components/form-field';

const BLUE = '#1A66E8';
const DARK_BLUE = '#123E9E';
const BORDER = '#E5E7EB';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/** Mirrors the text fields of patient_profiles. */
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

/** "peanuts, dust" becomes ["peanuts", "dust"], for the jsonb columns. */
function toList(input: string): string[] {
  return input
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function PatientDetails() {
  const { user } = useUser();
  const router = useRouter();

  // One object rather than a dozen useState calls. `update` writes a single
  // field and copies the rest, so state is replaced instead of mutated.
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
      // The shape the patient_profiles row expects. Columns the user does not
      // fill are left out: id defaults in Postgres, and the foreign keys are
      // resolved on the server.
      const payload = {
        user_id: user?.id,
        name: form.name.trim(),
        abha_id: form.abhaId.trim() || null,
        blood_group: form.bloodGroup[0] ?? null,
        emergency_contact_name: form.emergencyContactName.trim() || null,
        emergency_contact_phone: form.emergencyContactPhone.trim() || null,
        allergies: toList(form.allergies),
        chronic_conditions: toList(form.chronicConditions),
        address: form.address.trim() || null,
        village_town: form.villageTown.trim() || null,
        district: form.district.trim() || null,
        state: form.state.trim() || null,
        pincode: form.pincode.trim() || null,
      };

      // TODO: POST this to the backend that writes patient_profiles.
      console.log('patient_profiles payload', payload);

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
        <Text style={styles.title}>Patient details</Text>
        <Text style={styles.subtitle}>
          This helps us reach the right care for you, faster.
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
          placeholder="14 digit health ID"
          keyboardType="number-pad"
          maxLength={14}
          hint="Leave blank if you do not have one yet."
        />

        <ChipSelect
          label="Blood Group"
          options={BLOOD_GROUPS}
          value={form.bloodGroup}
          onChange={(value) => update('bloodGroup', value)}
        />

        <Text style={styles.sectionHeading}>Emergency contact</Text>

        <FormField
          label="Contact Name"
          value={form.emergencyContactName}
          onChangeText={(value) => update('emergencyContactName', value)}
          placeholder="Who should we call?"
          autoCapitalize="words"
        />

        <FormField
          label="Contact Phone"
          value={form.emergencyContactPhone}
          onChangeText={(value) => update('emergencyContactPhone', value)}
          placeholder="10 digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.sectionHeading}>Medical history</Text>

        <FormField
          label="Allergies"
          value={form.allergies}
          onChangeText={(value) => update('allergies', value)}
          placeholder="Penicillin, dust"
          hint="Separate each one with a comma."
        />

        <FormField
          label="Chronic Conditions"
          value={form.chronicConditions}
          onChangeText={(value) => update('chronicConditions', value)}
          placeholder="Diabetes, asthma"
          hint="Separate each one with a comma."
        />

        <Text style={styles.sectionHeading}>Address</Text>

        <FormField
          label="Address"
          value={form.address}
          onChangeText={(value) => update('address', value)}
          placeholder="House number, street, landmark"
          multiline
        />

        <FormField
          label="Village / Town"
          value={form.villageTown}
          onChangeText={(value) => update('villageTown', value)}
          autoCapitalize="words"
        />

        <FormField
          label="District"
          value={form.district}
          onChangeText={(value) => update('district', value)}
          autoCapitalize="words"
        />

        <FormField
          label="State"
          value={form.state}
          onChangeText={(value) => update('state', value)}
          autoCapitalize="words"
        />

        <FormField
          label="Pincode"
          value={form.pincode}
          onChangeText={(value) => update('pincode', value)}
          placeholder="6 digits"
          keyboardType="number-pad"
          maxLength={6}
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
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 28,
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
