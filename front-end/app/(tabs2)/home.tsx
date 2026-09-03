import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
  Animated,
  FlatList,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

// Color Palette: White background with warm blue components
const COLORS = {
  white: '#FFFFFF',
  background: '#FFFFFF',
  primaryBlue: '#1A66E8',
  primaryBlueLight: '#EFF6FF',
  textDark: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFF7E8',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
};

// --- Mock Data ---
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'New Appointment Request', message: 'Riya Sharma requested an appointment.', time: '10 mins ago' },
  { id: '2', title: 'New Referral Request', message: 'Dr. Bose referred a patient.', time: '1 hour ago' },
  { id: '3', title: 'Weekly Shift Assigned', message: 'You have been assigned to ED on Friday.', time: '2 hours ago' },
];

const MOCK_ALERTS = [
  { id: '1', title: 'Next Appointment', message: 'In 15 mins with Raj Patel', type: 'info', icon: 'time-outline' },
  { id: '2', title: 'Emergency Message', message: 'Code Blue in Ward A', type: 'danger', icon: 'warning-outline' },
  { id: '3', title: 'Prescription Review', message: '2 pending reviews', type: 'warning', icon: 'document-text-outline' },
];

const MOCK_CONNECTIONS = [
  { id: '1', name: 'Amit Kumar', age: 29, condition: 'General Checkup' },
  { id: '2', name: 'Priya Das', age: 41, condition: 'Diabetes Follow-up' },
];

const MOCK_RECORDS = [
  { id: '1', name: 'Raj Patel', age: 45, risk: 'High', lastVisit: 'Today' },
  { id: '2', name: 'Sneha Gupta', age: 32, risk: 'Low', lastVisit: 'Yesterday' },
  { id: '3', name: 'Vikram Singh', age: 58, risk: 'Medium', lastVisit: '3 days ago' },
];

const MOCK_REFERRALS = [
  { id: '1', name: 'Dr. Priya Nair', specialty: 'Neurology' },
  { id: '2', name: 'Dr. Ananya Bose', specialty: 'Endocrinology' },
];

const MOCK_SCHEDULE = [
  { day: 'Mon', status: 'Assigned', time: '09:00 AM - 05:00 PM' },
  { day: 'Tue', status: 'Assigned', time: '09:00 AM - 05:00 PM' },
  { day: 'Wed', status: 'Free', time: '' },
  { day: 'Thu', status: 'Assigned', time: '10:00 AM - 06:00 PM' },
  { day: 'Fri', status: 'Free', time: '' },
  { day: 'Sat', status: 'Free', time: '' },
  { day: 'Sun', status: 'Free', time: '' },
];

const SCHEDULE_DETAILS: Record<string, any[]> = {
  'Mon': [{ id: '1', time: '09:00 AM - 12:00 PM', task: 'OPD Consultations' }, { id: '2', time: '01:00 PM - 05:00 PM', task: 'Surgery Ward' }],
  'Tue': [{ id: '1', time: '09:00 AM - 05:00 PM', task: 'General Ward Rounds' }],
  'Wed': [],
  'Thu': [{ id: '1', time: '10:00 AM - 06:00 PM', task: 'Research / Admin' }],
  'Fri': [],
  'Sat': [],
  'Sun': [],
};

