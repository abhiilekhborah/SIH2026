import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RoleCard } from '@/components/role-card';

const BLUE = '#1A66E8'; // logo
const NAVY = '#122745'; // headline
const MUTED = '#5B6B7F'; // body copy

type Role = 'doctor' | 'patient' | 'pharmacist';

function DotGrid({ rows, columns }: { rows: number; columns: number }) {
  return (
    <View>
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={styles.dotRow}>
          {Array.from({ length: columns }).map((__, column) => (
            <View key={column} style={styles.dot} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function RoleScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const chooseRole = async (role: Role, destination: Href) => {
    if (!user || saving) return;
    setSaving(true);

    try {
      await user.updateMetadata({ unsafeMetadata: { role } });
      router.replace(destination);
    } catch (err: any) {
      Alert.alert(
        'Could not save your choice',
        err.errors?.[0]?.message ?? 'Check your connection and try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDoctor = () => chooseRole('doctor', '/doctor');
  const handlePatient = () => chooseRole('patient', '/patient');
  const handlePharmacy = () => chooseRole('pharmacist', '/pharmacy');

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[styles.blob, styles.blobTop]} />
        <View style={[styles.blob, styles.blobTopSoft]} />
        <View style={[styles.blob, styles.blobBottom]} />
        <View style={[styles.blob, styles.blobBottomSoft]} />

        <View style={styles.dotsTopRight}>
          <DotGrid rows={4} columns={4} />
        </View>
        <View style={styles.dotsBottomLeft}>
          <DotGrid rows={4} columns={4} />
        </View>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoRow}>
            <Ionicons name="medkit-outline" size={30} color={BLUE} />
            <Text style={styles.logoText}>MediQuick</Text>
          </View>

          <Text style={styles.title}>Welcome to{'\n'}Rural Healthcare</Text>
          <Text style={styles.tagline}>Smart care. Closer to you.</Text>
          <Text style={styles.prompt}>Choose your role to continue</Text>

          <RoleCard
            label="Doctor"
            description="Manage appointments, consultations and patient care"
            image={require('@/assets/images/doctor.png')}
            accent="#2E7DF7"
            backgroundColor="#EBF3FE"
            borderColor="#DCEAFD"
            onPress={handleDoctor}
            disabled={saving}
          />

          <RoleCard
            label="Patient"
            description="Book appointments, track health and access your records"
            image={require('@/assets/images/patient.png')}
            accent="#22A06B"
            backgroundColor="#E9F7EF"
            borderColor="#D7EFE2"
            onPress={handlePatient}
            disabled={saving}
          />

          <RoleCard
            label="Pharmacy"
            description="Manage prescriptions, inventory and dispense medicines"
            image={require('@/assets/images/pharma.png')}
            accent="#7C5CD6"
            backgroundColor="#F1EDFB"
            borderColor="#E4DCF7"
            onPress={handlePharmacy}
            disabled={saving}
          />

          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#8B9AAE" />
            <Text style={styles.footerText}>
              Secure {'  •  '} Private {'  •  '} Reliable
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 32,
  },
  blob: {
    position: 'absolute',
  },
  blobTop: {
    top: -190,
    left: -130,
    width: 360,
    height: 330,
    backgroundColor: '#CFE2FB',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 260,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 220,
    transform: [{ rotate: '-12deg' }],
  },
  blobTopSoft: {
    top: -150,
    left: -170,
    width: 320,
    height: 300,
    backgroundColor: '#E3EEFC',
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 240,
    borderTopLeftRadius: 160,
    borderTopRightRadius: 200,
    transform: [{ rotate: '8deg' }],
  },
  blobBottom: {
    bottom: -200,
    right: -140,
    width: 380,
    height: 340,
    backgroundColor: '#CFE2FB',
    borderTopLeftRadius: 260,
    borderTopRightRadius: 190,
    borderBottomLeftRadius: 220,
    borderBottomRightRadius: 180,
    transform: [{ rotate: '10deg' }],
  },
  blobBottomSoft: {
    bottom: -170,
    right: -180,
    width: 330,
    height: 300,
    backgroundColor: '#E3EEFC',
    borderTopLeftRadius: 230,
    borderTopRightRadius: 170,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 160,
    transform: [{ rotate: '-6deg' }],
  },
  dotsTopRight: {
    position: 'absolute',
    top: 48,
    right: 26,
  },
  dotsBottomLeft: {
    position: 'absolute',
    bottom: 60,
    left: 26,
  },
  dotRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    margin: 6,
    backgroundColor: '#D3E2F5',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  logoText: {
    fontSize: 27,
    fontWeight: '700',
    color: BLUE,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 22,
  },
  tagline: {
    fontSize: 16,
    color: MUTED,
    textAlign: 'center',
    marginTop: 10,
  },
  prompt: {
    fontSize: 17,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'center',
    marginTop: 26,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#8B9AAE',
  },
});
