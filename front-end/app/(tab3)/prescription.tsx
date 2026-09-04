import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import {
  PrescriptionRequest,
  PrescriptionStatus,
  usePharmacyStore,
} from '@/lib/pharmacy-store';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

const FILTER_TABS: (PrescriptionStatus | 'All')[] = [
  'All',
  'Pending',
  'Accepted',
  'Processing',
  'Ready',
  'Completed',
];

export default function PrescriptionManagementScreen() {
  const { openMenu } = useSideMenu();
  const { prescriptions, updatePrescriptionStatus, sendQuickResponse } = usePharmacyStore();

  const [activeTab, setActiveTab] = useState<PrescriptionStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRx, setSelectedRx] = useState<PrescriptionRequest | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<PrescriptionRequest | null>(null);
  const [smsModalRx, setSmsModalRx] = useState<PrescriptionRequest | null>(null);
  const [smsText, setSmsText] = useState('');

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(rx => {
      const matchesTab = activeTab === 'All' || rx.status === activeTab;
      if (!matchesTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        rx.patientName.toLowerCase().includes(q) ||
        rx.rxNumber.toLowerCase().includes(q) ||
        rx.doctorName.toLowerCase().includes(q) ||
        rx.medicines.some(m => m.name.toLowerCase().includes(q))
      );
    });
  }, [prescriptions, activeTab, searchQuery]);

  const handleSendSms = () => {
    if (!smsModalRx) return;
    sendQuickResponse(smsModalRx.id, smsText);
    Alert.alert('Notification Sent', `Patient ${smsModalRx.patientName} has been notified via SMS.`);
    setSmsModalRx(null);
    setSmsText('');
  };

  const getStatusColor = (status: PrescriptionStatus) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      case 'Accepted':
        return { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' };
      case 'Processing':
        return { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE' };
      case 'Ready':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'Completed':
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
      case 'Rejected':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECDD3' };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Prescriptions"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Prescription Management</Text>
            <Text style={styles.headerSubtitle}>{prescriptions.length} Total Orders</Text>
          </View>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Patient, Doctor, Rx # or Medicine..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === 'All' ? prescriptions.length : prescriptions.filter(p => p.status === tab).length;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                {tab}
              </Text>
              <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Prescription List */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredPrescriptions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={42} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Prescriptions Found</Text>
            <Text style={styles.emptySub}>
              {searchQuery ? `No results matching "${searchQuery}"` : `No orders currently in ${activeTab}`}
            </Text>
          </View>
        ) : (
          filteredPrescriptions.map((rx) => {
            const statusTheme = getStatusColor(rx.status);

            return (
              <View key={rx.id} style={styles.rxCard}>
                {/* Header Row: Rx Number, Date/Time, Status Badge */}
                <View style={styles.cardHeader}>
                  <View>
                    <View style={styles.rxIdRow}>
                      <Text style={styles.rxId}>{rx.rxNumber}</Text>
                      {rx.priority === 'Urgent' && (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentBadgeText}>URGENT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.rxDateTime}>{rx.date} at {rx.time}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: statusTheme.bg, borderColor: statusTheme.border },
                    ]}
                  >
                    <Text style={[styles.statusPillText, { color: statusTheme.text }]}>
                      {rx.status}
                    </Text>
                  </View>
                </View>

                {/* Patient & Doctor Details */}
                <View style={styles.patientInfoBlock}>
                  <View style={styles.patientAvatar}>
                    <Ionicons name="person" size={20} color="#1A66E8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{rx.patientName}</Text>
                    <Text style={styles.patientMeta}>
                      {rx.patientAge} Years • {rx.patientGender} • {rx.patientPhone}
                    </Text>
                    <Text style={styles.doctorInfo}>
                      <Ionicons name="medkit-outline" size={13} color="#64748B" /> Dr. {rx.doctorName} ({rx.doctorHospital})
                    </Text>
                  </View>
                </View>

                {/* Medicine Items Breakdown */}
                <View style={styles.medicineListBlock}>
                  <Text style={styles.medicineListTitle}>Prescribed Items ({rx.medicines.length}):</Text>
                  {rx.medicines.map((med, idx) => (
                    <View key={idx} style={styles.medItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.medItemName}>{med.name}</Text>
                        <Text style={styles.medItemDosage}>
                          {med.dosage} • {med.frequency} • {med.duration}
                        </Text>
                      </View>
                      <View style={styles.medItemRight}>
                        <View style={styles.inStockTag}>
                          <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                          <Text style={styles.inStockText}>In Stock ({med.availableStock})</Text>
                        </View>
                        <Text style={styles.medQtyText}>Qty: {med.quantity}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Total & Quick Communication note */}
                <View style={styles.orderFooterRow}>
                  <View>
                    <Text style={styles.totalLabel}>Total Bill Amount</Text>
                    <Text style={styles.totalValue}>₹{rx.totalAmount.toFixed(2)}</Text>
                  </View>

                  <View style={styles.photoActionRow}>
                    <TouchableOpacity
                      style={styles.photoBtn}
                      onPress={() => setShowPhotoModal(rx)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="image-outline" size={16} color="#1A66E8" />
                      <Text style={styles.photoBtnText}>View Rx Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smsBtn}
                      onPress={() => {
                        setSmsModalRx(rx);
                        setSmsText(`Hello ${rx.patientName}, your prescription #${rx.rxNumber} is ready for collection at MediQuick Dispensary.`);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="chatbox-ellipses-outline" size={16} color="#15803D" />
                      <Text style={styles.smsBtnText}>SMS Alert</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Workflow Progress Action Buttons */}
                <View style={styles.workflowActionRow}>
                  {rx.status === 'Pending' && (
                    <TouchableOpacity
                      style={[styles.workflowBtn, { backgroundColor: '#1A66E8' }]}
                      onPress={() => {
                        updatePrescriptionStatus(rx.id, 'Accepted');
                        Alert.alert('Order Accepted', `Prescription #${rx.rxNumber} moved to Accepted.`);
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                      <Text style={styles.workflowBtnText}>Accept Order</Text>
                    </TouchableOpacity>
                  )}

                  {rx.status === 'Accepted' && (
                    <TouchableOpacity
                      style={[styles.workflowBtn, { backgroundColor: '#4F46E5' }]}
                      onPress={() => {
                        updatePrescriptionStatus(rx.id, 'Processing');
                        Alert.alert('Dispensing Started', `Packaging medicines for #${rx.rxNumber}.`);
                      }}
                    >
                      <Ionicons name="cube" size={16} color="#FFFFFF" />
                      <Text style={styles.workflowBtnText}>Start Packaging</Text>
                    </TouchableOpacity>
                  )}

                  {rx.status === 'Processing' && (
                    <TouchableOpacity
                      style={[styles.workflowBtn, { backgroundColor: '#059669' }]}
                      onPress={() => {
                        updatePrescriptionStatus(rx.id, 'Ready');
                        Alert.alert('Ready for Pickup', `Order #${rx.rxNumber} is packed and ready.`);
                      }}
                    >
                      <Ionicons name="bag-check" size={16} color="#FFFFFF" />
                      <Text style={styles.workflowBtnText}>Mark Ready for Pickup</Text>
                    </TouchableOpacity>
                  )}

                  {rx.status === 'Ready' && (
                    <TouchableOpacity
                      style={[styles.workflowBtn, { backgroundColor: '#1E293B' }]}
                      onPress={() => {
                        updatePrescriptionStatus(rx.id, 'Completed');
                        Alert.alert('Dispensed Successfully', `Order #${rx.rxNumber} marked as Completed.`);
                      }}
                    >
                      <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                      <Text style={styles.workflowBtnText}>Complete & Hand Over</Text>
                    </TouchableOpacity>
                  )}

                  {rx.status === 'Completed' && (
                    <View style={styles.completedBanner}>
                      <Ionicons name="checkmark-done-circle" size={18} color="#15803D" />
                      <Text style={styles.completedText}>Prescription Dispensed & Closed</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL: Scanned Digital Prescription Photo Zoom Viewer */}
      {/* ========================================================================= */}
      <Modal
        visible={!!showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(null)}
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalCard}>
            <View style={styles.photoModalHeader}>
              <View>
                <Text style={styles.photoModalTitle}>Digital Prescription</Text>
                <Text style={styles.photoModalSub}>{showPhotoModal?.rxNumber} • {showPhotoModal?.doctorName}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPhotoModal(null)} style={styles.photoCloseBtn}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Render realistic scanned prescription design */}
            <ScrollView style={styles.rxScanPaper} contentContainerStyle={styles.rxScanPaperContent}>
              <View style={styles.rxScanHeader}>
                <Text style={styles.clinicTitle}>{showPhotoModal?.doctorHospital}</Text>
                <Text style={styles.clinicSub}>Government Registered Community Clinic • PHC-104</Text>
                <Text style={styles.doctorLine}>Doctor: {showPhotoModal?.doctorName} (Reg. No. 89201)</Text>
              </View>

              <View style={styles.rxDivider} />

              <View style={styles.rxPatientGrid}>
                <Text style={styles.rxField}><Text style={{ fontWeight: '700' }}>Patient: </Text>{showPhotoModal?.patientName}</Text>
                <Text style={styles.rxField}><Text style={{ fontWeight: '700' }}>Age/Sex: </Text>{showPhotoModal?.patientAge}y / {showPhotoModal?.patientGender}</Text>
                <Text style={styles.rxField}><Text style={{ fontWeight: '700' }}>Date: </Text>{showPhotoModal?.date}</Text>
              </View>

              <View style={styles.rxDivider} />

              <Text style={styles.rxSymbol}>℞</Text>
              {showPhotoModal?.medicines.map((m, i) => (
                <View key={i} style={styles.rxPaperMedRow}>
                  <Text style={styles.rxPaperMedName}>{i + 1}. {m.name} ({m.dosage})</Text>
                  <Text style={styles.rxPaperMedDose}>Schedule: {m.frequency} x {m.duration} (Qty: {m.quantity})</Text>
                  <Text style={styles.rxPaperMedInst}>Inst: {m.instructions}</Text>
                </View>
              ))}

              <View style={styles.rxSealRow}>
                <View style={styles.rxStampBox}>
                  <Text style={styles.rxStampText}>VERIFIED CLINIC STAMP</Text>
                  <Text style={styles.rxStampDate}>{showPhotoModal?.date}</Text>
                </View>
                <View style={styles.rxSignBox}>
                  <Text style={styles.rxSignDoctor}>Dr. Signature</Text>
                  <Text style={styles.rxSignLicence}>MCI Reg: #78219</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: SMS Notification Modal */}
      {/* ========================================================================= */}
      <Modal
        visible={!!smsModalRx}
        transparent
        animationType="slide"
        onRequestClose={() => setSmsModalRx(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSmsModalRx(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Send Patient SMS</Text>
                <Text style={styles.modalSub}>{smsModalRx?.patientName} • {smsModalRx?.patientPhone}</Text>
              </View>
              <TouchableOpacity onPress={() => setSmsModalRx(null)} style={styles.closeBtnSmall}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.smsInputBox}
              multiline
              numberOfLines={3}
              value={smsText}
              onChangeText={setSmsText}
              placeholder="Enter message to send..."
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity style={styles.sendSmsBtn} onPress={handleSendSms} activeOpacity={0.8}>
              <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
              <Text style={styles.sendSmsBtnText}>Dispatch SMS Alert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  headerSubtitle: {
    fontSize: 11,
    color: PRIMARY_BLUE,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: TEXT_DARK,
  },
  tabsScroll: {
    maxHeight: 52,
    marginTop: 10,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#3B82F6',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // Rx Card
  rxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rxIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rxId: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  urgentBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  rxDateTime: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Patient Info
  patientInfoBlock: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  patientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  patientMeta: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  // Medicines Breakdown
  medicineListBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  medicineListTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  medItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  medItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  medItemDosage: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  medItemRight: {
    alignItems: 'flex-end',
  },
  inStockTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  medQtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_DARK,
    marginTop: 2,
  },

  // Order Footer
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  totalLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  photoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  smsBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  // Workflow Button
  workflowActionRow: {
    marginTop: 6,
  },
  workflowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 24,
  },
  workflowBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },

  // Empty Card
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginTop: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  emptySub: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
  },

  // Photo Modal
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  photoModalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  photoModalSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  photoCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#334155',
  },
  rxScanPaper: {
    backgroundColor: '#FFFDF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2D9C8',
  },
  rxScanPaperContent: {
    padding: 18,
  },
  rxScanHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  clinicTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  clinicSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  doctorLine: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  rxDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 10,
  },
  rxPatientGrid: {
    gap: 4,
  },
  rxField: {
    fontSize: 12,
    color: '#334155',
  },
  rxSymbol: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A66E8',
    marginBottom: 6,
  },
  rxPaperMedRow: {
    marginBottom: 10,
  },
  rxPaperMedName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  rxPaperMedDose: {
    fontSize: 11,
    color: '#475569',
    marginTop: 1,
  },
  rxPaperMedInst: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  rxSealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  rxStampBox: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    padding: 6,
    borderRadius: 6,
    transform: [{ rotate: '-4deg' }],
  },
  rxStampText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  rxStampDate: {
    fontSize: 8,
    color: '#2563EB',
    textAlign: 'center',
  },
  rxSignBox: {
    alignItems: 'flex-end',
  },
  rxSignDoctor: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'serif',
    color: '#0F172A',
  },
  rxSignLicence: {
    fontSize: 10,
    color: '#64748B',
  },

  // Modal styling for SMS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  modalSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  closeBtnSmall: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  smsInputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 12,
    fontSize: 14,
    color: TEXT_DARK,
    textAlignVertical: 'top',
    height: 80,
    marginBottom: 14,
  },
  sendSmsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    backgroundColor: '#15803D',
    borderRadius: 12,
  },
  sendSmsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
