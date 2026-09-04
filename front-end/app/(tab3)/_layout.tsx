import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { PharmacistDrawer } from '@/components/pharmacist-drawer';
import { SideMenuContext } from '@/components/side-menu-context';
import { PharmacyStoreProvider } from '@/lib/pharmacy-store';

export default function Tab3Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <PharmacyStoreProvider>
      <SideMenuContext.Provider value={{ openMenu: () => setIsMenuOpen(true) }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#1A66E8',
            tabBarInactiveTintColor: '#94A3B8',
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarItemStyle: styles.tabBarItem,
          }}
        >
          {/* 1. Home Tab */}
          <Tabs.Screen
            name="home3"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'home' : 'home-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />

          {/* 2. Prescription Tab */}
          <Tabs.Screen
            name="prescription"
            options={{
              title: 'Prescriptions',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'document-text' : 'document-text-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />

          {/* 3. Inventory Tab - Prominent & Bigger */}
          <Tabs.Screen
            name="inventory"
            options={{
              title: 'Inventory',
              tabBarLabelStyle: [styles.tabBarLabel, styles.inventoryLabel],
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[
                    styles.inventoryNavIconWrap,
                    focused && styles.inventoryNavIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={focused ? 'cube' : 'cube-outline'}
                    size={24}
                    color={focused ? '#FFFFFF' : '#1A66E8'}
                  />
                </View>
              ),
            }}
          />

          {/* 4. History Tab */}
          <Tabs.Screen
            name="history3"
            options={{
              title: 'History',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'time' : 'time-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />

          {/* 5. Profile Tab */}
          <Tabs.Screen
            name="profile3"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? 'person' : 'person-outline'}
                  size={22}
                  color={color}
                />
              ),
            }}
          />

          {/* Hidden Drawer Pages */}
          <Tabs.Screen
            name="gallery"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="health-analysis"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="referrals"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="about-us"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="contact-us"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="settings"
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
    </PharmacyStoreProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 78 : 66,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  inventoryLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1A66E8',
  },
  tabBarItem: {
    paddingVertical: 3,
  },
  inventoryNavIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    shadowColor: '#1A66E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inventoryNavIconWrapActive: {
    backgroundColor: '#1A66E8',
    borderColor: '#FFFFFF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
});
