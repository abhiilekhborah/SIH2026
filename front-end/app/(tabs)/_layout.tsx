import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function _layout(){
  return <Tabs
    screenOptions={{
      
      tabBarActiveTintColor: "#00F0FF",
      tabBarInactiveTintColor: "#6E8294",
      headerShown:false,
      
    }}>
    <Tabs.Screen name = "home" options = {{
      title : "Home",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
      ),
    }}/>
    <Tabs.Screen name = "quickcare" options = {{
      title : "QuickCare",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "notifications" : "notifications-outline"} size={size} color={color} />
      ),
    }}/>
    <Tabs.Screen name = "search" options = {{
      title : "Search",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "map" : "map-outline"} size={size} color={color} />
      ),
    }}/>
    <Tabs.Screen name = "emergency" options = {{
      title : "Emergency",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "document-text" : "document-text-outline"} size={size} color={color} />
      ),
    }}/>
    <Tabs.Screen name = "history" options = {{
      title : "History",
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
      ),
    }}/>
  </Tabs>

}