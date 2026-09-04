import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

export default function AboutUsScreen() {
  const { openMenu } = useSideMenu();

  const pillars = [
    {
      icon: 'timer-outline',
      title: '10-Minute Rural Delivery',
      desc: 'Rapid last-mile medicine fulfillment across remote sub-district clusters.',
    },
    {
      icon: 'shield-checkmark-outline',
      title: '100% Verified Prescriptions',
      desc: 'Digital prescription verification directly from registered doctors and PHCs.',
    },
    {
      icon: 'snow-outline',
      title: 'Certified Cold-Chain Storage',
      desc: 'Constant 2°C - 8°C temperature monitoring for critical insulin & vaccines.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="About MediQuick"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>About MediQuick</Text>
            <Text style={styles.headerSubtitle}>Pharmacy & Dispensary Network</Text>
          </View>
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Mission Hero */}
        <View style={styles.heroCard}>
          <View style={styles.logoBadge}>
            <Ionicons name="medkit" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Smart Pharmacy Care. Closer to You.</Text>
          <Text style={styles.heroDesc}>
            MediQuick bridges the gap between rural patients, community physicians, and local dispensaries through smart digital dispensing, real-time medicine availability, and cold-chain compliance.
          </Text>
        </View>

        {/* Core Pillars */}
        <Text style={styles.sectionHeading}>Our Core Dispensary Pillars</Text>
        {pillars.map((p, idx) => (
          <View key={idx} style={styles.pillarCard}>
            <View style={styles.iconCircle}>
              <Ionicons name={p.icon as any} size={22} color={PRIMARY_BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.pillarDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}

        {/* Regulatory & Safety Box */}
        <View style={styles.safetyBox}>
          <Ionicons name="checkmark-done-circle" size={22} color="#15803D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.safetyTitle}>CDSCO & WHO-GMP Compliant</Text>
            <Text style={styles.safetyDesc}>
              Operated under Drugs & Cosmetics Rules, 1945. All inventory is serial-tracked with batch-level barcode verification.
            </Text>
          </View>
        </View>

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>MediQuick Pharmacist Portal v2.4.0 (SIH-2026 Release)</Text>
          <Text style={styles.copyrightText}>© 2026 MediQuick Healthcare Network. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG_PAGE },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK },
  headerSubtitle: { fontSize: 11, color: PRIMARY_BLUE, fontWeight: '600' },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 14 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 4,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: TEXT_DARK, textAlign: 'center' },
  heroDesc: { fontSize: 13, color: TEXT_MUTED, lineHeight: 19, textAlign: 'center' },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: TEXT_DARK, marginTop: 4 },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  pillarDesc: { fontSize: 12, color: TEXT_MUTED, lineHeight: 16, marginTop: 2 },
  safetyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  safetyTitle: { fontSize: 14, fontWeight: '800', color: '#15803D' },
  safetyDesc: { fontSize: 12, color: '#166534', lineHeight: 17, marginTop: 2 },
  versionFooter: { alignItems: 'center', marginTop: 10, gap: 2 },
  versionText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  copyrightText: { fontSize: 11, color: '#94A3B8' },
});
