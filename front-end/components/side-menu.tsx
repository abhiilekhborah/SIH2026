import { useUser, useAuth } from '@clerk/expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
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

export interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function SideMenu({ visible, onClose }: SideMenuProps) {
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

  const handleNavigate = (path: string) => {
    onClose();
    // navigate() reuses the screen if it is already in the stack; push() would
    // stack a new copy every time the menu is used.
    router.navigate(path as any);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
    router.replace('/');
  };

  const userName = user?.fullName || user?.firstName || 'User';
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'user@mediquick.com';

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
          {/* Header section with User Profile */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userEmail}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Navigation Items */}
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/home')}
            >
              <Ionicons name="home-outline" size={22} color="#1A66E8" />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/quickcare')}
            >
              <Ionicons name="notifications-outline" size={22} color="#1A66E8" />
              <Text style={styles.menuText}>QuickCare</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/emergency')}
            >
              <Ionicons name="map-outline" size={22} color="#1A66E8" />
              <Text style={styles.menuText}>Emergency</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/history')}
            >
              <Ionicons name="document-text-outline" size={22} color="#1A66E8" />
              <Text style={styles.menuText}>Medical History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/profile')}
            >
              <Ionicons name="person-outline" size={22} color="#1A66E8" />
              <Text style={styles.menuText}>Profile & Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A66E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
  },
  menuList: {
    flex: 1,
    marginTop: 24,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
