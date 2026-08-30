import { AppHeader } from "@/components/app-header";
import { useSideMenu } from "@/components/side-menu-context";
import { useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Color Palette matching high-fidelity mockup
const PRIMARY_BLUE = "#1A66E8";
const DARK_BLUE = "#123E9E";
const LIGHT_BLUE_BG = "#EFF6FF";
const BORDER_BLUE = "#BFDBFE";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";
const WARM_CARD_BG = "#FFF8F0";
const WARM_CARD_BORDER = "#FED7AA";
const ALERT_ORANGE = "#F97316";
const ALERT_RED = "#EF4444";
const ALERT_YELLOW = "#EAB308";

interface MedicineStock {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  status: "low" | "critical" | "high_demand" | "normal";
  demandInfo?: string;
}

export default function PharmacistHomeScreen() {
  const router = useRouter();
  const { openMenu } = useSideMenu();
  const { user } = useUser();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Modals
  const [showQuickTextModal, setShowQuickTextModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showViewStocksModal, setShowViewStocksModal] = useState(false);
  const [showUpdateStocksModal, setShowUpdateStocksModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Quick Text State
  const [prescriptionNote, setPrescriptionNote] = useState("");

  // Stock list state for interactive updates
  const [stocks, setStocks] = useState<MedicineStock[]>([
    {
      id: "1",
      name: "Paracetamol 500mg",
      category: "Analgesic",
      currentStock: 120,
      unit: "strips",
      status: "low",
      demandInfo: "High demand",
    },
    {
      id: "2",
      name: "Amoxicillin 250mg",
      category: "Antibiotic",
      currentStock: 45,
      unit: "units",
      status: "critical",
      demandInfo: "Reorder suggested",
    },
    {
      id: "3",
      name: "Cetirizine 10mg",
      category: "Antihistamine",
      currentStock: 340,
      unit: "strips",
      status: "high_demand",
      demandInfo: "Sales increased by 40%",
    },
    {
      id: "4",
      name: "Omeprazole 20mg",
      category: "Antacid",
      currentStock: 210,
      unit: "boxes",
      status: "normal",
    },
    {
      id: "5",
      name: "Ibuprofen 400mg",
      category: "Anti-inflammatory",
      currentStock: 180,
      unit: "strips",
      status: "normal",
    },
    {
      id: "6",
      name: "Azithromycin 500mg",
      category: "Antibiotic",
      currentStock: 35,
      unit: "strips",
      status: "critical",
      demandInfo: "Stock urgent",
    },
  ]);

  const totalStockCount = stocks.reduce((acc, item) => acc + item.currentStock, 0) + 9000; // Display 9999+ as mockup

  // Handlers
  const handleSendPrescriptionNote = () => {
    if (!prescriptionNote.trim()) {
      Alert.alert("Empty Note", "Please type a note before sending.");
      return;
    }
    Alert.alert(
      "Prescription Sent",
      `Note successfully sent to patient:\n"${prescriptionNote.trim()}"`
    );
    setPrescriptionNote("");
    setShowQuickTextModal(false);
  };

  const handleStockAdjustment = (id: string, delta: number) => {
    setStocks((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, currentStock: Math.max(0, item.currentStock + delta) }
          : item
      )
    );
  };

  const handleOpenNotifications = () => {
    setShowNotificationModal(true);
    setUnreadNotifications(0);
  };

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedFilter === "All") return matchesSearch;
    if (selectedFilter === "Low Stock") return matchesSearch && (stock.status === "low" || stock.status === "critical");
    if (selectedFilter === "High Demand") return matchesSearch && stock.status === "high_demand";
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top App Header */}
      <AppHeader
        title="MediQuick"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={handleOpenNotifications}
        badgeCount={unreadNotifications}
        style={styles.headerStyle}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Alerts Banner Card */}
        <TouchableOpacity
          style={styles.alertsBanner}
          activeOpacity={0.85}
          onPress={() => router.push('/(tab3)/inventory' as any)}
        >
          <View style={styles.alertIconCircle}>
            <Ionicons name="alert" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.alertBannerTextContainer}>
            <Text style={styles.alertBannerTitle}>Alerts Cards</Text>
            <Text style={styles.alertBannerSubtitle}>2 active alerts</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* 2. Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#94A3B8"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicines, prescriptions..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={20} color="#1A66E8" />
          </TouchableOpacity>
        </View>

        {/* 3. Prescription Request Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Prescription Request</Text>

          <View style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeaderRow}>
              <Text style={styles.cardTag}>Basic Details</Text>
              <View style={styles.statusPill}>
                <View style={styles.greenDot} />
                <Text style={styles.statusPillText}>New Request</Text>
              </View>
            </View>

            <Text style={styles.patientSummary}>
              Patient: <Text style={styles.boldText}>Rahul Sharma</Text> (28M)
            </Text>
            <Text style={styles.patientSubtext}>
              Rx #MD-8842 • Paracetamol 500mg (2 strips), Cetirizine 10mg (1 strip)
            </Text>

            {/* Capsule Action Buttons */}
            <View style={styles.capsuleButtonRow}>
              <TouchableOpacity
                style={[styles.capsuleBtn, styles.capsuleBtnOutline]}
                activeOpacity={0.75}
                onPress={() => setShowQuickTextModal(true)}
              >
                <Ionicons name="chatbubble-outline" size={17} color={PRIMARY_BLUE} />
                <Text style={styles.capsuleBtnOutlineText}>Quick Text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.capsuleBtn, styles.capsuleBtnOutline]}
                activeOpacity={0.75}
                onPress={() => setShowPrescriptionModal(true)}
              >
                <Ionicons name="document-text-outline" size={17} color={PRIMARY_BLUE} />
                <Text style={styles.capsuleBtnOutlineText}>Open Prescription</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. Inventory Alerts Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Inventory Alerts</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tab3)/inventory' as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Warm Tinted Inventory Alert Card */}
          <View style={styles.warmCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tab3)/inventory' as any)}
              style={styles.warmCardHeader}
            >
              <View style={styles.bulletList}>
                <View style={styles.bulletRow}>
                  <View style={styles.orangeDot} />
                  <Text style={styles.bulletText}>Low Paracetamol</Text>
                </View>
                <View style={styles.bulletRow}>
                  <View style={styles.orangeDot} />
                  <Text style={styles.bulletText}>Need immediate stockup</Text>
                </View>
                <View style={styles.bulletRow}>
                  <View style={styles.orangeDot} />
                  <Text style={styles.bulletText}>High Demand</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D97706" />
            </TouchableOpacity>

            {/* Bottom Capsule Buttons inside Inventory Card */}
            <View style={styles.inventoryActionRow}>
              <TouchableOpacity
                style={[styles.capsuleBtn, styles.capsuleBtnWhite]}
                activeOpacity={0.75}
                onPress={() => setShowViewStocksModal(true)}
              >
                <Ionicons name="analytics-outline" size={17} color={PRIMARY_BLUE} />
                <Text style={styles.capsuleBtnWhiteText}>View Stocks</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.capsuleBtn, styles.capsuleBtnSolid]}
                activeOpacity={0.75}
                onPress={() => setShowUpdateStocksModal(true)}
              >
                <Ionicons name="sync-outline" size={17} color="#FFFFFF" />
                <Text style={styles.capsuleBtnSolidText}>Update Stocks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ================= MODALS & SHEETS ================= */}

      {/* 1. SEND PRESCRIPTION MODAL (Mockup Left) */}
      <Modal
        visible={showQuickTextModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickTextModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowQuickTextModal(false)}
        >
          <Pressable style={styles.sendPrescriptionModalCard}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Send Prescription</Text>
              <TouchableOpacity
                onPress={() => setShowQuickTextModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Sub-label */}
            <Text style={styles.inputLabel}>Prescription Note (Optional)</Text>

            {/* Textarea */}
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Type your message..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                maxLength={200}
                value={prescriptionNote}
                onChangeText={setPrescriptionNote}
              />
              <Text style={styles.charCounter}>{prescriptionNote.length}/200</Text>
            </View>

            {/* Send Capsule Button */}
            <TouchableOpacity
              style={[styles.capsuleBtn, styles.capsuleBtnSolid, styles.sendBtn]}
              activeOpacity={0.8}
              onPress={handleSendPrescriptionNote}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.capsuleBtnSolidText}>Send</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 2. CURRENT STOCK VIEW MODAL */}
      <Modal
        visible={showViewStocksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowViewStocksModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowViewStocksModal(false)}
        >
          <Pressable style={styles.stockOverviewModalCard}>
            {/* Stock Count Badge Card from Mockup */}
            <View style={styles.stockBadgeBanner}>
              <View style={styles.cubeIconBox}>
                <Ionicons name="cube-outline" size={26} color={PRIMARY_BLUE} />
              </View>
              <Text style={styles.stockBadgeText}>
                Current Stock: <Text style={styles.stockBadgeNumber}>{totalStockCount}</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowViewStocksModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.stockListHeader}>Live Inventory Status</Text>

            <ScrollView style={styles.stockListScroll} showsVerticalScrollIndicator={false}>
              {stocks.map((item) => (
                <View key={item.id} style={styles.stockRowItem}>
                  <View style={styles.stockItemInfo}>
                    <Text style={styles.stockItemName}>{item.name}</Text>
                    <Text style={styles.stockItemCategory}>{item.category}</Text>
                  </View>
                  <View style={styles.stockItemBadge}>
                    <Text
                      style={[
                        styles.stockItemQty,
                        item.status === "critical"
                          ? styles.textRed
                          : item.status === "low"
                          ? styles.textOrange
                          : styles.textBlue,
                      ]}
                    >
                      {item.currentStock} {item.unit}
                    </Text>
                    {item.demandInfo && (
                      <Text style={styles.stockDemandSub}>{item.demandInfo}</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.capsuleBtn, styles.capsuleBtnSolid, { marginTop: 16 }]}
              onPress={() => {
                setShowViewStocksModal(false);
                setShowUpdateStocksModal(true);
              }}
            >
              <Ionicons name="sync-outline" size={17} color="#FFFFFF" />
              <Text style={styles.capsuleBtnSolidText}>Adjust Quantities</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 3. UPDATE STOCKS MODAL */}
      <Modal
        visible={showUpdateStocksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUpdateStocksModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowUpdateStocksModal(false)}
        >
          <Pressable style={styles.updateStockModalCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Update Inventory</Text>
                <Text style={styles.modalSubtitle}>Adjust stock levels & trigger restocks</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowUpdateStocksModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.updateListScroll} showsVerticalScrollIndicator={false}>
              {stocks.map((item) => (
                <View key={item.id} style={styles.updateRowItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stockItemName}>{item.name}</Text>
                    <Text style={styles.stockItemCategory}>
                      Current: {item.currentStock} {item.unit}
                    </Text>
                  </View>

                  <View style={styles.stepperContainer}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => handleStockAdjustment(item.id, -10)}
                    >
                      <Ionicons name="remove" size={16} color={PRIMARY_BLUE} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{item.currentStock}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => handleStockAdjustment(item.id, 10)}
                    >
                      <Ionicons name="add" size={16} color={PRIMARY_BLUE} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.capsuleBtn, styles.capsuleBtnSolid, { marginTop: 14 }]}
              onPress={() => {
                Alert.alert("Success", "Inventory counts updated successfully!");
                setShowUpdateStocksModal(false);
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.capsuleBtnSolidText}>Save Stock Changes</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 4. OPEN PRESCRIPTION DETAIL MODAL */}
      <Modal
        visible={showPrescriptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrescriptionModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowPrescriptionModal(false)}
        >
          <Pressable style={styles.prescriptionDetailCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Prescription Details</Text>
                <Text style={styles.modalSubtitle}>Order #MD-8842 • E-Prescription</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPrescriptionModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Patient Info */}
              <View style={styles.detailSectionBox}>
                <Text style={styles.detailSectionTitle}>Patient Information</Text>
                <Text style={styles.detailRowText}>
                  Name: <Text style={styles.boldText}>Rahul Sharma</Text>
                </Text>
                <Text style={styles.detailRowText}>Age/Gender: 28 Years / Male</Text>
                <Text style={styles.detailRowText}>Doctor: Dr. Sunita Kulkarni (MBBS, MD)</Text>
              </View>

              {/* Prescribed Medicines */}
              <View style={styles.detailSectionBox}>
                <Text style={styles.detailSectionTitle}>Prescribed Medicines</Text>
                <View style={styles.medicineDetailItem}>
                  <Text style={styles.medName}>1. Paracetamol 500mg</Text>
                  <Text style={styles.medDosage}>2 Strips (20 Tablets) • 1-0-1 after meals</Text>
                </View>
                <View style={styles.medicineDetailItem}>
                  <Text style={styles.medName}>2. Cetirizine 10mg</Text>
                  <Text style={styles.medDosage}>1 Strip (10 Tablets) • 0-0-1 at bedtime</Text>
                </View>
              </View>

              {/* Doctor Notes */}
              <View style={styles.detailSectionBox}>
                <Text style={styles.detailSectionTitle}>Doctor Instructions</Text>
                <Text style={styles.instructionsText}>
                  "Mild fever and allergic rhinitis symptoms. Patient advised plenty of fluids and 3 days rest."
                </Text>
              </View>
            </ScrollView>

            <View style={styles.capsuleButtonRow}>
              <TouchableOpacity
                style={[styles.capsuleBtn, styles.capsuleBtnOutline]}
                onPress={() => {
                  setShowPrescriptionModal(false);
                  setShowQuickTextModal(true);
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color={PRIMARY_BLUE} />
                <Text style={styles.capsuleBtnOutlineText}>Quick Text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.capsuleBtn, styles.capsuleBtnSolid]}
                onPress={() => {
                  Alert.alert("Order Dispensed", "Prescription has been processed and ready for pickup/delivery!");
                  setShowPrescriptionModal(false);
                }}
              >
                <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                <Text style={styles.capsuleBtnSolidText}>Dispense</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 5. NOTIFICATION MODAL */}
      <Modal
        visible={showNotificationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowNotificationModal(false)}
        >
          <Pressable style={styles.notificationModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity
                onPress={() => setShowNotificationModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.notifItem}>
              <View style={[styles.notifIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="receipt-outline" size={18} color={PRIMARY_BLUE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>New Prescription Request</Text>
                <Text style={styles.notifSub}>Rahul Sharma submitted Rx #MD-8842</Text>
                <Text style={styles.notifTime}>5 mins ago</Text>
              </View>
            </View>

            <View style={styles.notifItem}>
              <View style={[styles.notifIcon, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="alert-circle-outline" size={18} color={ALERT_RED} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>Low Paracetamol Alert</Text>
                <Text style={styles.notifSub}>Stock reached below threshold (120 strips)</Text>
                <Text style={styles.notifTime}>25 mins ago</Text>
              </View>
            </View>

            <View style={styles.notifItem}>
              <View style={[styles.notifIcon, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="trending-up-outline" size={18} color={ALERT_YELLOW} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>High Demand Detected</Text>
                <Text style={styles.notifSub}>Cetirizine sales jumped 40% this week</Text>
                <Text style={styles.notifTime}>2 hrs ago</Text>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 6. FILTER OPTIONS MODAL */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable style={styles.filterModalCard}>
            <Text style={styles.modalTitle}>Filter Inventory</Text>
            {["All", "Low Stock", "High Demand"].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterOptionRow,
                  selectedFilter === filter && styles.filterOptionActive,
                ]}
                onPress={() => {
                  setSelectedFilter(filter);
                  setShowFilterModal(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === filter && styles.filterOptionTextActive,
                  ]}
                >
                  {filter}
                </Text>
                {selectedFilter === filter && (
                  <Ionicons name="checkmark" size={18} color={PRIMARY_BLUE} />
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerStyle: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // 1. Alerts Banner
  alertsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  alertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: ALERT_ORANGE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  alertBannerTextContainer: {
    flex: 1,
  },
  alertBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  alertBannerSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  // 2. Search Bar
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
  },
  clearBtn: {
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  // 3. Sections
  sectionContainer: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_BLUE,
    marginBottom: 12,
  },

  // Prescription Request Card
  prescriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  prescriptionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTag: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_BLUE,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },
  patientSummary: {
    fontSize: 15,
    color: TEXT_DARK,
    marginBottom: 4,
  },
  patientSubtext: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
    marginBottom: 16,
  },
  boldText: {
    fontWeight: "700",
    color: TEXT_DARK,
  },

  // Capsule Button System
  capsuleButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  capsuleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 22,
    gap: 8,
    paddingHorizontal: 12,
  },
  capsuleBtnOutline: {
    backgroundColor: LIGHT_BLUE_BG,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
  },
  capsuleBtnOutlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },
  capsuleBtnWhite: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  capsuleBtnWhiteText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },
  capsuleBtnSolid: {
    backgroundColor: PRIMARY_BLUE,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  capsuleBtnSolidText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // 4. Inventory Alerts Warm Card
  warmCard: {
    backgroundColor: WARM_CARD_BG,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: WARM_CARD_BORDER,
  },
  warmCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bulletList: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orangeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ALERT_ORANGE,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C2D12",
  },
  inventoryActionRow: {
    flexDirection: "row",
    gap: 10,
  },

  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  modalSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
  },

  // Send Prescription Modal
  sendPrescriptionModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  textAreaContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    fontSize: 14,
    color: TEXT_DARK,
    minHeight: 90,
    textAlignVertical: "top",
  },
  charCounter: {
    alignSelf: "flex-end",
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },
  sendBtn: {
    height: 46,
    borderRadius: 23,
  },

  // Stock Overview Modal
  stockOverviewModalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  stockBadgeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_BLUE_BG,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
    marginBottom: 16,
  },
  cubeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stockBadgeText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  stockBadgeNumber: {
    fontSize: 17,
    fontWeight: "800",
    color: PRIMARY_BLUE,
  },
  stockListHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 10,
  },
  stockListScroll: {
    maxHeight: 260,
  },
  stockRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  stockItemInfo: {
    flex: 1,
  },
  stockItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  stockItemCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  stockItemBadge: {
    alignItems: "flex-end",
  },
  stockItemQty: {
    fontSize: 13,
    fontWeight: "700",
  },
  stockDemandSub: {
    fontSize: 11,
    color: ALERT_ORANGE,
    marginTop: 2,
  },
  textRed: {
    color: ALERT_RED,
  },
  textOrange: {
    color: ALERT_ORANGE,
  },
  textBlue: {
    color: PRIMARY_BLUE,
  },

  // Update Stock Modal
  updateStockModalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  updateListScroll: {
    maxHeight: 280,
    marginVertical: 10,
  },
  updateRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_DARK,
    minWidth: 28,
    textAlign: "center",
  },

  // Prescription Detail Modal
  prescriptionDetailCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  detailSectionBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY_BLUE,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailRowText: {
    fontSize: 13,
    color: TEXT_DARK,
    marginBottom: 3,
  },
  medicineDetailItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  medName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  medDosage: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  instructionsText: {
    fontSize: 13,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 18,
  },

  // Notification Modal
  notificationModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  notifSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  notifTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 3,
  },

  // Filter Modal
  filterModalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  filterOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  filterOptionActive: {
    backgroundColor: LIGHT_BLUE_BG,
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  filterOptionTextActive: {
    color: PRIMARY_BLUE,
  },
});
