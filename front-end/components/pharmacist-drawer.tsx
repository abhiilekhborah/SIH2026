import { useUser, useAuth } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);

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

  const handleNavigate = (action: string) => {
    onClose();
    if (action === 'profile') {
      router.navigate('/(tab3)/profile3' as any);
    } else if (action === 'home') {
      router.navigate('/(tab3)/home3' as any);
    } else if (action === 'prescription') {
      router.navigate('/(tab3)/prescription' as any);
    } else {
      Alert.alert(action, `${action} section will be available soon.`);
    }
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

  const userName = user?.fullName || user?.firstName || 'Pharmacist';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'pharmacist@mediquick.com';

  // Matches the wireframe drawer items: Profile, Gallery, Health Analysis, Referrals, About Us, Contact Us, Settings
  const menuItems = [
    { id: 'profile', title: 'Profile', icon: 'person-outline' as const, action: 'profile' },
    { id: 'gallery', title: 'Gallery', icon: 'images-outline' as const, action: 'Gallery' },
    { id: 'health_analysis', title: 'Health Analysis', icon: 'analytics-outline' as const, action: 'Health Analysis' },
    { id: 'referrals', title: 'Referrals', icon: 'people-outline' as const, action: 'Referrals' },
    { id: 'about_us', title: 'About Us', icon: 'information-circle-outline' as const, action: 'About Us' },
    { id: 'contact_us', title: 'Contact Us', icon: 'call-outline' as const, action: 'Contact Us' },
    { id: 'settings', title: 'Settings', icon: 'settings-outline' as const, action: 'Settings' },
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
            intensity={100}
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
            <View style={styles.avatarContainer}>
              <Ionicons name="medkit" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.roleTag}>Pharmacist • MediQuick</Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userEmail}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Navigation Items */}
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.action)}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={20} color="#1A66E8" />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" style={styles.chevron} />
              </TouchableOpacity>
            ))}
          </View>

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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 28,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1A66E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A66E8',
    marginTop: 1,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  menuList: {
    flex: 1,
    marginTop: 20,
    gap: 6,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  chevron: {
    marginLeft: 'auto',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 24,
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
