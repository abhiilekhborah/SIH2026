import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { SideMenu } from "@/components/side-menu";
import { SideMenuContext } from "@/components/side-menu-context";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";

export default function TabsLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SideMenuContext.Provider value={{ openMenu: () => setIsMenuOpen(true) }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="home-outline" label="Home" />
            ),
          }}
        />
        <Tabs.Screen
          name="AI_Care"
          options={{
            title: "AI_Care",
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="medkit-outline" label="AI Care" />
            ),
          }}
        />
        <Tabs.Screen
          name="emergency"
          options={{
            title: "Emergency",
            tabBarButton: (props) => (
              <TouchableOpacity
                {...(props as any)}
                style={styles.emergencyButtonWrapper}
                activeOpacity={0.9}
              >
                <View style={styles.emergencyHalo}>
                  <View style={styles.emergencyButton}>
                    <Ionicons name="warning-outline" size={28} color="#fff" />
                    <Text style={styles.emergencyText}>EMERGENCY</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="document-text-outline" label="History" />
            ),
          }}
        />
        <Tabs.Screen name="gallery" options={{ href: null }} />
        <Tabs.Screen name="about" options={{ href: null }} />
        <Tabs.Screen name="contact" options={{ href: null }} />
        <Tabs.Screen name="referrals" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon="person-outline" label="Profile" />
            ),
          }}
        />
      </Tabs>

      <SideMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </SideMenuContext.Provider>
  );
}

function TabIcon({ focused, icon, label }: { focused: boolean; icon: any; label: string }) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={styles.activeIndicator} />}
      <View style={styles.iconWrapper}>
        <Ionicons
          name={icon}
          size={24}
          color={focused ? "#2563EB" : "#9CA3AF"}
        />
      </View>
      <Text style={[styles.tabLabel, { color: focused ? "#2563EB" : "#9CA3AF" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 5,
    left: 20,
    right: 20,
    backgroundColor: "#ffffff",
    borderRadius: 35,
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    borderTopWidth: 0,
    paddingHorizontal: 10,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: 65,
    top: 13,
  },
  activeIndicator: {
    position: "absolute",
    top: -9,
    width: 16,
    height: 4,
    backgroundColor: "#5a8dfaff",
    borderRadius: 2,
  },
  iconWrapper: {
    marginTop: 5,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  emergencyButtonWrapper: {
    top: -22,
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyHalo: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  emergencyButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#F43F5E",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
});
