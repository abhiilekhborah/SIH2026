import { useSideMenu } from '@/components/side-menu-context';
import { useAuth, useUser } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { openMenu } = useSideMenu();
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const userName = user?.fullName || user?.firstName || 'Arjun Sharma';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={styles.headerSubtitle}>Manage your health journey</Text>
            <Ionicons name="heart-outline" size={14} color="#6366f1" style={{ marginLeft: 4 }} />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
            <Ionicons name="settings-outline" size={26} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <LinearGradient
          colors={['#f3f0ff', '#e0e7ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardContainer}
        >
          <View style={styles.cardTopRow}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image 
                source={require('../../assets/images/pharma.png')} 
                style={styles.avatarImage} 
              />
              <View style={styles.avatarBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
              </View>
            </View>

            {/* Info */}
            <View style={styles.userInfoContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.userNameText}>{userName}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#6366f1" style={{ marginLeft: 6 }} />
              </View>
              <View style={styles.patientIdBadge}>
                <Text style={styles.patientIdText}>Patient ID: PAT-78291</Text>
              </View>
              <View style={styles.quoteRow}>
                <Text style={styles.quoteIcon}>❝</Text>
                <Text style={styles.quoteText}>
                  Taking small steps today for a healthier tomorrow. 🌿
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Strip */}
          <View style={styles.statsStrip}>
            <StatItem icon="calendar" iconColor="#8b5cf6" iconBg="#f3e8ff" label="Member Since" value="May 2024" />
            <StatItem icon="heart" iconColor="#10b981" iconBg="#d1fae5" label="Health Score" value="92/100" />
            <StatItem icon="shield-checkmark" iconColor="#3b82f6" iconBg="#dbeafe" label="Health Plan" value="Premium" />
            <StatItem icon="star" iconColor="#f59e0b" iconBg="#fef3c7" label="Rewards" value="1,250 pts" />
          </View>
        </LinearGradient>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>General</Text>
          <OptionItem icon="person-outline" iconBg="#eff6ff" iconColor="#3b82f6" title="Personal Information" />
          <OptionItem icon="document-text-outline" iconBg="#f3e8ff" iconColor="#a855f7" title="Medical History" />
          <OptionItem icon="notifications-outline" iconBg="#fef3c7" iconColor="#f59e0b" title="Notifications" />
          <OptionItem icon="lock-closed-outline" iconBg="#d1fae5" iconColor="#10b981" title="Privacy & Security" />
          
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>More</Text>
          <OptionItem icon="help-circle-outline" iconBg="#f3f4f6" iconColor="#6b7280" title="Help & Support" />
          <OptionItem icon="settings-outline" iconBg="#f3f4f6" iconColor="#6b7280" title="Settings" />
          <OptionItem 
            icon="log-out-outline" 
            iconBg="#fee2e2" 
            iconColor="#ef4444" 
            title="Log Out" 
            onPress={handleSignOut}
            hideChevron
          />
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ icon, iconColor, iconBg, label, value }: { icon: any, iconColor: string, iconBg: string, label: string, value: string }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: icon === 'heart' ? '#10b981' : '#111827' }]}>{value}</Text>
      </View>
    </View>
  );
}

function OptionItem({ icon, iconColor, iconBg, title, onPress, hideChevron }: { icon: any, iconColor: string, iconBg: string, title: string, onPress?: () => void, hideChevron?: boolean }) {
  return (
    <TouchableOpacity style={styles.optionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.optionLeft}>
        <View style={[styles.optionIconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={[styles.optionTitle, hideChevron && { color: iconColor }]}>{title}</Text>
      </View>
      {!hideChevron && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  headerLeft: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  cardContainer: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  cardTopRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  patientIdBadge: {
    backgroundColor: '#ede9fe',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  patientIdText: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: '700',
  },
  quoteRow: {
    flexDirection: 'row',
  },
  quoteIcon: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '800',
    marginRight: 4,
    marginTop: -2,
  },
  quoteText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  optionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
});
