import { AppHeader } from "@/components/app-header";
import { useSideMenu } from "@/components/side-menu-context";
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

const PRIMARY_BLUE = "#1A66E8";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";
const ALERT_RED = "#EF4444";
const ALERT_ORANGE = "#F97316";
const ALERT_YELLOW = "#EAB308";

interface AlertItem {
  id: string;
  title: string;
  stockText: string;
  stockHighlight: string;
  subTag: string;
  type: "critical" | "warning" | "trend";
  iconColor: string;
  iconBg: string;
  currentStock: number;
  unit: string;
  threshold: number;
}

export default function InventoryAlertsScreen() {
  const router = useRouter();
  const { openMenu } = useSideMenu();
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [showAllStocksModal, setShowAllStocksModal] = useState(false);

  const [alertList, setAlertList] = useState<AlertItem[]>([
    {
      id: "1",
      title: "Low Paracetamol",
      stockText: "Stock: ",
      stockHighlight: "120 strips",
      subTag: "High demand",
      type: "critical",
      iconColor: "#DC2626",
      iconBg: "#FEE2E2",
      currentStock: 120,
      unit: "strips",
      threshold: 200,
    },
    {
      id: "2",
      title: "Need immediate stockup",
      stockText: "Stock: ",
      stockHighlight: "45 units",
      subTag: "Reorder suggested",
      type: "warning",
      iconColor: "#D97706",
      iconBg: "#FEF3C7",
      currentStock: 45,
      unit: "units",
      threshold: 100,
    },
    {
      id: "3",
      title: "High Demand",
      stockText: "Sales increased by ",
      stockHighlight: "40%",
      subTag: "Last 7 days",
      type: "trend",
      iconColor: "#CA8A04",
      iconBg: "#FEF9C3",
      currentStock: 340,
      unit: "strips",
      threshold: 150,
    },
    {
      id: "4",
      title: "Azithromycin 500mg",
      stockText: "Stock: ",
      stockHighlight: "35 strips",
      subTag: "Fast depleting",
      type: "critical",
      iconColor: "#DC2626",
      iconBg: "#FEE2E2",
      currentStock: 35,
      unit: "strips",
      threshold: 80,
    },
    {
      id: "5",
      title: "Omeprazole 20mg",
      stockText: "Stock: ",
      stockHighlight: "50 boxes",
      subTag: "Low threshold reach",
      type: "warning",
      iconColor: "#D97706",
      iconBg: "#FEF3C7",
      currentStock: 50,
      unit: "boxes",
      threshold: 120,
    },
  ]);

  const filteredAlerts = alertList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subTag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReorder = (item: AlertItem) => {
    Alert.alert(
      "Reorder Requested",
      `Supplier order placed for 200 ${item.unit} of ${item.title}. Estimated delivery: Tomorrow morning.`
    );
    setSelectedAlert(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Header matching Mockup */}
      <AppHeader
        title="MediQuick"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={() => {
          Alert.alert("Notifications", "You have 3 active inventory alerts");
          setUnreadNotifications(0);
        }}
        badgeCount={unreadNotifications}
        style={styles.headerStyle}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Link to Dashboard */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.backText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/* Search Bar matching Right Mockup */}
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
              placeholder="Search medicines..."
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

          <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={20} color="#1A66E8" />
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <Text style={styles.pageTitle}>Inventory Alerts</Text>

        {/* List of Alert Cards matching Right Phone Mockup */}
        <View style={styles.alertListContainer}>
          {filteredAlerts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.alertCard}
              activeOpacity={0.8}
              onPress={() => setSelectedAlert(item)}
            >
              {/* Alert Warning Icon */}
              <View style={[styles.alertIconBadge, { backgroundColor: item.iconBg }]}>
                <Ionicons
                  name={
                    item.type === "critical"
                      ? "warning"
                      : item.type === "warning"
                      ? "alert-circle"
                      : "trending-up"
                  }
                  size={22}
                  color={item.iconColor}
                />
              </View>

              {/* Text Info */}
              <View style={styles.alertCardInfo}>
                <Text style={styles.alertCardTitle}>{item.title}</Text>
                <Text style={styles.alertCardStock}>
                  {item.stockText}
                  <Text
                    style={[
                      styles.stockHighlightText,
                      item.type === "critical"
                        ? styles.redText
                        : item.type === "warning"
                        ? styles.orangeText
                        : styles.greenText,
                    ]}
                  >
                    {item.stockHighlight}
                  </Text>
                </Text>
                <Text style={styles.alertCardTag}>{item.subTag}</Text>
              </View>

              {/* Chevron */}
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Capsule Button: View All Stocks */}
        <TouchableOpacity
          style={styles.viewAllStocksCapsuleBtn}
          activeOpacity={0.8}
          onPress={() => setShowAllStocksModal(true)}
        >
          <Ionicons name="stats-chart-outline" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.viewAllStocksText}>View All Stocks</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Alert Item Detail & Quick Reorder Modal */}
      {selectedAlert && (
        <Modal
          visible={!!selectedAlert}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedAlert(null)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedAlert(null)}
          >
            <Pressable style={styles.detailModalCard}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalTitle}>{selectedAlert.title}</Text>
                  <Text style={styles.modalSubtitle}>{selectedAlert.subTag}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedAlert(null)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.detailMetricsBox}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Current Stock</Text>
                  <Text style={[styles.metricValue, { color: selectedAlert.iconColor }]}>
                    {selectedAlert.currentStock} {selectedAlert.unit}
                  </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Min Threshold</Text>
                  <Text style={styles.metricValue}>
                    {selectedAlert.threshold} {selectedAlert.unit}
                  </Text>
                </View>
              </View>

              <View style={styles.capsuleBtnRow}>
                <TouchableOpacity
                  style={[styles.capsuleBtn, styles.capsuleBtnOutline]}
                  onPress={() => setSelectedAlert(null)}
                >
                  <Text style={styles.capsuleBtnOutlineText}>Dismiss</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.capsuleBtn, styles.capsuleBtnSolid]}
                  onPress={() => handleReorder(selectedAlert)}
                >
                  <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.capsuleBtnSolidText}>Quick Reorder</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* View All Stocks Database Modal */}
      <Modal
        visible={showAllStocksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllStocksModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowAllStocksModal(false)}
        >
          <Pressable style={styles.allStocksModalCard}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Pharmacy Inventory</Text>
                <Text style={styles.modalSubtitle}>Total 9,999+ items tracked</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAllStocksModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
              {alertList.map((item) => (
                <View key={item.id} style={styles.stockItemRow}>
                  <View>
                    <Text style={styles.stockItemName}>{item.title}</Text>
                    <Text style={styles.stockItemSub}>Min: {item.threshold} {item.unit}</Text>
                  </View>
                  <View style={styles.stockItemRight}>
                    <Text style={[styles.stockItemQty, { color: item.iconColor }]}>
                      {item.currentStock} {item.unit}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.capsuleBtn, styles.capsuleBtnSolid, { marginTop: 16 }]}
              onPress={() => setShowAllStocksModal(false)}
            >
              <Text style={styles.capsuleBtnSolidText}>Close Inventory</Text>
            </TouchableOpacity>
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
    paddingTop: 12,
    paddingBottom: 32,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
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
  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 14,
  },

  // Alert Cards List matching Mockup
  alertListContainer: {
    gap: 12,
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  alertIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  alertCardInfo: {
    flex: 1,
  },
  alertCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  alertCardStock: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  stockHighlightText: {
    fontWeight: "700",
  },
  redText: {
    color: ALERT_RED,
  },
  orangeText: {
    color: ALERT_ORANGE,
  },
  greenText: {
    color: "#16A34A",
  },
  alertCardTag: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },

  // View All Stocks Capsule Button
  viewAllStocksCapsuleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  viewAllStocksText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },

  // Modal styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  detailModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  allStocksModalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  detailMetricsBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  capsuleBtnRow: {
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
  },
  capsuleBtnOutline: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  capsuleBtnOutlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  capsuleBtnSolid: {
    backgroundColor: PRIMARY_BLUE,
  },
  capsuleBtnSolidText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stockItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  stockItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  stockItemSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  stockItemRight: {
    alignItems: "flex-end",
  },
  stockItemQty: {
    fontSize: 14,
    fontWeight: "700",
  },
});
