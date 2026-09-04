import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function _layout() {
  return <Tabs
    screenOptions={{
      tabBarActiveTintColor: "#1A66E8", // Component Blue
      tabBarInactiveTintColor: "#64748B", // Slate gray for inactive tabs
      tabBarStyle: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        height: 64,
        paddingBottom: 8,
        paddingTop: 8,
      },
      headerShown: false,
    }}>
    <Tabs.Screen name="home" options={{
      title: "Home",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
      ),
    }} />
    <Tabs.Screen name="appointments" options={{
      title: "Appointments",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
      ),
    }} />
    <Tabs.Screen name="new" options={{
      title: "New",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={size} color={color} />
      ),
    }} />
    <Tabs.Screen name="history" options={{
      title: "History",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "time" : "time-outline"} size={size} color={color} />
      ),
    }} />
    <Tabs.Screen name="profile" options={{
      title: "Profile",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
      ),
    }} />
    <Tabs.Screen name="consultation" options={{ href: null }} />
  </Tabs>

}