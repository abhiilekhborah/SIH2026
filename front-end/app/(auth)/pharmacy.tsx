import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/form-field';
import { getOrCreateDbUserId, supabase } from '@/lib/supabase';

const BLUE = '#1A66E8';
const DARK_BLUE = '#123E9E';
const BORDER = '#E5E7EB';

type PharmacyForm = {
  name: string;
  licenseNo: string;
  /** pharmacies.id — which shop this pharmacist works at. */
  pharmacyId: string;
};

const EMPTY_FORM: PharmacyForm = {
  name: '',
  licenseNo: '',
  pharmacyId: '',
};

/** A row from `pharmacies`, as offered in the picker below. */
type PharmacyOption = {
  id: string;
  name: string | null;
  village_town: string | null;
  district: string | null;
};

export default function PharmacyDetails() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState<PharmacyForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [pharmacies, setPharmacies] = useState<PharmacyOption[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [pharmaciesError, setPharmaciesError] = useState<string | null>(null);

  // Prescriptions are sent to a pharmacy, not to a person, so a pharmacist has
  // to be attached to one — without pharmacy_id their queue has nothing to
  // match orders against.
  const loadPharmacies = useCallback(async () => {
    setLoadingPharmacies(true);
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('id, name, village_town, district')
        .order('name');

      if (error) throw error;

      setPharmacies(data ?? []);
      setPharmaciesError(
        (data ?? []).length === 0
          ? 'No pharmacies are registered yet. Ask your admin to add yours.'
          : null
      );
    } catch (err: any) {
      setPharmaciesError(err?.message ?? 'Could not load the pharmacy list.');
    } finally {
      setLoadingPharmacies(false);
    }
  }, []);

  useEffect(() => {
    loadPharmacies();
  }, [loadPharmacies]);

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

    if (!form.pharmacyId) {
      Alert.alert('Pharmacy required', 'Please choose the pharmacy you work at.');
      return;
    }

    setSaving(true);

    try {
      const dbUserId = await getOrCreateDbUserId(user, form.name);

      const payload = {
        ...(dbUserId ? { user_id: dbUserId } : {}),
        name: form.name.trim(),
        license_no: form.licenseNo.trim(),
        pharmacy_id: form.pharmacyId,
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

        <View style={styles.pickerField}>
          <Text style={styles.pickerLabel}>
            Your Pharmacy<Text style={styles.asterisk}> *</Text>
          </Text>

          {loadingPharmacies ? (
            <View style={styles.pickerPlaceholder}>
              <ActivityIndicator color={BLUE} />
            </View>
          ) : pharmaciesError ? (
            <View style={styles.pickerPlaceholder}>
              <Text style={styles.pickerError}>{pharmaciesError}</Text>
              <Pressable onPress={loadPharmacies} style={styles.retryButton}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            pharmacies.map((pharmacy) => {
              const selected = form.pharmacyId === pharmacy.id;
              const place = [pharmacy.village_town, pharmacy.district]
                .filter(Boolean)
                .join(', ');

              return (
                <Pressable
                  key={pharmacy.id}
                  onPress={() => update('pharmacyId', pharmacy.id)}
                  style={[styles.pharmacyOption, selected && styles.pharmacyOptionSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? BLUE : '#9CA3AF'}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pharmacyName, selected && styles.pharmacyNameSelected]}>
                      {pharmacy.name ?? 'Unnamed pharmacy'}
                    </Text>
                    {!!place && <Text style={styles.pharmacyPlace}>{place}</Text>}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

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
  pickerField: {
    marginTop: 18,
  },
  pickerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  asterisk: {
    color: '#DC2626',
  },
  pickerPlaceholder: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 10,
  },
  pickerError: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
  },
  pharmacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  pharmacyOptionSelected: {
    borderColor: BLUE,
    backgroundColor: '#EFF6FF',
  },
  pharmacyName: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
  },
  pharmacyNameSelected: {
    color: BLUE,
    fontWeight: '700',
  },
  pharmacyPlace: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
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
