import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { getOrCreateDbUserId, supabase } from '@/lib/supabase';

const BLUE = '#1A66E8';
const DARK_BLUE = '#123E9E';
const BORDER = '#E5E7EB';

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
      const dbUserId = await getOrCreateDbUserId(user, form.name);

      const payload = {
        ...(dbUserId ? { user_id: dbUserId } : {}),
        name: form.name.trim(),
        license_no: form.licenseNo.trim(),
      };

      console.log('pharmacist_profiles payload', payload);

      try {
        const { error: insertError } = await supabase.from('pharmacist_profiles').insert(payload);
        if (insertError) {
          if (insertError.code === '23505' && dbUserId) {
            const { error: updateError } = await supabase
              .from('pharmacist_profiles')
              .update(payload)
              .eq('user_id', dbUserId);
            if (updateError) {
              console.warn('Supabase update warning for pharmacist_profiles:', updateError.message);
            }
          } else {
            console.warn('Supabase insert warning for pharmacist_profiles:', insertError.message);
          }
        }
      } catch (dbErr) {
        console.warn('Supabase request caught error:', dbErr);
      }

      // Pharmacy home route in main front-end
      router.replace('/(tab3)/home3');
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
          placeholder="e.g. PH-2021-98765"
          autoCapitalize="characters"
          required
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
