import { AppHeader } from '@/components/app-header';
import { useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { user } = useUser();
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const userName = user?.firstName || user?.fullName || 'User';

  const handleOpenMenu = () => {
    Alert.alert('Menu', 'Side navigation menu opened');
  };

  const handleOpenNotifications = () => {
    Alert.alert('Notifications', 'You have 3 new health updates');
    if (unreadNotifications > 0) {
      setUnreadNotifications(0);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Universal Header with Hamburger on top-left and Notification button aligned */}
      <AppHeader
        title="MediQuick"
        showMenu={true}
        showNotification={true}
        onPressMenu={handleOpenMenu}
        onPressNotification={handleOpenNotifications}
        badgeCount={unreadNotifications}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.greetingText}>Hello, {userName} 👋</Text>
          <Text style={styles.bannerTitle}>How are you feeling today?</Text>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="calendar-outline" size={24} color="#0284C7" />
            </View>
            <Text style={styles.cardTitle}>Appointments</Text>
            <Text style={styles.cardSubtitle}>Schedule visit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="medical-outline" size={24} color="#DC2626" />
            </View>
            <Text style={styles.cardTitle}>Consultation</Text>
            <Text style={styles.cardSubtitle}>Talk to doctor</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="fitness-outline" size={24} color="#16A34A" />
            </View>
            <Text style={styles.cardTitle}>Health Stats</Text>
            <Text style={styles.cardSubtitle}>Track metrics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="document-text-outline" size={24} color="#9333EA" />
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
    backgroundColor: '#1A66E8',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    color: '#93C5FD',
    fontWeight: '600',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
