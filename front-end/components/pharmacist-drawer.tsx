import { useUser, useAuth } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export interface PharmacistDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function PharmacistDrawer({ visible, onClose }: PharmacistDrawerProps) {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = (path: string) => {
    onClose();
    router.navigate(path as any);
  };

  const handleSignOut = async () => {
    onClose();
    try {
      await signOut();
      router.replace('/');
    } catch (e) {
      router.replace('/');
    }
  };

  const userName = user?.fullName || user?.firstName || 'Dr. Rajesh Mehta';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'rajesh.pharma@mediquick.com';

  const menuItems = [
    { id: 'profile', title: 'Profile & Dispensary', icon: 'person-outline' as const, path: '/(tab3)/profile3' },
    { id: 'gallery', title: 'Gallery & Licences', icon: 'images-outline' as const, path: '/(tab3)/gallery' },
    { id: 'health_analysis', title: 'Health Analysis', icon: 'analytics-outline' as const, path: '/(tab3)/health-analysis' },
    { id: 'referrals', title: 'Doctor Referrals', icon: 'people-outline' as const, path: '/(tab3)/referrals' },
    { id: 'about_us', title: 'About MediQuick', icon: 'information-circle-outline' as const, path: '/(tab3)/about-us' },
    { id: 'contact_us', title: 'Contact Support', icon: 'call-outline' as const, path: '/(tab3)/contact-us' },
    { id: 'settings', title: 'Store Settings', icon: 'settings-outline' as const, path: '/(tab3)/settings' },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        {/* Blurred Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        {/* Sliding Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* Header section with Pharmacist Profile */}
          <View style={styles.header}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarContainer}>
                <Ionicons name="medkit" size={24} color="#FFFFFF" />
              </View>
              <TouchableOpacity
                onPress={() => setIsOnline(!isOnline)}
                style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}
                activeOpacity={0.8}
              >
                <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
                <Text style={[styles.statusText, isOnline ? styles.textOnline : styles.textOffline]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.roleTag}>Registered Pharmacist • R.Ph 2024</Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userEmail}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Navigation Items */}
          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuList}
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.path)}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={19} color="#1A66E8" />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer Section */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A66E8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A66E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 6,
  },
  statusOnline: {
    backgroundColor: '#DCFCE7',
  },
  statusOffline: {
    backgroundColor: '#F1F5F9',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotOnline: {
    backgroundColor: '#16A34A',
  },
  dotOffline: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textOnline: {
    color: '#15803D',
  },
  textOffline: {
    color: '#64748B',
  },
  userInfo: {
    marginTop: 2,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  roleTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A66E8',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  menuScroll: {
    flex: 1,
    marginVertical: 12,
  },
  menuList: {
    paddingVertical: 6,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  badgeContainer: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  chevron: {
    marginLeft: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
});
