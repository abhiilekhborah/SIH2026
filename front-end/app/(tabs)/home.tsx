import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import { useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const userName = user?.firstName || user?.fullName || 'User';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="MediQuick"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        badgeCount={3}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeBanner}>
          {showWelcome && (
            <>
              <Text style={styles.greetingText}>Hello, {userName} 👋</Text>
              <Text style={styles.bannerTitle}>How are you feeling today?</Text>
            </>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#6B7280"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, hospitals, services..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.actionButton}
            >
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.grid}>
          {/* Appointments */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: '#E0F2FE' },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color="#0284C7"
                />
              </View>

              <View style={styles.arrowButton}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </View>

            <Text style={styles.cardTitle}>Appointments</Text>
            <Text style={styles.cardSubtitle}>Schedule visit</Text>
          </TouchableOpacity>

          {/* Consultation */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: '#FEE2E2' },
                ]}
              >
                <Ionicons
                  name="medical-outline"
                  size={24}
                  color="#DC2626"
                />
              </View>

              <View style={styles.arrowButton}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </View>

            <Text style={styles.cardTitle}>Connect to doctor</Text>
            <Text style={styles.cardSubtitle}>Consult now</Text>
          </TouchableOpacity>

          {/* Health Stats */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: '#DCFCE7' },
                ]}
              >
                <Ionicons
                  name="fitness-outline"
                  size={24}
                  color="#16A34A"
                />
              </View>

              <View style={styles.arrowButton}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </View>

            <Text style={styles.cardTitle}>Pharmacy Services</Text>
            <Text style={styles.cardSubtitle}>Medicines delivered to your doorstep</Text>
          </TouchableOpacity>

          {/* Records */}
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: '#F3E8FF' },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#9333EA"
                />
              </View>

              <View style={styles.arrowButton}>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#2563EB"
                />
              </View>
            </View>

            <Text style={styles.cardTitle}>Nearby Hospital</Text>
            <Text style={styles.cardSubtitle}>Emergency and appointments</Text>
          </TouchableOpacity>
        </View>

        {/* Risk Section Header */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Risk</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="chevron-forward" size={14} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Risk Card */}
        <TouchableOpacity style={styles.fullWidthCard} activeOpacity={0.8}>
          <View style={styles.cardTop}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning-outline" size={24} color="#DC2626" />
            </View>
            <View style={styles.arrowButton}>
              <Ionicons name="arrow-forward" size={16} color="#2563EB" />
            </View>
          </View>
          <Text style={styles.cardTitle}>Health Assessment Risk</Text>
          <Text style={styles.cardSubtitle}>You have a new alert based on your recent activity. Please review your risk factors.</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  welcomeBanner: {
    backgroundColor: '#dadadaff',
    minHeight: 160,
    width: '100%',
    borderRadius: 16,
    padding: 24,
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },

  greetingText: {
    fontSize: 14,
    color: '#02346cff',
    fontWeight: '600',
    marginBottom: 4,
  },

  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2045ffff',
    lineHeight: 28,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 24,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111827',
  },

  actionButton: {
    padding: 4,
  },

  /* Quick Actions Header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  /* Cards */
  fullWidthCard: {
    width: '100%',
    backgroundColor: '#cae4ffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00236aff',
    boxShadow: '0 3px 5px rgba(0, 47, 121, 1)',
  },

  card: {
    width: '48%',
    height: 170,
    backgroundColor: '#cae4ffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#00236aff',
    boxShadow: '0 3px 5px rgba(0, 47, 121, 1)',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },

  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
});
