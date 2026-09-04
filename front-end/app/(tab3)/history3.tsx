import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { PrescriptionRequest, usePharmacyStore } from '@/lib/pharmacy-store';
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

export default function PrescriptionHistoryScreen() {
  const { openMenu } = useSideMenu();
  const { prescriptions } = usePharmacyStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PrescriptionRequest | null>(null);

  // Past & Active list
  const historyList = useMemo(() => {
    return prescriptions.filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.patientName.toLowerCase().includes(q) ||
        p.rxNumber.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        p.medicines.some(m => m.name.toLowerCase().includes(q))
      );
    });
  }, [prescriptions, searchQuery]);

  const totalRevenue = useMemo(() => {
    return prescriptions.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [prescriptions]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="History"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Prescription History & Logs</Text>
            <Text style={styles.headerSubtitle}>{prescriptions.length} Records Logged</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search past logs by patient, doctor or Rx #..."
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

        {/* Analytics Highlights */}
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <View style={[styles.iconRound, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="cash" size={18} color="#1D4ED8" />
            </View>
            <Text style={styles.analyticsVal}>₹{totalRevenue.toFixed(0)}</Text>
            <Text style={styles.analyticsLabel}>Total Dispensed</Text>
          </View>

          <View style={styles.analyticsCard}>
            <View style={[styles.iconRound, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-done" size={18} color="#15803D" />
            </View>
            <Text style={styles.analyticsVal}>{prescriptions.filter(p => p.status === 'Completed').length}</Text>
            <Text style={styles.analyticsLabel}>Fulfilled Orders</Text>
          </View>

          <View style={styles.analyticsCard}>
            <View style={[styles.iconRound, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="speedometer" size={18} color="#B45309" />
            </View>
            <Text style={styles.analyticsVal}>14m</Text>
            <Text style={styles.analyticsLabel}>Avg Dispense Time</Text>
          </View>
        </View>

        {/* History Feed List */}
        <Text style={styles.feedTitle}>Dispensation Archive</Text>
        {historyList.map((rx) => (
          <View key={rx.id} style={styles.historyCard}>
            <View style={styles.historyCardHeader}>
              <View>
                <Text style={styles.rxNumberText}>{rx.rxNumber}</Text>
                <Text style={styles.rxDateText}>{rx.date} • {rx.time}</Text>
              </View>
              <View style={styles.statusTag}>
                <Text style={styles.statusTagText}>{rx.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.patientRow}>
              <Ionicons name="person-circle-outline" size={32} color="#1A66E8" />
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{rx.patientName}</Text>
                <Text style={styles.patientMeta}>
                  {rx.patientAge}y • {rx.patientGender} • Dr. {rx.doctorName}
                </Text>
              </View>
              <Text style={styles.priceHighlight}>₹{rx.totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.medsSummary}>
              <Text style={styles.medsSummaryText}>
                {rx.medicines.map(m => `${m.name} (x${m.quantity})`).join(', ')}
              </Text>
            </View>

            <View style={styles.cardActionRow}>
              <TouchableOpacity
                style={styles.invoiceBtn}
                onPress={() => setSelectedInvoice(rx)}
                activeOpacity={0.8}
              >
                <Ionicons name="receipt-outline" size={15} color="#1A66E8" />
                <Text style={styles.invoiceBtnText}>View Cash Memo / Invoice</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL: Digital Cash Memo / Tax Invoice */}
      {/* ========================================================================= */}
      <Modal
        visible={!!selectedInvoice}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvoice(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedInvoice(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Pharmacy Cash Memo</Text>
                <Text style={styles.modalSub}>Tax Invoice #{selectedInvoice?.rxNumber}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.invoicePaper}>
                {/* Store Header */}
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceStoreName}>MEDIQUICK RURAL DISPENSARY</Text>
                  <Text style={styles.invoiceStoreSub}>Licence No: 20B/21B-DL-98214 • GSTIN: 27AAAAA0000A1Z5</Text>
                  <Text style={styles.invoiceStoreSub}>Village Health Centre Rd, Sub-District Dispensary</Text>
                </View>

                <View style={styles.invoiceDivider} />

                {/* Patient / Rx info */}
                <View style={styles.invoiceMetaGrid}>
                  <Text style={styles.invField}>
                    <Text style={{ fontWeight: '700' }}>Patient: </Text>
                    {selectedInvoice?.patientName}
                  </Text>
                  <Text style={styles.invField}>
                    <Text style={{ fontWeight: '700' }}>Doctor: </Text>
                    {selectedInvoice?.doctorName}
                  </Text>
                  <Text style={styles.invField}>
                    <Text style={{ fontWeight: '700' }}>Date: </Text>
                    {selectedInvoice?.date} {selectedInvoice?.time}
                  </Text>
                  <Text style={styles.invField}>
                    <Text style={{ fontWeight: '700' }}>Payment: </Text>UPI / Cash Confirmed
                  </Text>
                </View>

                <View style={styles.invoiceDivider} />

                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.colHead, { flex: 2 }]}>Medicine</Text>
                  <Text style={[styles.colHead, { flex: 0.8, textAlign: 'center' }]}>Qty</Text>
                  <Text style={[styles.colHead, { flex: 1, textAlign: 'right' }]}>Rate</Text>
                  <Text style={[styles.colHead, { flex: 1.2, textAlign: 'right' }]}>Amount</Text>
                </View>

                {/* Table Rows */}
                {selectedInvoice?.medicines.map((m, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.colCell, { flex: 2, fontWeight: '700' }]}>{m.name}</Text>
                    <Text style={[styles.colCell, { flex: 0.8, textAlign: 'center' }]}>{m.quantity}</Text>
                    <Text style={[styles.colCell, { flex: 1, textAlign: 'right' }]}>₹{m.pricePerUnit.toFixed(2)}</Text>
                    <Text style={[styles.colCell, { flex: 1.2, textAlign: 'right', fontWeight: '700' }]}>
                      ₹{(m.pricePerUnit * m.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={styles.invoiceDivider} />

                {/* Grand Total */}
                <View style={styles.invoiceTotalRow}>
                  <Text style={styles.invTotalLabel}>GRAND TOTAL (INCL. GST):</Text>
                  <Text style={styles.invTotalVal}>₹{selectedInvoice?.totalAmount.toFixed(2)}</Text>
                </View>

                <Text style={styles.invoiceFooterDisclaimer}>
                  Computer-generated digital memo under Drugs & Cosmetics Act 1940. Medicines sold are non-refundable.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.printBtn}
                onPress={() => {
                  Alert.alert('Invoice Printed', `Cash memo for ${selectedInvoice?.rxNumber} sent to Bluetooth thermal printer.`);
                  setSelectedInvoice(null);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="print" size={18} color="#FFFFFF" />
                <Text style={styles.printBtnText}>Print Thermal Receipt</Text>
              </TouchableOpacity>
            </ScrollView>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: TEXT_DARK,
  },

  // Analytics Grid
  analyticsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  iconRound: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  analyticsVal: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  analyticsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginTop: 2,
    textAlign: 'center',
  },

  feedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    marginTop: 6,
  },

  // History Card
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rxNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  rxDateText: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  statusTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  patientMeta: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 1,
  },
  priceHighlight: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  medsSummary: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
  },
  medsSummaryText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  cardActionRow: {
    marginTop: 2,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  invoiceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },

  // Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  modalSub: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },

  // Invoice Paper
  invoicePaper: {
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    padding: 16,
    marginBottom: 16,
  },
  invoiceHeader: {
    alignItems: 'center',
  },
  invoiceStoreName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.5,
  },
  invoiceStoreSub: {
    fontSize: 10,
    color: '#78716C',
    marginTop: 2,
    textAlign: 'center',
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: '#D6D3D1',
    marginVertical: 10,
    borderStyle: 'dashed',
  },
  invoiceMetaGrid: {
    gap: 4,
  },
  invField: {
    fontSize: 12,
    color: '#292524',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#D6D3D1',
    marginBottom: 6,
  },
  colHead: {
    fontSize: 11,
    fontWeight: '800',
    color: '#44403C',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  colCell: {
    fontSize: 12,
    color: '#292524',
  },
  invoiceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  invTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1917',
  },
  invTotalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  invoiceFooterDisclaimer: {
    fontSize: 10,
    color: '#78716C',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    marginBottom: 10,
  },
  printBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