const MOCK_STAFF = [
  { id: '1', name: 'Sarah Connor', role: 'Head Nurse' },
  { id: '2', name: 'John Smith', role: 'Pharmacist' },
  { id: '3', name: 'Dr. Emily Chen', role: 'Doctor' },
  { id: '4', name: 'Mike Ross', role: 'Receptionist' },
];

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  // Profile Info
  const userName = `Dr. ${user?.firstName || 'Sajibur Rahman'}`;
  const userAvatar = user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
  const clinicName = 'City General Hospital';

  const [menuVisible, setMenuVisible] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Available');

  // Modals state
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [requestsVisible, setRequestsVisible] = useState(false);
  const [referralsVisible, setReferralsVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [staffVisible, setStaffVisible] = useState(false);
  const [quickRecordsVisible, setQuickRecordsVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);

  // Selected schedule day state
  const [selectedScheduleDay, setSelectedScheduleDay] = useState('Mon');

  // Animation for left-side sidebar drawer
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 220,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>{title}</Text>
      <Pressable onPress={onClose} style={styles.modalCloseBtn}>
        <Ionicons name="close" size={24} color={COLORS.textDark} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.iconButton} onPress={openMenu}>
              <Ionicons name="menu-outline" size={26} color={COLORS.primaryBlue} />
            </Pressable>
            <View style={styles.brandContainer}>
              <Ionicons name="pulse" size={22} color={COLORS.primaryBlue} />
              <Text style={styles.brandText}>MediQuick</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Pressable style={styles.notificationButton} onPress={() => setNotificationsVisible(true)}>
              <Ionicons name="notifications" size={24} color={COLORS.primaryBlue} />
              <View style={styles.notificationBadge} />
            </Pressable>
          </View>
        </View>

        <View style={styles.centerContainer}>
          {/* Alerts Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Quick Alerts</Text>
              <Text style={styles.sectionSubtitle}>Urgent updates and priorities</Text>
            </View>
          </View>

          {MOCK_ALERTS.map((alert) => {
            const bgColor = alert.type === 'danger' ? COLORS.dangerLight : alert.type === 'warning' ? COLORS.warningLight : COLORS.primaryBlueLight;
            const color = alert.type === 'danger' ? COLORS.danger : alert.type === 'warning' ? COLORS.warning : COLORS.primaryBlue;
            return (
              <View key={alert.id} style={[styles.alertCard, { backgroundColor: bgColor }]}>
                <View style={[styles.alertIconWrapper, { backgroundColor: color }]}>
                  {/* @ts-ignore */}
                  <Ionicons name={alert.icon} size={20} color={COLORS.white} />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[styles.alertTitle, { color: color }]}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
              </View>
            );
          })}

          {/* Horizontal Quick Actions */}
          <View style={styles.horizontalActionsContainer}>
            <Pressable style={styles.horizontalActionItem} onPress={() => setQuickRecordsVisible(true)}>
              <Ionicons name="document-text" size={20} color={COLORS.primaryBlue} />
              <Text style={styles.horizontalActionText}>Quick Records</Text>
            </Pressable>

            {(() => {
              const getStatusColors = (status: string) => {
                switch (status) {
                  case 'Available': return { bg: COLORS.successLight, text: COLORS.success, border: COLORS.success };
                  case 'Unavailable': return { bg: COLORS.border, text: COLORS.textSecondary, border: COLORS.textSecondary };
                  case 'Emergency': return { bg: COLORS.dangerLight, text: COLORS.danger, border: COLORS.danger };
                  case 'Busy': return { bg: COLORS.warningLight, text: COLORS.warning, border: COLORS.warning };
                  default: return { bg: COLORS.white, text: COLORS.textDark, border: COLORS.border };
                }
              };
              const statusColors = getStatusColors(currentStatus);
              return (
                <Pressable
                  style={[styles.horizontalActionItem, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}
                  onPress={() => setStatusVisible(true)}
                >
                  <Text style={[styles.horizontalActionText, { color: statusColors.text }]}>Status: {currentStatus}</Text>
                </Pressable>
              );
            })()}
          </View>

          {/* Dashboard Modules Grid */}
          <View style={styles.quickActionsGrid}>

            <Pressable style={styles.quickActionItem} onPress={() => setRequestsVisible(true)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.primaryBlueLight }]}>
                <Ionicons name="people" size={24} color={COLORS.primaryBlue} />
              </View>
              <Text style={styles.actionTitle}>Requests</Text>
              <Text style={styles.actionSubtitle}>Connections</Text>
            </Pressable>

            <Pressable style={styles.quickActionItem} onPress={() => setReferralsVisible(true)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.warningLight }]}>
                <Ionicons name="git-network" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.actionTitle}>Referrals</Text>
              <Text style={styles.actionSubtitle}>Incoming / Ask</Text>
            </Pressable>

            <Pressable style={styles.quickActionItem} onPress={() => setScheduleVisible(true)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.successLight }]}>
                <Ionicons name="calendar" size={24} color={COLORS.success} />
              </View>
              <Text style={styles.actionTitle}>Schedule</Text>
              <Text style={styles.actionSubtitle}>Routine</Text>
            </Pressable>

            <Pressable style={styles.quickActionItem} onPress={() => setStaffVisible(true)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: COLORS.dangerLight }]}>
                <Ionicons name="people" size={24} color={COLORS.danger} />
              </View>
              <Text style={styles.actionTitle}>Staff</Text>
              <Text style={styles.actionSubtitle}>Directory</Text>
            </Pressable>
            <Pressable style={styles.quickActionItem} onPress={() => router.push('/(tabs2)/consultation' as any)}>
              <View style={[styles.actionIconWrapper, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="videocam" size={24} color="#0284C7" />
              </View>
              <Text style={styles.actionTitle}>Teleconsult</Text>
              <Text style={styles.actionSubtitle}>Video / Voice</Text>
            </Pressable>

          </View>
        </View>
      </ScrollView>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* Notifications Modal */}
      <Modal visible={notificationsVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ModalHeader title="Notifications" onClose={() => setNotificationsVisible(false)} />
          <FlatList
            data={MOCK_NOTIFICATIONS}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemTitle}>{item.title}</Text>
                  <Text style={styles.listItemSub}>{item.message}</Text>
                  <Text style={[styles.listItemSub, { fontSize: 11, marginTop: 4, color: COLORS.primaryBlue }]}>{item.time}</Text>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Status Modal */}
      <Modal visible={statusVisible} animationType="fade" transparent={true}>
        <View style={styles.overlayCenter}>
          <View style={styles.popupContainer}>
            <Text style={styles.modalTitle}>Set Status</Text>
            {['Available', 'Unavailable', 'Emergency', 'Busy'].map((st) => (
              <Pressable
                key={st}
                style={[styles.statusOption, currentStatus === st && styles.statusOptionActive]}
                onPress={() => { setCurrentStatus(st); setStatusVisible(false); }}
              >
                <Text style={[styles.statusText, currentStatus === st && styles.statusTextActive]}>{st}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.closePopupBtn} onPress={() => setStatusVisible(false)}>
              <Text style={styles.closePopupText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Quick Records Modal */}
      <Modal visible={quickRecordsVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ModalHeader title="Patient Records" onClose={() => setQuickRecordsVisible(false)} />
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            <Text style={styles.sectionSubtitle}>Assigned Patients Overview</Text>
          </View>
          <FlatList
            data={MOCK_RECORDS}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const riskColor = item.risk === 'High' ? COLORS.danger : item.risk === 'Medium' ? COLORS.warning : COLORS.success;
              return (
                <View style={styles.listItem}>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{item.name}</Text>
                    <Text style={styles.listItemSub}>Age: {item.age} · Last Visit: {item.lastVisit}</Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
                    <Text style={[styles.riskBadgeText, { color: riskColor }]}>{item.risk} Risk</Text>
                  </View>
                </View>
              )
            }}
          />
        </SafeAreaView>
      </Modal>

      {/* Connection Requests Modal */}
      <Modal visible={requestsVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ModalHeader title="Connection Requests" onClose={() => setRequestsVisible(false)} />
          <FlatList
            data={MOCK_CONNECTIONS}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSub}>Age: {item.age} · {item.condition}</Text>
                </View>
                <View style={styles.actionButtonsRow}>
                  <Pressable style={[styles.actionBtn, styles.rejectBtn]}>
                    <Text style={styles.rejectBtnText}>Decline</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, styles.acceptBtn]}>
                    <Text style={styles.acceptBtnText}>Connect</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* Referrals Modal */}
      <Modal visible={referralsVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ModalHeader title="Referrals" onClose={() => setReferralsVisible(false)} />
          <ScrollView contentContainerStyle={styles.modalList}>
            <Text style={styles.sectionTitle}>Incoming Referrals</Text>
            {MOCK_REFERRALS.map(item => (
              <View style={styles.listItem} key={`in-${item.id}`}>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSub}>{item.specialty} sent a patient</Text>
                </View>
                <Pressable style={[styles.actionBtn, styles.acceptBtn]}>
                  <Text style={styles.acceptBtnText}>Review</Text>
                </Pressable>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Ask a Referral</Text>
            {MOCK_REFERRALS.map(item => (
              <View style={styles.listItem} key={`ask-${item.id}`}>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSub}>{item.specialty}</Text>
                </View>
                <Pressable style={[styles.actionBtn, styles.primaryBtn]}>
                  <Text style={styles.primaryBtnText}>Ask</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Schedule Modal */}
      <Modal visible={scheduleVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ModalHeader title="Routine Schedule" onClose={() => setScheduleVisible(false)} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.scheduleTopSection}>
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <Text style={styles.sectionSubtitle}>Your assignments for today</Text>
              {SCHEDULE_DETAILS['Mon']?.length > 0 ? (
                SCHEDULE_DETAILS['Mon'].map(detail => (
                  <View key={detail.id} style={styles.routineCard}>
                    <Text style={styles.routineTime}>{detail.time}</Text>
                    <Text style={styles.routineTask}>{detail.task}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.freeDayText}>No assignments. Free day!</Text>
              )}
            </View>

            <View style={styles.scheduleBottomSection}>
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Weekly Routine</Text>
              <View style={styles.timetableContainer}>
                {MOCK_SCHEDULE.map((item, index) => (
                  <View key={item.day} style={[styles.timetableRow, index === MOCK_SCHEDULE.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.timetableDayCol}>
                      <Text style={styles.timetableDayText}>{item.day}</Text>
                    </View>
                    <View style={styles.timetableStatusCol}>
                      <View style={[styles.timetableBadge, { backgroundColor: item.status === 'Free' ? COLORS.successLight : COLORS.primaryBlueLight }]}>
                        <Text style={[styles.timetableBadgeText, { color: item.status === 'Free' ? COLORS.success : COLORS.primaryBlue }]}>{item.status}</Text>
                      </View>
                    </View>
                    <View style={styles.timetableTimeCol}>
                      <Text style={styles.timetableTimeText}>{item.time || 'Off'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Staff Modal */}
      <Modal visible={staffVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <ModalHeader title="Hospital Staff" onClose={() => setStaffVisible(false)} />
          <FlatList
            data={MOCK_STAFF}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={styles.staffAvatar}>
                  <Ionicons name="person" size={18} color={COLORS.primaryBlue} />
                </View>
                <View style={styles.listItemInfo}>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemSub}>{item.role}</Text>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>


      {/* Settings / Shortcuts Sidebar Drawer (Left-Side Modal taking 75% width) */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop (closes menu when clicked) */}
          <Pressable style={styles.modalBackdrop} onPress={closeMenu} />

          {/* Drawer container */}
          <Animated.View
            style={[
              styles.sidebarDrawer,
              {
                width: DRAWER_WIDTH,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Header / Profile card inside drawer */}
            <View style={styles.drawerHeader}>
              <Image source={{ uri: userAvatar }} style={styles.drawerAvatar} />
              <Text style={styles.drawerName}>{userName}</Text>
              <Text style={styles.drawerEmail}>{user?.primaryEmailAddress?.emailAddress || 'Doctor Profile'}</Text>
              <View style={styles.drawerClinicRow}>
                <Ionicons name="business" size={16} color={COLORS.primaryBlue} />
                <Text style={styles.drawerClinic}>{clinicName}</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.drawerMenu}>
              <Pressable style={styles.drawerItem} onPress={closeMenu}>
                <Ionicons name="flame-sharp" size={22} color={COLORS.danger} style={styles.drawerIcon} />
                <Text style={[styles.drawerText, { color: COLORS.danger, fontWeight: '700' }]}>SOS Emergency</Text>
              </Pressable>

              <Pressable style={styles.drawerItem} onPress={closeMenu}>
                <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.primaryBlue} style={styles.drawerIcon} />
                <Text style={styles.drawerText}>Quick Chat</Text>
              </Pressable>

              <Pressable style={styles.drawerItem} onPress={closeMenu}>
                <Ionicons name="settings-outline" size={22} color={COLORS.primaryBlue} style={styles.drawerIcon} />
                <Text style={styles.drawerText}>App Settings</Text>
              </Pressable>

              <View style={styles.drawerDivider} />

              <Pressable style={styles.drawerItem} onPress={closeMenu}>
                <Ionicons name="help-circle-outline" size={22} color={COLORS.textSecondary} style={styles.drawerIcon} />
                <Text style={styles.drawerText}>Help & Support</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryBlue,
    letterSpacing: -0.5,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBlue,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Alert Cards
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    color: COLORS.textDark,
  },

  horizontalActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
    marginTop: 10,
  },
  horizontalActionItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    flexShrink: 1,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    width: '48%',
    borderRadius: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  actionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Modal List Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalList: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  listItemSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: COLORS.dangerLight,
  },
  rejectBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
  acceptBtn: {
    backgroundColor: COLORS.successLight,
  },
  acceptBtnText: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryBlue,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },

  // Status Modal Center Overlay
  overlayCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  popupContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  statusOption: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    alignItems: 'center',
  },
  statusOptionActive: {
    backgroundColor: COLORS.primaryBlueLight,
    borderColor: COLORS.primaryBlue,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statusTextActive: {
    color: COLORS.primaryBlue,
  },
  closePopupBtn: {
    marginTop: 10,
    paddingVertical: 10,
  },
  closePopupText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },

  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  scheduleTopSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  routineCard: {
    backgroundColor: COLORS.primaryBlueLight,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryBlue,
  },
  routineTime: {
    fontSize: 13,
    color: COLORS.primaryBlue,
    fontWeight: '700',
    marginBottom: 4,
  },
  routineTask: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  freeDayText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '600',
  },
  scheduleBottomSection: {
    padding: 20,
  },
  daySelector: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    alignItems: 'center',
  },
  daySelectorActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  daySelectorText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  daySelectorTextActive: {
    color: COLORS.white,
  },
  dayStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },

  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBlueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  // Left-Side Drawer Styles
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sidebarDrawer: {
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24,
  },
  drawerHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
    marginBottom: 20,
  },
  drawerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.primaryBlue,
    marginBottom: 12,
  },
  drawerName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  drawerEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  drawerClinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  drawerClinic: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryBlue,
  },
  drawerMenu: {
    flex: 1,
    gap: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  drawerIcon: {
    marginRight: 12,
  },
  drawerText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  timetableContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  timetableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timetableDayCol: {
    width: 50,
  },
  timetableDayText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  timetableStatusCol: {
    width: 80,
    alignItems: 'flex-start',
  },
  timetableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timetableBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timetableTimeCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timetableTimeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
