import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  Alert,
  ImageBackground,
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
  const { user } = useUser();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const userName = user?.firstName || user?.fullName || 'User';

  const handleOpenNotifications = () => {
    Alert.alert('Notifications', 'You have 3 new health updates');
    if (unreadNotifications > 0) {
      setUnreadNotifications(0);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <AppHeader
        title="MediQuick"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={handleOpenNotifications}
        badgeCount={unreadNotifications}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <ImageBackground
          source={require('../../assets/images/Untitled design.png')}
          style={styles.welcomeBanner}
          imageStyle={styles.welcomeBannerImage}
        >
          <Text style={styles.greetingText}>Hello, {userName} 👋</Text>
          <Text style={styles.bannerTitle}>How are you feeling today?</Text>
        </ImageBackground>

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

          <TouchableOpacity
            style={styles.viewAllButton}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#2563EB"
            />
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => router.push('/(tabs)/consultation' as any)}>
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

            <Text style={styles.cardTitle}>Consultation</Text>
            <Text style={styles.cardSubtitle}>Talk to doctor</Text>
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

            <Text style={styles.cardTitle}>Health Stats</Text>
            <Text style={styles.cardSubtitle}>Track metrics</Text>
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

            <Text style={styles.cardTitle}>Records</Text>
            <Text style={styles.cardSubtitle}>View history</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 24,
  },

  welcomeBanner: {
    backgroundColor: '#99befdff',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },

  welcomeBannerImage: {
    borderRadius: 16,
    resizeMode: 'cover',
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
