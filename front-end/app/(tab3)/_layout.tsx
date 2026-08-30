import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { PharmacistDrawer } from "@/components/pharmacist-drawer";
import { SideMenuContext } from "@/components/side-menu-context";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function Tab3Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SideMenuContext.Provider value={{ openMenu: () => setIsMenuOpen(true) }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#1A66E8",
          tabBarInactiveTintColor: "#94A3B8",
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="home3"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="prescription"
          options={{
            title: "Prescription",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile3"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <PharmacistDrawer
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </SideMenuContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});
