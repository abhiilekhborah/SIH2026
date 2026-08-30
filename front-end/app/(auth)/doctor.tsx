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

const CONSULTATION_MODES = ['In-person', 'Video', 'Phone'];

/** Mirrors the fields of doctor_profiles that the doctor fills in. */
type DoctorForm = {
  name: string;
  specialization: string;
  qualification: string;
  licenseNo: string;
  experienceYears: string;
  consultationModes: string[];
  consultationFee: string;
};

const EMPTY_FORM: DoctorForm = {
  name: '',
  specialization: '',
  qualification: '',
  licenseNo: '',
  experienceYears: '',
  consultationModes: [],
  consultationFee: '',
};

export default function DoctorDetails() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState<DoctorForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const update = <Field extends keyof DoctorForm>(
    field: Field,
    value: DoctorForm[Field]
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
      Alert.alert('Licence required', 'Please enter your medical registration number.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        user_id: user?.id,
        name: form.name.trim(),
        specialization: form.specialization.trim() || null,
        qualification: form.qualification.trim() || null,
        license_no: form.licenseNo.trim(),
        // The columns are a number and a decimal, so send numbers, not text.
        experience_years: form.experienceYears
          ? Number(form.experienceYears)
          : null,
        consultation_fee: form.consultationFee
          ? Number(form.consultationFee)
          : null,
        // The column is a single varchar, so the choices go in joined up.
        consultation_modes: form.consultationModes.join(',') || null,
      };

      // TODO: POST this to the backend that writes doctor_profiles.
      console.log('doctor_profiles payload', payload);

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
        <Text style={styles.title}>Doctor details</Text>
        <Text style={styles.subtitle}>
          Patients see this when they choose a doctor.
        </Text>

        <FormField
          label="Full Name"
          value={form.name}
          onChangeText={(value) => update('name', value)}
          placeholder="Dr. Jane Doe"
          autoCapitalize="words"
          required
        />

        <FormField
          label="Medical Registration Number"
          value={form.licenseNo}
          onChangeText={(value) => update('licenseNo', value)}
          placeholder="e.g. MCI-2019-45871"
          autoCapitalize="characters"
          required
        />

        <Text style={styles.sectionHeading}>Practice</Text>

        <FormField
          label="Specialization"
          value={form.specialization}
          onChangeText={(value) => update('specialization', value)}
          placeholder="e.g. General Medicine, Paediatrics"
          autoCapitalize="words"
        />

        <FormField
          label="Qualification"
          value={form.qualification}
          onChangeText={(value) => update('qualification', value)}
          placeholder="e.g. MBBS, MD"
          autoCapitalize="characters"
        />

        <FormField
          label="Years of Experience"
          value={form.experienceYears}
          onChangeText={(value) => update('experienceYears', value)}
          placeholder="e.g. 8"
          keyboardType="number-pad"
          maxLength={2}
        />

        <Text style={styles.sectionHeading}>Consultation</Text>

        <ChipSelect
          label="How will you consult?"
          options={CONSULTATION_MODES}
          value={form.consultationModes}
          onChange={(value) => update('consultationModes', value)}
          multiple
        />

        <FormField
          label="Consultation Fee"
          value={form.consultationFee}
          onChangeText={(value) => update('consultationFee', value)}
          placeholder="Amount in rupees"
          keyboardType="number-pad"
          hint="Leave blank for free consultations."
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
