import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import {
  AvailabilityStatus,
  CustomerAvailabilityRequest,
  InventoryItem,
  PrescriptionRequest,
  PrescriptionStatus,
  usePharmacyStore,
} from '@/lib/pharmacy-store';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 340);

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

export default function PharmacistHomeScreen() {
  const router = useRouter();
  const { openMenu } = useSideMenu();
  const {
    prescriptions,
    inventory,
    availabilityRequests,
    alerts,
    updatePrescriptionStatus,
    updateStock,
    respondToAvailabilityRequest,
    sendQuickResponse,
  } = usePharmacyStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Modal States
  const [selectedRx, setSelectedRx] = useState<PrescriptionRequest | null>(null);
  const [quickReplyRx, setQuickReplyRx] = useState<PrescriptionRequest | null>(null);
  const [quickReplyText, setQuickReplyText] = useState('Prescription verified. All medicines in stock. Packaged in 15 mins.');
  const [stockModalItem, setStockModalItem] = useState<InventoryItem | null>(null);
  const [stockAddAmount, setStockAddAmount] = useState('50');
  const [customReplyRequest, setCustomReplyRequest] = useState<CustomerAvailabilityRequest | null>(null);
  const [customReplyText, setCustomReplyText] = useState('');

  // Filtered Data based on Search
  const filteredPrescriptions = useMemo(() => {
    if (!searchQuery.trim()) return prescriptions;
    const q = searchQuery.toLowerCase();
    return prescriptions.filter(
      p =>
        p.patientName.toLowerCase().includes(q) ||
        p.rxNumber.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        p.medicines.some(m => m.name.toLowerCase().includes(q))
    );
  }, [prescriptions, searchQuery]);

  const filteredInventoryAlerts = useMemo(() => {
    const lowOrExpiring = inventory.filter(
      i => i.status === 'Low Stock' || i.status === 'Expiring Soon' || i.status === 'Out of Stock'
    );
    if (!searchQuery.trim()) return lowOrExpiring;
    const q = searchQuery.toLowerCase();
    return lowOrExpiring.filter(
      i => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }, [inventory, searchQuery]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return availabilityRequests;
    const q = searchQuery.toLowerCase();
    return availabilityRequests.filter(
      r =>
        r.customerName.toLowerCase().includes(q) ||
        r.medicineName.toLowerCase().includes(q) ||
        r.requestId.toLowerCase().includes(q)
    );
  }, [availabilityRequests, searchQuery]);

  // Alert single-card crossfade + manual swipe
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const alertFade = useRef(new Animated.Value(1)).current;
  const isFading = useRef(false);

  const goToAlert = useCallback((nextIndex: number) => {
    if (isFading.current) return;
    isFading.current = true;
    Animated.timing(alertFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setActiveAlertIndex(nextIndex);
      Animated.timing(alertFade, { toValue: 1, duration: 200, useNativeDriver: true }).start(() => {
        isFading.current = false;
      });
    });
  }, [alertFade]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40) {
          setActiveAlertIndex(prev => { goToAlert((prev + 1) % alerts.length); return prev; });
        } else if (g.dx > 40) {
          setActiveAlertIndex(prev => { goToAlert((prev - 1 + alerts.length) % alerts.length); return prev; });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAlertIndex(prev => { goToAlert((prev + 1) % alerts.length); return prev; });
    }, 4000);
    return () => clearInterval(interval);
  }, [alerts.length, goToAlert]);

  // Handle Quick SBRT Send
  const handleSendQuickReply = () => {
    if (!quickReplyRx) return;
    sendQuickResponse(quickReplyRx.id, quickReplyText);
    Alert.alert('Message Sent', `SMS sent to patient ${quickReplyRx.patientName}: "${quickReplyText}"`);
    setQuickReplyRx(null);
  };

  // Handle Stock Update
  const handleSaveStock = () => {
    if (!stockModalItem) return;
    const qty = parseInt(stockAddAmount, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid stock increment number.');
      return;
    }
    updateStock(stockModalItem.id, qty, false, 'Manual restock via dashboard');
    Alert.alert('Stock Updated', `Added ${qty} units to ${stockModalItem.name}. New total: ${stockModalItem.currentStock + qty}`);
    setStockModalItem(null);
    setStockAddAmount('50');
  };

  // Handle Custom Reply to Customer Request
  const handleSendCustomAvailabilityReply = () => {
    if (!customReplyRequest) return;
    respondToAvailabilityRequest(customReplyRequest.id, 'Available', customReplyText || 'In stock. Available for pickup.');
    Alert.alert('Response Delivered', `Updated customer ${customReplyRequest.customerName}`);
    setCustomReplyRequest(null);
    setCustomReplyText('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Header with Hamburger, MediQuick Logo, Notification Bell */}
      <AppHeader
        title="MediQuick"
        showMenu
        showNotification
        onPressMenu={openMenu}
        onPressNotification={() => setShowNotifications(true)}
        badgeCount={alerts.length}
        hasUnreadNotifications={alerts.length > 0}
        centerElement={
          <View style={styles.headerCenter}>
            <View style={styles.headerLogoBadge}>
              <Ionicons name="medkit" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>MediQuick</Text>
              <Text style={styles.headerSubtitle}>Rural Pharmacy Portal</Text>
            </View>
          </View>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Urgent Dispensary Alerts — single fixed card, content changes via crossfade & swipe */}
        {alerts.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.titleWithIcon}>
                <Ionicons name="notifications" size={18} color="#E11D48" />
                <Text style={styles.sectionTitle}>Urgent Dispensary Alerts</Text>
              </View>
              <Text style={styles.alertCountBadge}>{alerts.length} Active</Text>
            </View>

            {(() => {
              const alert = alerts[activeAlertIndex];
              const isDanger = alert.type === 'danger';
              const isWarning = alert.type === 'warning';
              const isSuccess = alert.type === 'success';
              const accentColor = isDanger ? '#E11D48' : isWarning ? '#D97706' : isSuccess ? '#059669' : '#1D4ED8';

              return (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[styles.alertCard, { opacity: alertFade }]}
                >
                  <View style={styles.alertHeader}>
                    <View style={styles.alertIconTag}>
                      <Ionicons
                        name={isDanger ? 'alert-circle' : isWarning ? 'warning' : isSuccess ? 'thermometer' : 'information-circle'}
                        size={18}
                        color={accentColor}
                      />
                      <Text style={[styles.alertTagText, { color: accentColor }]}>
                        {alert.time}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.alertTitle} numberOfLines={1}>
                    {alert.title}
                  </Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {alert.message}
                  </Text>

                  {alert.actionText && (
                    <TouchableOpacity
                      style={styles.alertActionBtn}
                      onPress={() => {
                        if (alert.category === 'stock' || alert.category === 'expiry') {
                          const found = inventory.find(i => i.id === alert.relatedId);
                          if (found) setStockModalItem(found);
                          else router.navigate('/(tab3)/inventory');
                        } else if (alert.category === 'rx') {
                          router.navigate('/(tab3)/prescription');
                        } else {
                          Alert.alert(alert.title, alert.message);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.alertActionText}>{alert.actionText}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#1A66E8" />
                    </TouchableOpacity>
                  )}
                </Animated.View>
              );
            })()}

            {alerts.length > 1 && (
              <View style={styles.paginationDots}>
                {alerts.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => goToAlert(idx)}
                    style={[styles.paginationDot, idx === activeAlertIndex && styles.paginationDotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* 3. Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, prescriptions, or customers..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* 4. Prescription Requests Section (Wireframe: "prescription request - Basic details - Quick SBRT - Open prescription") */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="receipt-outline" size={20} color={PRIMARY_BLUE} />
              <Text style={styles.sectionTitle}>Prescription Requests</Text>
            </View>
            <TouchableOpacity onPress={() => router.navigate('/(tab3)/prescription')}>
              <Text style={styles.viewAllText}>View All ({prescriptions.length})</Text>
            </TouchableOpacity>
          </View>

          {filteredPrescriptions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle-outline" size={36} color="#94A3B8" />
              <Text style={styles.emptyText}>No matching prescription requests</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + 14}
            >
              {filteredPrescriptions.map((rx) => {
                const isPending = rx.status === 'Pending';
                const isAccepted = rx.status === 'Accepted';
                const isProcessing = rx.status === 'Processing';
                const isReady = rx.status === 'Ready';

                return (
                  <View key={rx.id} style={styles.rxCard}>
                    {/* Top row: Rx code & Priority badge */}
                    <View style={styles.rxCardHeader}>
                      <View style={styles.rxIdRow}>
                        <Text style={styles.rxId}>{rx.rxNumber}</Text>
                        <Text style={styles.rxTime}>{rx.time}</Text>
                      </View>
                      <View style={styles.rxBadgesRow}>
                        {rx.priority === 'Urgent' && (
                          <View style={styles.urgentBadge}>
                            <Text style={styles.urgentBadgeText}>URGENT</Text>
                          </View>
                        )}
                        <View
                          style={[
                            styles.statusPill,
                            isPending && styles.statusPending,
                            isAccepted && styles.statusAccepted,
                            isProcessing && styles.statusProcessing,
                            isReady && styles.statusReady,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              isPending && styles.textPending,
                              isAccepted && styles.textAccepted,
                              isProcessing && styles.textProcessing,
                              isReady && styles.textReady,
                            ]}
                          >
                            {rx.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Patient info */}
                    <View style={styles.rxPatientInfo}>
                      <Text style={styles.rxPatientName} numberOfLines={1}>
                        {rx.patientName}
                      </Text>
                      <Text style={styles.rxPatientMeta}>
                        {rx.patientAge}y • {rx.patientGender} • {rx.doctorHospital}
                      </Text>
                      <Text style={styles.rxDoctorName}>Dr: {rx.doctorName}</Text>
                    </View>

                    {/* Prescribed Items summary */}
                    <View style={styles.rxMedicinesList}>
                      {rx.medicines.slice(0, 2).map((m, idx) => (
                        <View key={idx} style={styles.rxMedRow}>
                          <Ionicons name="medical" size={12} color="#1A66E8" />
                          <Text style={styles.rxMedName} numberOfLines={1}>
                            {m.name} ({m.dosage})
                          </Text>
                          <Text style={styles.rxMedQty}>x{m.quantity}</Text>
                        </View>
                      ))}
                      {rx.medicines.length > 2 && (
                        <Text style={styles.rxMoreMeds}>+{rx.medicines.length - 2} more item(s)</Text>
                      )}
                    </View>

                    {rx.quickReplySent && (
                      <View style={styles.replyPreviewBlock}>
                        <Ionicons name="chatbox-ellipses-outline" size={13} color="#059669" />
                        <Text style={styles.replyPreviewText} numberOfLines={1}>
                          SMS Sent: {rx.quickReplySent}
                        </Text>
                      </View>
                    )}

                    {/* Action buttons: "Quick Text" (oval) and "Open prescription" (oval) */}
                    <View style={styles.rxCardActions}>
                      <TouchableOpacity
                        style={styles.btnQuickText}
                        onPress={() => {
                          setQuickReplyRx(rx);
                          setQuickReplyText(
                            `Hello ${rx.patientName}, your prescription #${rx.rxNumber} is verified. Current Stock is available. Pickup ready in 15 mins.`
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="chatbubble-ellipses" size={15} color="#1A66E8" />
                        <Text style={styles.btnQuickTextText}>Quick Text</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnOpenRx}
                        onPress={() => setSelectedRx(rx)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnOpenRxText}>Open Prescription</Text>
                        <Ionicons name="eye" size={15} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* 5. Inventory Alerts Section */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="alert-circle-outline" size={20} color="#D97706" />
              <Text style={styles.sectionTitle}>Inventory Stock Alerts</Text>
            </View>
            <TouchableOpacity onPress={() => router.navigate('/(tab3)/inventory')}>
              <Text style={styles.viewAllText}>Manage Inventory</Text>
            </TouchableOpacity>
          </View>

          {filteredInventoryAlerts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="cube-outline" size={36} color="#94A3B8" />
              <Text style={styles.emptyText}>All stock levels are optimal</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + 14}
            >
              {filteredInventoryAlerts.map((item) => {
                const isOut = item.status === 'Out of Stock';
                const isExpiring = item.status === 'Expiring Soon';

                return (
                  <View key={item.id} style={styles.invAlertCard}>
                    <View style={styles.invAlertHeader}>
                      <View
                        style={[
                          styles.invStatusPill,
                          isOut ? styles.invStatusOut : isExpiring ? styles.invStatusExpiring : styles.invStatusLow,
                        ]}
                      >
                        <Text
                          style={[
                            styles.invStatusText,
                            isOut ? styles.invTextOut : isExpiring ? styles.invTextExpiring : styles.invTextLow,
                          ]}
                        >
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.invRackTag}>{item.rackLocation}</Text>
                    </View>

                    <Text style={styles.invMedTitle} numberOfLines={2}>
                      {item.name}
                    </Text>

                    <View style={styles.invAlertDetails}>
                      <View style={styles.stockCountRow}>
                        <Text style={styles.stockCountNumber}>{item.currentStock}</Text>
                        <Text style={styles.stockCountLabel}>units remaining</Text>
                      </View>
                      <Text style={styles.invSubAlert}>
                        {isOut
                          ? '⚠️ Critical: zero stock remaining'
                          : isExpiring
                          ? `⏳ Expires on ${item.expiryDate}`
                          : '⚡ Need immediate stockup • High demand'}
                      </Text>
                    </View>

                    {/* Action buttons: "View Stocks" and "Update Stocks" navigating to inventory */}
                    <View style={styles.invAlertActions}>
                      <TouchableOpacity
                        style={styles.btnViewStocks}
                        onPress={() => router.navigate('/(tab3)/inventory')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnViewStocksText}>View Stocks</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.btnUpdateStocks}
                        onPress={() => router.navigate('/(tab3)/inventory')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="cube" size={15} color="#FFFFFF" />
                        <Text style={styles.btnUpdateStocksText}>Update Stocks</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* 6. Customer Medicine Availability Requests (Wireframe Screen 2) */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="chatbubbles-outline" size={20} color={PRIMARY_BLUE} />
              <Text style={styles.sectionTitle}>Customer Medicine Inquiries</Text>
            </View>
            <Text style={styles.inquiryCountBadge}>
              {availabilityRequests.filter(r => r.status === 'Pending').length} Open
            </Text>
          </View>

          {filteredRequests.map((req) => {
            const isAvailable = req.status === 'Available';
            const isNotAvailable = req.status === 'Not Available';
            const isPending = req.status === 'Pending';

            return (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestCardHeader}>
                  <View>
                    <Text style={styles.reqCustomerName}>{req.customerName}</Text>
                    <Text style={styles.reqDistance}>{req.timestamp}</Text>
                  </View>
                  <View
                    style={[
                      styles.reqStatusTag,
                      isAvailable && styles.reqTagAvailable,
                      isNotAvailable && styles.reqTagNotAvailable,
                      isPending && styles.reqTagPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reqStatusTagText,
                        isAvailable && styles.reqTextAvailable,
                        isNotAvailable && styles.reqTextNotAvailable,
                        isPending && styles.reqTextPending,
                      ]}
                    >
                      {req.status}
                    </Text>
                  </View>
                </View>

                {/* Medicine Requested Info */}
                <View style={styles.reqMedicineBox}>
                  <View style={styles.reqMedMain}>
                    <Ionicons name="bandage-outline" size={18} color="#1A66E8" />
                    <Text style={styles.reqMedName}>{req.medicineName}</Text>
                  </View>
                  <Text style={styles.reqMedQty}>Qty Requested: {req.requestedQuantity}</Text>
                </View>

                {/* Current Stock Match Banner */}
                <View style={styles.reqStockNotice}>
                  <Ionicons
                    name={req.currentStock > 0 ? 'checkmark-circle' : 'close-circle'}
                    size={15}
                    color={req.currentStock > 0 ? '#15803D' : '#DC2626'}
                  />
                  <Text style={styles.reqStockNoticeText}>
                    Dispensary Stock: <Text style={styles.reqStockBold}>{req.currentStock} units</Text> on Shelf
                  </Text>
                </View>

                {req.pharmacistNote && (
                  <Text style={styles.reqPharmacistNote}>
                    <Text style={{ fontWeight: '700' }}>Note: </Text>
                    {req.pharmacistNote}
                  </Text>
                )}

                {/* Response Action Buttons */}
                <View style={styles.reqActionRow}>
                  <TouchableOpacity
                    style={[styles.reqBtn, styles.reqBtnAvailable, isAvailable && styles.reqBtnActive]}
                    onPress={() => respondToAvailabilityRequest(req.id, 'Available', 'Medicine is in stock. You can pick it up today.')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark" size={14} color="#15803D" />
                    <Text style={styles.reqBtnAvailableText}>Available</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.reqBtn, styles.reqBtnNotAvailable, isNotAvailable && styles.reqBtnActive]}
                    onPress={() => respondToAvailabilityRequest(req.id, 'Not Available', 'Currently out of stock. Expected in next delivery.')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close" size={14} color="#DC2626" />
                    <Text style={styles.reqBtnNotAvailableText}>Out of Stock</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.reqBtn, styles.reqBtnCustom]}
                    onPress={() => {
                      setCustomReplyRequest(req);
                      setCustomReplyText(`Current Stock: ${req.currentStock}. Reserved for you.`);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={14} color="#1A66E8" />
                    <Text style={styles.reqBtnCustomText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: Quick Text / SMS Response Popup */}
      {/* ========================================================================= */}
      <Modal
        visible={!!quickReplyRx}
        transparent
        animationType="slide"
        onRequestClose={() => setQuickReplyRx(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setQuickReplyRx(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Quick Text Response</Text>
                <Text style={styles.modalSub}>Patient: {quickReplyRx?.patientName}</Text>
              </View>
              <TouchableOpacity onPress={() => setQuickReplyRx(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Current Stock Banner as drawn in wireframe: "Current Stock: 444" */}
            <View style={styles.currentStockBanner}>
              <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
              <View>
                <Text style={styles.currentStockText}>
                  Current Stock Available: <Text style={styles.currentStockBold}>444 Units</Text>
                </Text>
                <Text style={styles.currentStockSub}>Verified across Shelf Rack A-1 & Cold Storage</Text>
              </View>
            </View>

            {/* Quick Template Chips */}
            <Text style={styles.modalFieldLabel}>Quick Response Templates:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              <TouchableOpacity
                style={styles.templateChip}
                onPress={() =>
                  setQuickReplyText('Prescription verified. Ready for pickup in 15 mins.')
                }
              >
                <Text style={styles.templateChipText}>Ready in 15 mins</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.templateChip}
                onPress={() =>
                  setQuickReplyText('All items available. Generic substitute Dolo 650 is in stock.')
                }
              >
                <Text style={styles.templateChipText}>Substitutes OK</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.templateChip}
                onPress={() =>
                  setQuickReplyText('Cold chain medicine packaged in insulated cold pouch.')
                }
              >
                <Text style={styles.templateChipText}>Cold Pouch Packaged</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Text Box as shown in wireframe */}
            <Text style={styles.modalFieldLabel}>Message to Patient (Text Box):</Text>
            <TextInput
              style={styles.modalTextBox}
              multiline
              numberOfLines={4}
              value={quickReplyText}
              onChangeText={setQuickReplyText}
              placeholder="Type message to patient..."
              placeholderTextColor="#94A3B8"
            />

            {/* Send Button as shown in wireframe */}
            <TouchableOpacity style={styles.modalSendBtn} onPress={handleSendQuickReply} activeOpacity={0.8}>
              <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
              <Text style={styles.modalSendBtnText}>Send to Patient</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: Full Prescription Details Modal (Drawn in Wireframe) */}
      {/* ========================================================================= */}
      <Modal
        visible={!!selectedRx}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRx(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedRx(null)} />
          <View style={[styles.modalCard, styles.rxDetailsModalCard]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Prescription Details</Text>
                <Text style={styles.modalSub}>{selectedRx?.rxNumber} • {selectedRx?.date} {selectedRx?.time}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedRx(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.rxDetailsScroll}>
              {/* Patient & Doctor Card */}
              <View style={styles.rxDetailHeaderCard}>
                <View style={styles.rxDetailRow}>
                  <Text style={styles.rxDetailLabel}>Patient Name:</Text>
                  <Text style={styles.rxDetailValue}>{selectedRx?.patientName}</Text>
                </View>
                <View style={styles.rxDetailRow}>
                  <Text style={styles.rxDetailLabel}>Age / Gender:</Text>
                  <Text style={styles.rxDetailValue}>{selectedRx?.patientAge} Yrs • {selectedRx?.patientGender}</Text>
                </View>
                <View style={styles.rxDetailRow}>
                  <Text style={styles.rxDetailLabel}>Doctor:</Text>
                  <Text style={styles.rxDetailValue}>{selectedRx?.doctorName}</Text>
                </View>
                <View style={styles.rxDetailRow}>
                  <Text style={styles.rxDetailLabel}>Hospital / Clinic:</Text>
                  <Text style={styles.rxDetailValue}>{selectedRx?.doctorHospital}</Text>
                </View>
                <View style={styles.rxDetailRow}>
                  <Text style={styles.rxDetailLabel}>Phone:</Text>
                  <Text style={styles.rxDetailValue}>{selectedRx?.patientPhone}</Text>
                </View>
              </View>

              {/* Prescribed Medicines Itemized List */}
              <Text style={styles.rxSectionSubHeader}>Prescribed Medicines ({selectedRx?.medicines.length}):</Text>
              {selectedRx?.medicines.map((med, idx) => (
                <View key={idx} style={styles.rxItemCard}>
                  <View style={styles.rxItemTop}>
                    <Text style={styles.rxItemName}>{med.name}</Text>
                    <View style={styles.rxStockPill}>
                      <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                      <Text style={styles.rxStockPillText}>In Stock ({med.availableStock})</Text>
                    </View>
                  </View>
                  <Text style={styles.rxItemDosage}>Dosage: {med.dosage} • Frequency: {med.frequency} • {med.duration}</Text>
                  <Text style={styles.rxItemInstruction}>Instructions: {med.instructions}</Text>
                  <View style={styles.rxItemPriceRow}>
                    <Text style={styles.rxItemQty}>Quantity: {med.quantity} units</Text>
                    <Text style={styles.rxItemPrice}>₹{(med.pricePerUnit * med.quantity).toFixed(2)}</Text>
                  </View>
                </View>
              ))}

              {/* Total & Notes */}
              <View style={styles.rxTotalCard}>
                <Text style={styles.rxTotalLabel}>Total Prescription Value:</Text>
                <Text style={styles.rxTotalValue}>₹{selectedRx?.totalAmount.toFixed(2)}</Text>
              </View>

              {/* Status Update Actions */}
              <Text style={styles.rxSectionSubHeader}>Update Dispensing Status:</Text>
              <View style={styles.statusActionGrid}>
                <TouchableOpacity
                  style={[styles.statusBtn, styles.statusBtnAccept]}
                  onPress={() => {
                    if (!selectedRx) return;
                    updatePrescriptionStatus(selectedRx.id, 'Accepted');
                    setSelectedRx({ ...selectedRx, status: 'Accepted' });
                    Alert.alert('Status Updated', 'Prescription marked as Accepted.');
                  }}
                >
                  <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                  <Text style={styles.statusBtnTextWhite}>Accept Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusBtn, styles.statusBtnProcess]}
                  onPress={() => {
                    if (!selectedRx) return;
                    updatePrescriptionStatus(selectedRx.id, 'Processing');
                    setSelectedRx({ ...selectedRx, status: 'Processing' });
                    Alert.alert('Status Updated', 'Prescription packaging in progress.');
                  }}
                >
                  <Ionicons name="cube" size={16} color="#FFFFFF" />
                  <Text style={styles.statusBtnTextWhite}>Processing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusBtn, styles.statusBtnReady]}
                  onPress={() => {
                    if (!selectedRx) return;
                    updatePrescriptionStatus(selectedRx.id, 'Ready');
                    setSelectedRx({ ...selectedRx, status: 'Ready' });
                    Alert.alert('Ready for Pickup', 'Patient alerted to collect package.');
                  }}
                >
                  <Ionicons name="bag-check" size={16} color="#FFFFFF" />
                  <Text style={styles.statusBtnTextWhite}>Ready for Pickup</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: Update Stocks Modal (Drawn in Wireframe) */}
      {/* ========================================================================= */}
      <Modal
        visible={!!stockModalItem}
        transparent
        animationType="slide"
        onRequestClose={() => setStockModalItem(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStockModalItem(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Update Medicine Stock</Text>
                <Text style={styles.modalSub}>{stockModalItem?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setStockModalItem(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.stockSummaryRow}>
              <View style={styles.stockSummaryBox}>
                <Text style={styles.stockSummaryLabel}>Current Stock</Text>
                <Text style={styles.stockSummaryVal}>{stockModalItem?.currentStock}</Text>
              </View>
              <View style={styles.stockSummaryBox}>
                <Text style={styles.stockSummaryLabel}>Min. Threshold</Text>
                <Text style={styles.stockSummaryVal}>{stockModalItem?.minThreshold}</Text>
              </View>
              <View style={styles.stockSummaryBox}>
                <Text style={styles.stockSummaryLabel}>Rack Location</Text>
                <Text style={styles.stockSummaryValSmall}>{stockModalItem?.rackLocation}</Text>
              </View>
            </View>

            <Text style={styles.modalFieldLabel}>Add Units to Stock:</Text>
            <View style={styles.quickAddChipRow}>
              {['+20', '+50', '+100', '+200'].map((chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.quickAddChip}
                  onPress={() => setStockAddAmount(chip.replace('+', ''))}
                >
                  <Text style={styles.quickAddChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.stockInput}
              keyboardType="number-pad"
              value={stockAddAmount}
              onChangeText={setStockAddAmount}
              placeholder="Enter quantity to add..."
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity style={styles.modalSendBtn} onPress={handleSaveStock} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.modalSendBtnText}>Save Restock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: Custom Customer Availability Reply Modal */}
      {/* ========================================================================= */}
      <Modal
        visible={!!customReplyRequest}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomReplyRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCustomReplyRequest(null)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reply to Inquiry</Text>
                <Text style={styles.modalSub}>
                  {customReplyRequest?.customerName} • {customReplyRequest?.medicineName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCustomReplyRequest(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>Response Note for Customer:</Text>
            <TextInput
              style={styles.modalTextBox}
              multiline
              numberOfLines={3}
              value={customReplyText}
              onChangeText={setCustomReplyText}
              placeholder="e.g., We have 2 strips reserved for you..."
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              style={styles.modalSendBtn}
              onPress={handleSendCustomAvailabilityReply}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.modalSendBtnText}>Send Notification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: Notifications Modal */}
      {/* ========================================================================= */}
      <Modal
        visible={showNotifications}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowNotifications(false)} />
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Pharmacy Notifications</Text>
                <Text style={styles.modalSub}>{alerts.length} active system updates</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {alerts.map((al) => (
                <View key={al.id} style={styles.notifItem}>
                  <Ionicons name="notifications" size={18} color="#1A66E8" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifTitle}>{al.title}</Text>
                    <Text style={styles.notifMsg}>{al.message}</Text>
                    <Text style={styles.notifTime}>{al.time}</Text>
                  </View>
                </View>
              ))}
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Header Center Slot
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: PRIMARY_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: PRIMARY_BLUE,
  },

  // Section Blocks
  sectionBlock: {
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  alertCountBadge: {
    backgroundColor: '#FFE4E6',
    color: '#E11D48',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  inquiryCountBadge: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  // Carousel container (used by prescription & inventory sections)
  carouselContainer: {
    paddingRight: 16,
    gap: 12,
  },
  // Top Alert Card (single fixed card)
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertIconTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 3,
  },
  alertMessage: {
    fontSize: 12.5,
    color: TEXT_MUTED,
    lineHeight: 17,
  },
  alertActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  paginationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#CBD5E1',
  },
  paginationDotActive: {
    backgroundColor: PRIMARY_BLUE,
    width: 20,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 48,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
    height: '100%',
  },
  searchClearBtn: {
    padding: 4,
  },

  // Quick Navigation Grid
  quickNavGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  quickNavCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickNavIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickNavTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  quickNavSubtitle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // Prescription Request Cards
  rxCard: {
    width: CARD_WIDTH,
    height: 285,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  rxCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rxIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rxId: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  rxTime: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  rxBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusAccepted: { backgroundColor: '#DBEAFE' },
  statusProcessing: { backgroundColor: '#E0E7FF' },
  statusReady: { backgroundColor: '#DCFCE7' },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  textPending: { color: '#B45309' },
  textAccepted: { color: '#1D4ED8' },
  textProcessing: { color: '#4338CA' },
  textReady: { color: '#15803D' },

  rxPatientInfo: {
    marginTop: 4,
  },
  rxPatientName: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  rxPatientMeta: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  rxDoctorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },

  rxMedicinesList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 8,
    marginVertical: 4,
    gap: 4,
  },
  rxMedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rxMedName: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  rxMedQty: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  rxMoreMeds: {
    fontSize: 11,
    color: PRIMARY_BLUE,
    fontWeight: '600',
    marginTop: 2,
  },
  replyPreviewBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    padding: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  replyPreviewText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },

  rxCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btnQuickText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  btnQuickTextText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  btnOpenRx: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 24,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  btnOpenRxText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Inventory Stock Alert Cards
  invAlertCard: {
    width: CARD_WIDTH,
    height: 235,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  invAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  invStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  invStatusLow: { backgroundColor: '#FEF3C7' },
  invStatusOut: { backgroundColor: '#FEE2E2' },
  invStatusExpiring: { backgroundColor: '#FFEDD5' },
  invStatusText: { fontSize: 10, fontWeight: '800' },
  invTextLow: { color: '#B45309' },
  invTextOut: { color: '#EF4444' },
  invTextExpiring: { color: '#C2410C' },
  invRackTag: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  invMedTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  invAlertDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 8,
    marginVertical: 4,
  },
  stockCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  stockCountNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
  },
  stockCountLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  invSubAlert: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  invAlertActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btnViewStocks: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnViewStocksText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  btnUpdateStocks: {
    flex: 1.2,
    flexDirection: 'row',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    borderRadius: 24,
  },
  btnUpdateStocksText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Customer Medicine Inquiry Cards
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  requestCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reqCustomerName: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  reqDistance: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  reqStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reqTagAvailable: { backgroundColor: '#DCFCE7' },
  reqTagNotAvailable: { backgroundColor: '#FEE2E2' },
  reqTagPending: { backgroundColor: '#FEF3C7' },
  reqStatusTagText: { fontSize: 11, fontWeight: '700' },
  reqTextAvailable: { color: '#15803D' },
  reqTextNotAvailable: { color: '#EF4444' },
  reqTextPending: { color: '#B45309' },
  reqMedicineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
    marginBottom: 8,
  },
  reqMedMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  reqMedName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  reqMedQty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  reqStockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  reqStockNoticeText: {
    fontSize: 12,
    color: '#475569',
  },
  reqStockBold: {
    fontWeight: '700',
    color: TEXT_DARK,
  },
  reqPharmacistNote: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  reqActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reqBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    borderRadius: 24,
    borderWidth: 1,
  },
  reqBtnAvailable: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  reqBtnAvailableText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  reqBtnNotAvailable: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
  reqBtnNotAvailableText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  reqBtnCustom: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  reqBtnCustomText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  reqBtnActive: {
    borderWidth: 2,
  },

  // Empty state
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '600',
  },

  // Modals Styling
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
    maxHeight: '90%',
  },
  rxDetailsModalCard: {
    maxHeight: '92%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  modalSub: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },

  // SBRT Modal content
  currentStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginBottom: 14,
  },
  currentStockText: {
    fontSize: 14,
    color: '#14532D',
  },
  currentStockBold: {
    fontWeight: '800',
    fontSize: 16,
    color: '#15803D',
  },
  currentStockSub: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  templateScroll: {
    marginBottom: 14,
  },
  templateChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  templateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  modalTextBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 12,
    fontSize: 14,
    color: TEXT_DARK,
    textAlignVertical: 'top',
    height: 90,
    marginBottom: 16,
  },
  modalSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 24,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalSendBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Rx Details Modal items
  rxDetailsScroll: {
    marginBottom: 10,
  },
  rxDetailHeaderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 14,
  },
  rxDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rxDetailLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  rxDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  rxSectionSubHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
    marginVertical: 8,
  },
  rxItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 8,
  },
  rxItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rxItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
    flex: 1,
  },
  rxStockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rxStockPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  rxItemDosage: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  rxItemInstruction: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontStyle: 'italic',
    marginTop: 2,
  },
  rxItemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rxItemQty: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  rxItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  rxTotalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  rxTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  rxTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  statusActionGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 12,
  },
  statusBtnAccept: { backgroundColor: '#1E40AF' },
  statusBtnProcess: { backgroundColor: '#6366F1' },
  statusBtnReady: { backgroundColor: '#059669' },
  statusBtnTextWhite: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Stock Update Modal
  stockSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  stockSummaryBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  stockSummaryLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  stockSummaryVal: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  stockSummaryValSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_BLUE,
    textAlign: 'center',
  },
  quickAddChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickAddChip: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickAddChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  stockInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 16,
  },

  // Notifications List
  notifItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  notifMsg: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  notifTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
});
