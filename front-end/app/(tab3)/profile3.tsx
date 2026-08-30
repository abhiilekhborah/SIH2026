import { AppHeader } from "@/components/app-header";
import { useSideMenu } from "@/components/side-menu-context";
import { useAuth, useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY_BLUE = "#1A66E8";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";

export default function PharmacistProfileScreen() {
  const { openMenu } = useSideMenu();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [isOpenForOrders, setIsOpenForOrders] = useState(true);
  const [autoReorderAlerts, setAutoReorderAlerts] = useState(true);
  const [instantNotifications, setInstantNotifications] = useState(true);

  const userName = user?.fullName || user?.firstName || "Dr. Rajesh Mehta";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "pharmacist@mediquick.com";

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (e) {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <AppHeader
        title="Profile"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={() => Alert.alert("Notifications", "No new profile notifications")}
        badgeCount={0}
        style={styles.headerStyle}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pharmacist Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="medkit" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.userRole}>Licensed Pharmacist (Pharm.D)</Text>
            <Text style={styles.userLicense}>Lic # MH-PHARM-2024-9918</Text>
          </View>
        </View>

        {/* Pharmacy Store Card */}
        <View style={styles.storeCard}>
          <View style={styles.storeHeaderRow}>
            <View style={styles.storeIconBox}>
              <Ionicons name="business-outline" size={20} color={PRIMARY_BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>MediQuick Central Pharmacy</Text>
              <Text style={styles.storeAddress}>Sector 14, Main Road, New Delhi</Text>
            </View>
          </View>

          <View style={styles.storeStatusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Store Status</Text>
              <Text style={[styles.statusValue, { color: isOpenForOrders ? "#16A34A" : "#EF4444" }]}>
                {isOpenForOrders ? "Open & Accepting Orders" : "Temporarily Closed"}
              </Text>
            </View>
            <Switch
              value={isOpenForOrders}
              onValueChange={setIsOpenForOrders}
              trackColor={{ false: "#CBD5E1", true: "#BFDBFE" }}
              thumbColor={isOpenForOrders ? PRIMARY_BLUE : "#94A3B8"}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Performance & Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,248</Text>
            <Text style={styles.statLabel}>Orders Dispensed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: PRIMARY_BLUE }]}>9,999+</Text>
            <Text style={styles.statLabel}>Current Stock</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#F97316" }]}>2</Text>
            <Text style={styles.statLabel}>Stock Alerts</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#16A34A" }]}>99.4%</Text>
            <Text style={styles.statLabel}>Fulfillment Rate</Text>
          </View>
        </View>

        {/* Settings & Preferences */}
        <Text style={styles.sectionTitle}>Pharmacy Settings</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Auto Reorder Alerts</Text>
              <Text style={styles.settingSub}>Notify when medicines drop below minimum</Text>
            </View>
            <Switch
              value={autoReorderAlerts}
              onValueChange={setAutoReorderAlerts}
              trackColor={{ false: "#CBD5E1", true: "#BFDBFE" }}
              thumbColor={autoReorderAlerts ? PRIMARY_BLUE : "#94A3B8"}
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Instant Rx Notifications</Text>
              <Text style={styles.settingSub}>Receive sound alerts on new doctor prescriptions</Text>
            </View>
            <Switch
              value={instantNotifications}
              onValueChange={setInstantNotifications}
              trackColor={{ false: "#CBD5E1", true: "#BFDBFE" }}
              thumbColor={instantNotifications ? PRIMARY_BLUE : "#94A3B8"}
            />
          </View>
        </View>

        {/* Capsule Action Buttons */}
        <TouchableOpacity
          style={[styles.capsuleBtn, styles.capsuleBtnWhite]}
          activeOpacity={0.8}
          onPress={() => Alert.alert("Support", "Connecting to MediQuick Pharmacy Helpdesk (24/7 Helpline: 1800-123-MEDI)")}
        >
          <Ionicons name="help-buoy-outline" size={18} color={PRIMARY_BLUE} />
          <Text style={styles.capsuleBtnWhiteText}>Help & Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.capsuleBtn, styles.capsuleBtnDanger]}
          activeOpacity={0.8}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.capsuleBtnDangerText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 36,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PRIMARY_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  userRole: {
    fontSize: 13,
    color: PRIMARY_BLUE,
    fontWeight: "600",
    marginTop: 2,
  },
  userLicense: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  storeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  storeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  storeName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  storeAddress: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  storeStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
  },
  statusItem: {},
  statusLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  settingSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  capsuleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
    gap: 8,
    marginBottom: 12,
  },
  capsuleBtnWhite: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  capsuleBtnWhiteText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_BLUE,
  },
  capsuleBtnDanger: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  capsuleBtnDangerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
});
