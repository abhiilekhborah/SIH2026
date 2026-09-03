import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MQ } from '@/constants/theme';

const { width } = Dimensions.get('window');

function PharmacyCategory({ icon, title, color }: { icon: any; title: string; color: string }) {
  return (
    <TouchableOpacity style={styles.categoryCard} activeOpacity={0.75}>
      <View style={[styles.categoryIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.categoryTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function PharmacyAlertCard({ pharmacyName, message, time, isAvailable }: { pharmacyName: string; message: string; time: string; isAvailable: boolean }) {
  return (
    <TouchableOpacity style={styles.alertCard} activeOpacity={0.8}>
      <View style={[styles.alertIconWrap, { backgroundColor: isAvailable ? MQ.greenLight : MQ.redLight }]}>
        <Ionicons name={isAvailable ? 'checkmark-circle' : 'close-circle'} size={24} color={isAvailable ? MQ.green : MQ.red} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.alertHeaderRow}>
          <Text style={styles.alertPharmacyName}>{pharmacyName}</Text>
          <Text style={styles.alertTime}>{time}</Text>
        </View>
        <Text style={styles.alertMessage}>{message}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PharmacyCard({ name, distance, status, rating }: { name: string; distance: string; status: string; rating: string }) {
  return (
    <TouchableOpacity style={styles.pharmacyCard} activeOpacity={0.8}>
      <View style={styles.pharmacyImagePlaceholder}>
        <Ionicons name="storefront" size={32} color={MQ.tealMid} />
      </View>
      <View style={styles.pharmacyInfo}>
        <Text style={styles.pharmacyName} numberOfLines={1}>{name}</Text>
        <View style={styles.pharmacyMetaRow}>
          <Text style={styles.pharmacyDistance}>{distance}</Text>
          <View style={styles.dotSeparator} />
          <Ionicons name="star" size={12} color={MQ.amber} />
          <Text style={styles.pharmacyRatingText}>{rating}</Text>
        </View>
        <Text style={[styles.pharmacyStatus, { color: status === 'Open' ? MQ.green : MQ.red }]}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function PharmacyScreen() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();
  type RequestedMed = { id: string, name: string, quantity: number };
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [medicineText, setMedicineText] = useState('');
  const [requestedMedicines, setRequestedMedicines] = useState<RequestedMed[]>([]);

  const handleAddMedicine = () => {
    if (medicineText.trim().length === 0) return;
    setRequestedMedicines(prev => [...prev, { id: Math.random().toString(), name: medicineText.trim(), quantity: 1 }]);
    setMedicineText('');
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setRequestedMedicines(prev => prev.map(m => {
      if (m.id === id) {
        const newQ = m.quantity + delta;
        return { ...m, quantity: newQ > 0 ? newQ : 1 };
      }
      return m;
    }));
  };

  const handleRemoveMedicine = (id: string) => {
    setRequestedMedicines(prev => prev.filter(m => m.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Light gradient backdrop */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="Pharmacy Services"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        style={styles.header}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Assigned Pharmacy Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Pharmacy</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>View all</Text></TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Apollo 24|7 Pharmacy</Text>
            <Text style={styles.heroSub}>1.2 km away • 4.8★ Rating{'\n'}Open • Closes at 11:00 PM</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.requestBtn} onPress={() => setShowRequestModal(true)}>
                <Text style={styles.requestBtnText}>Request Medicine</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.orderBtn} onPress={() => setShowOrderModal(true)}>
                <Text style={styles.orderBtnText}>Order Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroIconWrap}>
            <Ionicons name="storefront" size={44} color={MQ.teal} />
          </View>
        </View>

        {/* Pharmacy Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alerts & Messages</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>View all</Text></TouchableOpacity>
        </View>
        
        <PharmacyAlertCard 
          pharmacyName="Apollo 24|7 Pharmacy"
          message="Your requested medicines (Paracetamol, Dolo 650) are available. Ready for pickup/delivery."
          time="10 mins ago"
          isAvailable={true}
        />
        <PharmacyAlertCard 
          pharmacyName="MedPlus Pharmacy"
          message="Sorry, we are out of stock for 'Azithromycin 500mg'."
          time="1 hr ago"
          isAvailable={false}
        />

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
        </View>
        <View style={styles.categoryGrid}>
          <PharmacyCategory icon="fitness" title="Vitamins & Nutrition" color={MQ.amber} />
          <PharmacyCategory icon="bandage" title="First Aid" color={MQ.red} />
          <PharmacyCategory icon="thermometer" title="Devices" color={MQ.blue} />
          <PharmacyCategory icon="leaf" title="Ayurveda" color={MQ.green} />
        </View>

        {/* Nearby Pharmacies */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pharmacyScroll}>
          <PharmacyCard name="Apollo 24|7 Pharmacy" distance="1.2 km" status="Open" rating="4.8" />
          <PharmacyCard name="Wellness Forever" distance="2.5 km" status="Open" rating="4.6" />
          <PharmacyCard name="MedPlus Pharmacy" distance="3.0 km" status="Closed" rating="4.4" />
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Request Medicine Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowRequestModal(false)}>
              <Ionicons name="close" size={24} color={MQ.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>You can order basic medicines without prescription</Text>
            
            <View style={styles.inputRow}>
              <TextInput
                style={styles.modalInputLine}
                placeholder="Type the medicine name..."
                placeholderTextColor={MQ.textMuted}
                value={medicineText}
                onChangeText={setMedicineText}
                onSubmitEditing={handleAddMedicine}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addMedBtn} onPress={handleAddMedicine}>
                <Ionicons name="return-down-back" size={20} color={MQ.bgWhite} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.medList} showsVerticalScrollIndicator={false}>
              {requestedMedicines.map(med => (
                <View key={med.id} style={styles.medListItem}>
                  <Text style={styles.medListItemName}>{med.name}</Text>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(med.id, -1)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={16} color={MQ.teal} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{med.quantity}</Text>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(med.id, 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={16} color={MQ.teal} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveMedicine(med.id)} style={styles.removeMedBtn}>
                    <Ionicons name="trash-outline" size={18} color={MQ.red} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSendBtn} onPress={() => { setShowRequestModal(false); setRequestedMedicines([]); setMedicineText(''); }}>
                <Text style={styles.modalSendText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Medicine Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOrderModal(false)}>
          <TouchableOpacity style={styles.modalBox} activeOpacity={1}>
            <TouchableOpacity style={styles.sendPrescriptionBtn} activeOpacity={0.8}>
              <Ionicons name="document-text-outline" size={24} color={MQ.teal} />
              <Text style={styles.sendPrescriptionText}>SEND PRESCRIPTION</Text>
            </TouchableOpacity>

            <View style={styles.lastOrderSection}>
              <Text style={styles.lastOrderTitle}>Last Order details</Text>
              <View style={styles.lastOrderCard}>
                <Ionicons name="medkit-outline" size={24} color={MQ.blue} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.lastOrderName}>PARACETAMOL</Text>
                  <Text style={styles.lastOrderSub}>Ordered on 12 Aug</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: MQ.bgLight },
  bgLight:   { ...StyleSheet.absoluteFillObject, backgroundColor: MQ.bgLight },
  bgTealTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: MQ.tealWash, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  header:    { backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  heroCard: { flexDirection: 'row', backgroundColor: MQ.glassBg, borderRadius: 24, borderWidth: 1, borderColor: MQ.tealBorder, padding: 24, marginBottom: 20, alignItems: 'center' },
  heroTextContainer: { flex: 1, paddingRight: 10 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: MQ.textPrimary, marginBottom: 8, lineHeight: 26 },
  heroSub: { fontSize: 13, color: MQ.textSecondary, marginBottom: 16, lineHeight: 18 },
  buttonRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  requestBtn: { backgroundColor: MQ.tealLight, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: MQ.tealBorder, marginBottom: 8 },
  requestBtnText: { color: MQ.teal, fontWeight: '700', fontSize: 12 },
  orderBtn: { backgroundColor: MQ.teal, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginBottom: 8 },
  orderBtnText: { color: MQ.bgWhite, fontWeight: '700', fontSize: 12 },
  heroIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: MQ.tealLight, alignItems: 'center', justifyContent: 'center' },

  alertCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: MQ.bgWhite, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: MQ.tealBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  alertIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  alertPharmacyName: { fontSize: 14, fontWeight: '700', color: MQ.textPrimary },
  alertTime: { fontSize: 11, color: MQ.textSecondary, fontWeight: '600' },
  alertMessage: { fontSize: 13, color: MQ.textSecondary, lineHeight: 18 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: MQ.textPrimary, letterSpacing: 0.2 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: MQ.teal },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  categoryCard: { width: (width - 44) / 2, backgroundColor: MQ.glassBg, borderRadius: 18, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: MQ.tealBorder },
  categoryIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  categoryTitle: { fontSize: 13, fontWeight: '600', color: MQ.textPrimary, textAlign: 'center' },

  pharmacyScroll: { paddingBottom: 10, paddingLeft: 4 },
  pharmacyCard: { width: 160, backgroundColor: MQ.bgWhite, borderRadius: 16, borderWidth: 1, borderColor: MQ.tealBorder, padding: 12, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  pharmacyImagePlaceholder: { width: '100%', height: 100, backgroundColor: MQ.tealLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  pharmacyInfo: { flex: 1 },
  pharmacyName: { fontSize: 14, fontWeight: '700', color: MQ.textPrimary, marginBottom: 4 },
  pharmacyMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  pharmacyDistance: { fontSize: 11, color: MQ.textSecondary },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: MQ.textMuted, marginHorizontal: 6 },
  pharmacyRatingText: { fontSize: 11, fontWeight: '600', color: MQ.textSecondary, marginLeft: 4 },
  pharmacyStatus: { fontSize: 12, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', backgroundColor: MQ.bgWhite, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  modalTitle: { fontSize: 15, fontWeight: '600', color: MQ.textPrimary, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10, marginTop: 10 },
  modalInputLine: { flex: 1, backgroundColor: MQ.bgLight, borderWidth: 1, borderColor: MQ.tealBorder, borderRadius: 16, height: 48, paddingHorizontal: 16, fontSize: 14, color: MQ.textPrimary },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  addMedBtn: { width: 48, height: 48, backgroundColor: MQ.teal, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  medList: { maxHeight: 180, marginBottom: 16 },
  medListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: MQ.bgWhite, borderWidth: 1, borderColor: MQ.tealBorder, borderRadius: 12, padding: 12, marginBottom: 8 },
  medListItemName: { flex: 1, fontSize: 14, fontWeight: '600', color: MQ.textPrimary },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: MQ.bgLight, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4, marginRight: 12 },
  qtyBtn: { padding: 4 },
  qtyText: { fontSize: 13, fontWeight: '700', color: MQ.textPrimary, marginHorizontal: 8, minWidth: 16, textAlign: 'center' },
  removeMedBtn: { padding: 4 },
  modalCloseBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalSendBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: MQ.teal, alignItems: 'center' },
  modalSendText: { fontSize: 15, fontWeight: '700', color: MQ.bgWhite },

  sendPrescriptionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: MQ.bgLight, borderRadius: 16, borderWidth: 1, borderColor: MQ.tealBorder, paddingVertical: 24, marginBottom: 24, gap: 10 },
  sendPrescriptionText: { fontSize: 15, fontWeight: '700', color: MQ.teal, letterSpacing: 0.5 },
  lastOrderSection: { marginTop: 8 },
  lastOrderTitle: { fontSize: 13, fontWeight: '700', color: MQ.textSecondary, marginBottom: 12 },
  lastOrderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: MQ.bgWhite, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  lastOrderName: { fontSize: 15, fontWeight: '800', color: MQ.textPrimary, marginBottom: 2 },
  lastOrderSub: { fontSize: 12, color: MQ.textMuted },
});
