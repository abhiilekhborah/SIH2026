import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

interface GalleryItem {
  id: string;
  title: string;
  category: 'Licences & Certs' | 'Cold Chain' | 'Store & Storage';
  issueDate: string;
  expiryDate: string;
  docNumber: string;
  status: 'Active' | 'Verified';
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'CDSCO Form 20B / 21B Retail Drug Licence',
    category: 'Licences & Certs',
    issueDate: '12 Jan 2024',
    expiryDate: '11 Jan 2029',
    docNumber: 'DL-20B/21B-98214',
    status: 'Verified',
    description: 'Official state drug control administration authorization for retail pharmaceutical dispensing.',
  },
  {
    id: 'g-2',
    title: 'Registered Pharmacist Practicing Certificate',
    category: 'Licences & Certs',
    issueDate: '15 Mar 2024',
    expiryDate: '14 Mar 2029',
    docNumber: 'R.Ph-2024-8902',
    status: 'Verified',
    description: 'Pharmacy Council of India (PCI) registered pharmacist license for Dr. Rajesh Mehta.',
  },
  {
    id: 'g-3',
    title: 'Cold Storage Unit 1 Calibration Report (2-8°C)',
    category: 'Cold Chain',
    issueDate: '01 Aug 2026',
    expiryDate: '01 Aug 2027',
    docNumber: 'CAL-REF-8819',
    status: 'Active',
    description: 'Quarterly sensor calibration and temperature log for Lantus Insulin & Tetanus vaccine storage.',
  },
  {
    id: 'g-4',
    title: 'WHO-GMP Storage Compliance Certificate',
    category: 'Store & Storage',
    issueDate: '10 Feb 2025',
    expiryDate: '09 Feb 2028',
    docNumber: 'GMP-ST-4410',
    status: 'Verified',
    description: 'Good Manufacturing & Storage Practices audit for humidity, temperature, and dust-free racking.',
  },
];

export default function PharmacistGalleryScreen() {
  const { openMenu } = useSideMenu();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = ['All', 'Licences & Certs', 'Cold Chain', 'Store & Storage'];

  const filteredItems = GALLERY_ITEMS.filter(
    item => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Gallery & Licences"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Dispensary Certificates & Media</Text>
            <Text style={styles.headerSubtitle}>Official Pharmacy Accreditations</Text>
          </View>
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Certificate Cards */}
        {filteredItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => setActiveItem(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={
                    item.category === 'Cold Chain'
                      ? 'snow'
                      : item.category === 'Store & Storage'
                      ? 'cube'
                      : 'shield-checkmark'
                  }
                  size={20}
                  color={PRIMARY_BLUE}
                />
              </View>
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={13} color="#15803D" />
                <Text style={styles.verifiedText}>{item.status}</Text>
              </View>
            </View>

            <Text style={styles.docTitle}>{item.title}</Text>
            <Text style={styles.docNum}>Doc Ref: {item.docNumber}</Text>
            <Text style={styles.docDesc}>{item.description}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>Issued: {item.issueDate}</Text>
              <Text style={styles.metaText}>Valid Till: {item.expiryDate}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => Alert.alert('Upload Document', 'Select scanned licence or certificate PDF from storage.')}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
          <Text style={styles.uploadBtnText}>Upload New Certificate / Licence</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal */}
      <Modal visible={!!activeItem} transparent animationType="slide" onRequestClose={() => setActiveItem(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setActiveItem(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Certificate Preview</Text>
              <TouchableOpacity onPress={() => setActiveItem(null)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.certPaper}>
              <Ionicons name="ribbon" size={40} color="#1A66E8" style={{ alignSelf: 'center', marginBottom: 8 }} />
              <Text style={styles.certMainTitle}>{activeItem?.title}</Text>
              <Text style={styles.certRef}>Document Reference: {activeItem?.docNumber}</Text>
              <Text style={styles.certDetails}>{activeItem?.description}</Text>
              <View style={styles.certMetaBox}>
                <Text style={styles.certMeta}>Issued: {activeItem?.issueDate}</Text>
                <Text style={styles.certMeta}>Valid Until: {activeItem?.expiryDate}</Text>
              </View>
              <Text style={styles.certStamp}>OFFICIALLY VERIFIED • MEDIQUICK PHARMACY NETWORK</Text>
            </View>
          </View>
        </View>
      </Modal>
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
  catScroll: { maxHeight: 44 },
  catChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: PRIMARY_BLUE, borderColor: PRIMARY_BLUE },
  catChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  catChipTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  docTitle: { fontSize: 15, fontWeight: '800', color: TEXT_DARK },
  docNum: { fontSize: 12, fontWeight: '700', color: PRIMARY_BLUE },
  docDesc: { fontSize: 12, color: TEXT_MUTED, lineHeight: 16 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8, marginTop: 4 },
  metaText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 14,
    marginTop: 6,
  },
  uploadBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: TEXT_DARK },
  certPaper: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 6 },
  certMainTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK, textAlign: 'center' },
  certRef: { fontSize: 12, fontWeight: '700', color: PRIMARY_BLUE },
  certDetails: { fontSize: 12, color: '#475569', textAlign: 'center', marginVertical: 6 },
  certMetaBox: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  certMeta: { fontSize: 11, color: TEXT_MUTED, fontWeight: '600' },
  certStamp: { fontSize: 10, fontWeight: '800', color: '#059669', letterSpacing: 0.5, marginTop: 8 },
});
