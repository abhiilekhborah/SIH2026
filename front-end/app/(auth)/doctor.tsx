import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect } from '@/components/chip-select';
import { FormField } from '@/components/form-field';
import { getOrCreateDbUserId, supabase } from '@/lib/supabase';

const BLUE = '#1A66E8';
const DARK_BLUE = '#123E9E';
const BORDER = '#E5E7EB';

const CONSULTATION_MODES = ['In-person', 'Video', 'Phone'];

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
      const dbUserId = await getOrCreateDbUserId(user, form.name);

      const payload = {
        ...(dbUserId ? { user_id: dbUserId } : {}),
        name: form.name.trim(),
        specialization: form.specialization.trim() || null,
        qualification: form.qualification.trim() || null,
        license_no: form.licenseNo.trim(),
        experience_years: form.experienceYears
          ? Number(form.experienceYears)
          : null,
        consultation_fee: form.consultationFee
          ? Number(form.consultationFee)
          : null,
        consultation_modes: form.consultationModes.join(',') || null,
      };

      console.log('doctor_profiles payload', payload);

      try {
        const { error: insertError } = await supabase.from('doctor_profiles').insert(payload);
        if (insertError) {
          if (insertError.code === '23505' && dbUserId) {
            const { error: updateError } = await supabase
              .from('doctor_profiles')
              .update(payload)
              .eq('user_id', dbUserId);
            if (updateError) {
              console.warn('Supabase update warning for doctor_profiles:', updateError.message);
            }
          } else {
            console.warn('Supabase insert warning for doctor_profiles:', insertError.message);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase request caught error:', dbErr);
      }

      // Doctor home route in main front-end
      router.replace('/(tabs2)/home');
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

        <FormField
          label="Specialization"
          value={form.specialization}
          onChangeText={(value) => update('specialization', value)}
          placeholder="General Medicine, Cardiology..."
          autoCapitalize="words"
        />

        <FormField
          label="Qualification"
          value={form.qualification}
          onChangeText={(value) => update('qualification', value)}
          placeholder="MBBS, MD..."
          autoCapitalize="characters"
        />

        <FormField
          label="Experience (Years)"
          value={form.experienceYears}
          onChangeText={(value) => update('experienceYears', value)}
          placeholder="e.g. 8"
          keyboardType="number-pad"
        />

        <ChipSelect
          label="Consultation Modes"
          options={CONSULTATION_MODES}
          value={form.consultationModes}
          onChange={(value) => update('consultationModes', value)}
          multiple
        />

        <FormField
          label="Consultation Fee (₹)"
          value={form.consultationFee}
          onChangeText={(value) => update('consultationFee', value)}
          placeholder="500"
          keyboardType="number-pad"
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
