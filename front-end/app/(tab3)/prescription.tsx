import { AppHeader } from "@/components/app-header";
import { useSideMenu } from "@/components/side-menu-context";
import Ionicons from "@expo/vector-icons/Ionicons";
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
const LIGHT_BLUE_BG = "#EFF6FF";
const BORDER_BLUE = "#BFDBFE";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";

interface PrescriptionOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientAgeGender: string;
  doctorName: string;
  date: string;
  type: "rx" | "otc";
  status: "pending" | "ready" | "dispensed";
  medicines: { name: string; dosage: string; quantity: string }[];
  note?: string;
}

export default function PrescriptionScreen() {
  const { openMenu } = useSideMenu();
  const [activeTab, setActiveTab] = useState<"pending" | "otc" | "dispensed">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(null);

  // Quick Text Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTargetOrder, setNoteTargetOrder] = useState<PrescriptionOrder | null>(null);
  const [prescriptionNote, setPrescriptionNote] = useState("");

  const [orders, setOrders] = useState<PrescriptionOrder[]>([
    {
      id: "1",
      orderNumber: "MD-8842",
      patientName: "Rahul Sharma",
      patientAgeGender: "28M",
      doctorName: "Dr. Sunita Kulkarni",
      date: "Today, 11:30 AM",
      type: "rx",
      status: "pending",
      medicines: [
        { name: "Paracetamol 500mg", dosage: "1-0-1 after meals", quantity: "2 strips (20 tabs)" },
        { name: "Cetirizine 10mg", dosage: "0-0-1 at bedtime", quantity: "1 strip (10 tabs)" },
      ],
      note: "Mild fever and nasal congestion for 2 days.",
    },
    {
      id: "2",
      orderNumber: "MD-8839",
      patientName: "Priya Patel",
      patientAgeGender: "34F",
      doctorName: "Dr. Arvind Rao",
      date: "Today, 10:15 AM",
      type: "rx",
      status: "pending",
      medicines: [
        { name: "Amoxicillin 250mg", dosage: "1-0-1 for 5 days", quantity: "1 strip (10 caps)" },
        { name: "Omeprazole 20mg", dosage: "1-0-0 before breakfast", quantity: "1 strip (10 caps)" },
      ],
      note: "Bacterial pharyngitis.",
    },
    {
      id: "3",
      orderNumber: "OTC-4091",
      patientName: "Amit Kumar",
      patientAgeGender: "41M",
      doctorName: "Self Order (OTC)",
      date: "Today, 09:45 AM",
      type: "otc",
      status: "pending",
      medicines: [
        { name: "Paracetamol 650mg", dosage: "As needed for headache", quantity: "1 strip" },
        { name: "Bandages & Antiseptic", dosage: "External application", quantity: "1 kit" },
      ],
      note: "Order basic OTC medicines without prescription.",
    },
    {
      id: "4",
      orderNumber: "MD-8810",
      patientName: "Sneha Reddy",
      patientAgeGender: "24F",
      doctorName: "Dr. Vikram Seth",
      date: "Yesterday, 04:20 PM",
      type: "rx",
      status: "dispensed",
      medicines: [
        { name: "Ibuprofen 400mg", dosage: "1-0-1 as needed", quantity: "1 strip (10 tabs)" },
      ],
    },
  ]);

  const handleDispense = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "dispensed" } : o))
    );
    Alert.alert("Success", "Prescription medicines marked as Dispensed!");
    setSelectedOrder(null);
  };

  const handleSendNote = () => {
    if (!prescriptionNote.trim()) {
      Alert.alert("Empty Note", "Please type your message.");
      return;
    }
    Alert.alert(
      "Note Sent",
      `Message sent to ${noteTargetOrder?.patientName}:\n"${prescriptionNote.trim()}"`
    );
    setPrescriptionNote("");
    setShowNoteModal(false);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "pending") return matchesSearch && o.status === "pending" && o.type === "rx";
    if (activeTab === "otc") return matchesSearch && o.type === "otc";
    if (activeTab === "dispensed") return matchesSearch && o.status === "dispensed";
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <AppHeader
        title="Prescriptions"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={() => Alert.alert("Notifications", "2 new prescription requests")}
        badgeCount={2}
        style={styles.headerStyle}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient, Rx number..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Segment Controls */}
        <View style={styles.tabSegmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "pending" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("pending")}
          >
            <Text style={[styles.segmentText, activeTab === "pending" && styles.segmentTextActive]}>
              Rx Requests ({orders.filter((o) => o.status === "pending" && o.type === "rx").length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "otc" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("otc")}
          >
            <Text style={[styles.segmentText, activeTab === "otc" && styles.segmentTextActive]}>
              OTC ({orders.filter((o) => o.type === "otc").length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === "dispensed" && styles.segmentBtnActive]}
            onPress={() => setActiveTab("dispensed")}
          >
            <Text style={[styles.segmentText, activeTab === "dispensed" && styles.segmentTextActive]}>
              Dispensed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <View style={styles.orderListContainer}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="documents-outline" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No orders in this tab</Text>
              <Text style={styles.emptySub}>All requests are currently up to date.</Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Header */}
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.patientName}>{order.patientName}</Text>
                    <Text style={styles.patientInfo}>
                      {order.patientAgeGender} • Rx #{order.orderNumber}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      order.status === "dispensed"
                        ? styles.badgeDispensed
                        : styles.badgePending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        order.status === "dispensed"
                          ? styles.badgeTextDispensed
                          : styles.badgeTextPending,
                      ]}
                    >
                      {order.status === "dispensed" ? "Dispensed" : "Pending Rx"}
                    </Text>
                  </View>
                </View>

                {/* Prescribed Items */}
                <View style={styles.medicineSummaryBox}>
                  {order.medicines.map((med, idx) => (
                    <View key={idx} style={styles.medRow}>
                      <Ionicons name="medical" size={13} color={PRIMARY_BLUE} />
                      <Text style={styles.medText}>
                        {med.name} <Text style={styles.medQty}>({med.quantity})</Text>
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Doctor info & Date */}
                <View style={styles.orderMetaRow}>
                  <Text style={styles.orderMetaText}>
                    <Ionicons name="person-outline" size={12} color="#64748B" /> {order.doctorName}
                  </Text>
                  <Text style={styles.orderMetaText}>
                    <Ionicons name="time-outline" size={12} color="#64748B" /> {order.date}
                  </Text>
                </View>

                {/* Capsule Action Buttons */}
                <View style={styles.capsuleBtnRow}>
                  <TouchableOpacity
                    style={[styles.capsuleBtn, styles.capsuleBtnOutline]}
                    onPress={() => {
                      setNoteTargetOrder(order);
                      setShowNoteModal(true);
                    }}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={PRIMARY_BLUE} />
                    <Text style={styles.capsuleBtnOutlineText}>Quick Text</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.capsuleBtn, styles.capsuleBtnSolid]}
                    onPress={() => setSelectedOrder(order)}
                  >
                    <Ionicons name="receipt-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.capsuleBtnSolidText}>Open Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 1. SEND PRESCRIPTION NOTE MODAL */}
      <Modal
        visible={showNoteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowNoteModal(false)}>
          <Pressable style={styles.noteModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Send Prescription</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Prescription Note (Optional)</Text>

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

            <TouchableOpacity
              style={[styles.capsuleBtn, styles.capsuleBtnSolid, { height: 46, borderRadius: 23 }]}
              onPress={handleSendNote}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.capsuleBtnSolidText}>Send</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 2. ORDER DETAILS MODAL */}
      {selectedOrder && (
        <Modal
          visible={!!selectedOrder}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedOrder(null)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedOrder(null)}>
            <Pressable style={styles.orderDetailModalCard}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <Text style={styles.modalSubtitle}>Rx #{selectedOrder.orderNumber}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Patient Information</Text>
                  <Text style={styles.detailText}>
                    Name: <Text style={{ fontWeight: "700" }}>{selectedOrder.patientName}</Text> ({selectedOrder.patientAgeGender})
                  </Text>
                  <Text style={styles.detailText}>Doctor: {selectedOrder.doctorName}</Text>
                  <Text style={styles.detailText}>Date: {selectedOrder.date}</Text>
                </View>

                <View style={styles.detailBox}>
                  <Text style={styles.detailBoxTitle}>Prescribed Medicines</Text>
                  {selectedOrder.medicines.map((m, idx) => (
                    <View key={idx} style={{ paddingVertical: 4 }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: TEXT_DARK }}>
                        {idx + 1}. {m.name}
                      </Text>
                      <Text style={{ fontSize: 12, color: TEXT_MUTED }}>
                        Quantity: {m.quantity} • Dosage: {m.dosage}
                      </Text>
                    </View>
                  ))}
                </View>

                {selectedOrder.note && (
                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxTitle}>Doctor / Order Note</Text>
                    <Text style={{ fontSize: 13, color: "#334155", fontStyle: "italic" }}>
                      "{selectedOrder.note}"
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.capsuleBtnRow}>
                <TouchableOpacity
                  style={[styles.capsuleBtn, styles.capsuleBtnOutline]}
                  onPress={() => {
                    setNoteTargetOrder(selectedOrder);
                    setShowNoteModal(true);
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={PRIMARY_BLUE} />
                  <Text style={styles.capsuleBtnOutlineText}>Quick Text</Text>
                </TouchableOpacity>

                {selectedOrder.status !== "dispensed" ? (
                  <TouchableOpacity
                    style={[styles.capsuleBtn, styles.capsuleBtnSolid]}
                    onPress={() => handleDispense(selectedOrder.id)}
                  >
                    <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                    <Text style={styles.capsuleBtnSolidText}>Dispense</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.capsuleBtn, styles.capsuleBtnOutline]}
                    onPress={() => setSelectedOrder(null)}
                  >
                    <Text style={styles.capsuleBtnOutlineText}>Close</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
  },
  tabSegmentContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 22,
    padding: 3,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  segmentTextActive: {
    color: PRIMARY_BLUE,
    fontWeight: "700",
  },
  orderListContainer: {
    gap: 14,
  },
  orderCard: {
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
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  patientInfo: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgePending: {
    backgroundColor: "#EFF6FF",
  },
  badgeTextPending: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY_BLUE,
  },
  badgeDispensed: {
    backgroundColor: "#DCFCE7",
  },
  badgeTextDispensed: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  medicineSummaryBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginBottom: 12,
  },
  medRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  medText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  medQty: {
    color: TEXT_MUTED,
    fontWeight: "400",
  },
  orderMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  orderMetaText: {
    fontSize: 12,
    color: "#64748B",
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
    backgroundColor: LIGHT_BLUE_BG,
    borderWidth: 1,
    borderColor: BORDER_BLUE,
  },
  capsuleBtnOutlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },
  capsuleBtnSolid: {
    backgroundColor: PRIMARY_BLUE,
  },
  capsuleBtnSolidText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noteModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  orderDetailModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
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
  detailBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailBoxTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: PRIMARY_BLUE,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 13,
    color: TEXT_DARK,
    marginBottom: 3,
  },
});
