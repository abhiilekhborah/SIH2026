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

export default function HealthAnalysisScreen() {
  const { openMenu } = useSideMenu();

  const drugCategories = [
    { name: 'Antibiotics & Antivirals', percentage: 38, count: '142 Orders', color: '#1A66E8' },
    { name: 'Analgesics & Antipyretics', percentage: 27, count: '101 Orders', color: '#059669' },
    { name: 'Diabetes & Hypertension', percentage: 22, count: '82 Orders', color: '#7C3AED' },
    { name: 'Respiratory & Anti-Allergy', percentage: 13, count: '48 Orders', color: '#EA580C' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Health Analysis"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Epidemiological Trends</Text>
            <Text style={styles.headerSubtitle}>Rural Cluster Health Insights</Text>
          </View>
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Seasonal Alert Banner */}
        <View style={styles.surgeCard}>
          <View style={styles.surgeHeader}>
            <Ionicons name="trending-up" size={20} color="#DC2626" />
            <Text style={styles.surgeTitle}>Seasonal Surge: Acute Pharyngitis & Flu</Text>
          </View>
          <Text style={styles.surgeSub}>
            +42% increase in Paracetamol 650mg and Azithromycin 500mg prescriptions in the last 14 days. Ensure 100+ buffer stock on Shelf Rack A-1.
          </Text>
        </View>

        {/* Prescription Category Distribution */}
        <Text style={styles.sectionHeading}>Top Prescribed Drug Classes (August 2026)</Text>
        <View style={styles.chartCard}>
          {drugCategories.map((cat, idx) => (
            <View key={idx} style={styles.catItem}>
              <View style={styles.catRow}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catCount}>{cat.count} ({cat.percentage}%)</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Patient Demographics */}
        <Text style={styles.sectionHeading}>Patient Age & Vulnerability Demographics</Text>
        <View style={styles.grid2}>
          <View style={styles.demoCard}>
            <Text style={styles.demoNum}>34%</Text>
            <Text style={styles.demoTitle}>Geriatric (60+ Yrs)</Text>
            <Text style={styles.demoSub}>Chronic care refills</Text>
          </View>
          <View style={styles.demoCard}>
            <Text style={styles.demoNum}>46%</Text>
            <Text style={styles.demoTitle}>Adults (18-59 Yrs)</Text>
            <Text style={styles.demoSub}>Acute illness & fever</Text>
          </View>
        </View>

        {/* Antibiotic Stewardship */}
        <View style={styles.stewardshipCard}>
          <Ionicons name="shield-checkmark" size={22} color="#15803D" />
          <View style={{ flex: 1 }}>
            <Text style={styles.stewardshipTitle}>Antibiotic Stewardship Score: 98%</Text>
            <Text style={styles.stewardshipSub}>
              100% of dispensed antibiotics verified against valid registered physician signatures. Zero unverified OTC antibiotic sales.
            </Text>
          </View>
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
  surgeCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
    gap: 6,
  },
  surgeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  surgeTitle: { fontSize: 14, fontWeight: '800', color: '#DC2626' },
  surgeSub: { fontSize: 12, color: '#991B1B', lineHeight: 17 },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: TEXT_DARK, marginTop: 4 },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 12,
  },
  catItem: { gap: 4 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between' },
  catName: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  catCount: { fontSize: 12, fontWeight: '600', color: TEXT_MUTED },
  barTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  grid2: { flexDirection: 'row', gap: 10 },
  demoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
  },
  demoNum: { fontSize: 22, fontWeight: '800', color: PRIMARY_BLUE },
  demoTitle: { fontSize: 13, fontWeight: '700', color: TEXT_DARK, marginTop: 4 },
  demoSub: { fontSize: 11, color: TEXT_MUTED, marginTop: 2 },
  stewardshipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  stewardshipTitle: { fontSize: 14, fontWeight: '800', color: '#15803D' },
  stewardshipSub: { fontSize: 12, color: '#166534', lineHeight: 17, marginTop: 2 },
});
