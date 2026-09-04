import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import { useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
>>>>>>> dbbc990dbdaad075c587cc2194bee2672c08d3fc
import {
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  // Backgrounds
  bgLight:  '#F0FAFA',
  bgWhite:  '#FFFFFF',

  // Medical teal / cyan
  teal1:   '#00B5AD',
  tealDim: '#E0F7F6',
  tealMid: '#B2EBEA',

  // Medical blue
  blue1:   '#1976D2',
  blueDim: '#E3F2FD',

  // Green
  green1:  '#2E7D32',
  greenDim:'#E8F5E9',

  // Red / alert
  red1:    '#E53935',
  redDim:  '#FFEBEE',

  // Amber
  amber1:  '#F57C00',
  amberDim:'#FFF3E0',

  // Purple
  purple1: '#7B1FA2',
  purpleDim:'#F3E5F5',

  // Glass surfaces (light)
  glassBorder: 'rgba(0,181,173,0.18)',
  glassBg:     'rgba(255,255,255,0.72)',

  // Text
  textPrimary:   '#0D3349',
  textSecondary: '#4A7080',
  textMuted:     '#8AACBA',
};

// ─── Pulse Dot ────────────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.7, duration: 900, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1,   duration: 0,   useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0,   useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);
  return (
    <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 14, height: 14, borderRadius: 7,
        backgroundColor: color, opacity, transform: [{ scale }],
      }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, style, onPress }: {
  children: React.ReactNode; style?: any; onPress?: () => void;
}) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} activeOpacity={0.82} style={[styles.glassCard, style]}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFillObject} />
      <View style={styles.glassInner}>{children}</View>
    </Wrapper>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <View style={styles.statBadge}>
      <Text style={[styles.statValue, { color }]}>{value}
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
<<<<<<< HEAD
  const { openMenu }          = useSideMenu();
  const { openNotifications } = useNotifications();
  const { user }              = useUser();
  const router                = useRouter();

=======
  const { openMenu } = useSideMenu();
  const { user } = useUser();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(3);
>>>>>>> dbbc990dbdaad075c587cc2194bee2672c08d3fc
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;

  const userName = user?.firstName || user?.fullName || 'User';

  const carouselItems = [
    ...(showWelcome ? [{
      id: 'welcome', label: `Hello, ${userName} 👋`,
      title: 'How are you feeling today?', sub: 'Your health journey starts here',
      accent: C.teal1, bg: 'rgba(0,212,200,0.10)', icon: 'heart-outline' as const,
    }] : []),
    { id: 'alert',  label: '⚠️  Health Alert',      title: 'Complete Health Assessment', sub: 'Review your recent risk indicators', accent: C.red1,    bg: 'rgba(255,82,82,0.10)',   icon: 'warning-outline' as const },
    { id: 'report', label: '🔔  Notification',        title: 'Your Report is Ready',      sub: 'Tap to view your latest lab results', accent: C.blue1,  bg: 'rgba(41,121,255,0.10)',  icon: 'document-text-outline' as const },
    { id: 'update', label: '📅  Updates',             title: 'New Features Available',     sub: "Discover what's new in MediQuick",  accent: C.amber1, bg: 'rgba(255,215,64,0.10)', icon: 'sparkles-outline' as const },
  ];

  const quickActions = [
    { id: 'appointments', icon: 'calendar-outline' as const,     label: 'Appointments',   sub: 'Schedule a visit', color: C.teal1,   bg: C.tealDim   },
    { id: 'consult',      icon: 'videocam-outline' as const,      label: 'Consult Doctor', sub: 'Connect now',      color: C.blue1,   bg: C.blueDim   },
    { id: 'pharmacy',     icon: 'medkit-outline' as const,        label: 'Pharmacy',       sub: 'Medicines delivered', color: C.green1, bg: C.greenDim },
    { id: 'hospital',     icon: 'location-outline' as const,      label: 'Nearby Hospital',sub: 'Emergency & visits', color: C.purple1, bg: C.purpleDim},
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => { setShowWelcome(false); }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const n = carouselItems.length;
    const iv = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % n;
        scrollRef.current?.scrollTo({ x: next * (width - 32), animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(iv);
  }, [carouselItems.length]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Light gradient backdrop ── */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      {/* ── Header ── */}
      <AppHeader
        title="MediQuick"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        badgeCount={3}
        style={styles.header}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Hero Vitals Banner ── */}
          <GlassCard style={styles.heroBanner}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroGreeting}>Good evening,</Text>
                <Text style={styles.heroName}>{userName} 👋</Text>
              </View>
              <View style={styles.statusPill}>
                <PulseDot color={C.green1} />
                <Text style={[styles.statusTxt, { color: C.green1 }]}>Healthy</Text>
              </View>
            </View>
            <View style={styles.vitalsRow}>
              <StatBadge label="Heart Rate" value="72"  unit="bpm" color={C.red1}    />
              <View style={styles.vDiv} />
              <StatBadge label="SpO₂"       value="98"  unit="%"   color={C.teal1}   />
              <View style={styles.vDiv} />
              <StatBadge label="Steps"       value="6.2" unit="k"   color={C.green1}  />
              <View style={styles.vDiv} />
              <StatBadge label="Sleep"       value="7.4" unit="h"   color={C.purple1} />
            </View>
          </GlassCard>

          {/* ── Carousel ── */}
          <View style={{ marginBottom: 20 }}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={width - 32}
              decelerationRate="fast"
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                setActiveIndex(idx);
              }}
            >
              {carouselItems.map(item => (
                <GlassCard
                  key={item.id}
                  style={[styles.carouselCard, { width: width - 48, backgroundColor: item.bg }]}
                  onPress={() => {}}
                >
                  <View style={styles.carouselRow}>
                    <View style={[styles.carouselIcon, { borderColor: item.accent }]}>
                      <Ionicons name={item.icon} size={26} color={item.accent} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={[styles.carouselLabel, { color: item.accent }]}>{item.label}</Text>
                      <Text style={styles.carouselTitle}>{item.title}</Text>
                      <Text style={styles.carouselSub}>{item.sub}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={item.accent} />
                  </View>
                </GlassCard>
              ))}
            </ScrollView>
            <View style={styles.dotsRow}>
              {carouselItems.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeIndex === i && [styles.dotActive, { backgroundColor: item.accent }],
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── Search ── */}
          <GlassCard style={styles.searchWrap}>
            <Ionicons name="search-outline" size={20} color={C.textSecondary} style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, services, hospitals…"
              placeholderTextColor={C.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={C.textSecondary} />
              </TouchableOpacity>
            )}
          </GlassCard>

          {/* ── Quick Actions ── */}
          <View style={styles.secHeader}>
            <Text style={styles.secTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.viewAllRow}>
              <Text style={[styles.viewAllTxt, { color: C.teal1 }]}>See all</Text>
              <Ionicons name="chevron-forward" size={14} color={C.teal1} />
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {quickActions.map(a => (
              <GlassCard 
                key={a.id} 
                style={styles.actionCard} 
                onPress={() => router.push(`/(tabs)/${a.id}` as any)}
              >
                <View style={styles.actionTop}>
                  <View style={[styles.actionIconBg, { backgroundColor: a.bg }]}>
                    <Ionicons name={a.icon} size={22} color={a.color} />
                  </View>
                  <View style={[styles.actionArrow, { borderColor: a.color }]}>
                    <Ionicons name="arrow-forward" size={12} color={a.color} />
                  </View>
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
                <Text style={styles.actionSub}>{a.sub}</Text>
                <View style={[styles.glowStrip, { backgroundColor: a.color }]} />
              </GlassCard>
            ))}
          </View>

          {/* ── Health Insights ── */}
          <View style={[styles.secHeader, { marginTop: 28 }]}>
            <Text style={styles.secTitle}>Health Insights</Text>
            <TouchableOpacity style={styles.viewAllRow}>
              <Text style={[styles.viewAllTxt, { color: C.teal1 }]}>View all</Text>
              <Ionicons name="chevron-forward" size={14} color={C.teal1} />
            </TouchableOpacity>
          </View>

          {/* Risk card */}
          <GlassCard style={styles.riskCard} onPress={() => {}}>
            <View style={styles.riskRow}>
              <View style={[styles.riskIconBg, { backgroundColor: C.redDim }]}>
                <Ionicons name="warning-outline" size={24} color={C.red1} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.riskTitle}>Health Assessment Risk</Text>
                  <View style={styles.riskBadge}>
                    <Text style={styles.riskBadgeTxt}>HIGH</Text>
                  </View>
                </View>
                <Text style={styles.riskSub}>New alert based on your recent activity. Please review your risk factors immediately.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.red1} />
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: '72%', backgroundColor: C.red1 }]} />
            </View>
            <View style={styles.barLabels}>
              <Text style={styles.barLabel}>Low</Text>
              <Text style={[styles.barLabel, { color: C.red1, fontWeight: '700' }]}>Risk: 72%</Text>
              <Text style={styles.barLabel}>Critical</Text>
            </View>
            <View style={[styles.glowStrip, { backgroundColor: C.red1 }]} />
          </GlassCard>

          {/* AI care card */}
          <GlassCard style={styles.aiCard} onPress={() => {}}>
            <View style={styles.riskRow}>
              <View style={[styles.riskIconBg, { backgroundColor: C.purpleDim, width: 52, height: 52, borderRadius: 16 }]}>
                <Ionicons name="sparkles-outline" size={26} color={C.purple1} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.aiTitle}>AI Health Assistant</Text>
                <Text style={styles.aiSub}>Ask me anything about your health. Available 24/7.</Text>
              </View>
            </View>
<<<<<<< HEAD
            <View style={styles.aiChip}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={C.purple1} style={{ marginRight: 5 }} />
              <Text style={[styles.aiChipTxt, { color: C.purple1 }]}>Start a conversation →</Text>
=======

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
>>>>>>> dbbc990dbdaad075c587cc2194bee2672c08d3fc
            </View>
            <View style={[styles.glowStrip, { backgroundColor: C.purple1 }]} />
          </GlassCard>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bgLight },

  // Light gradient background layers
  bgLight:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#F0FAFA' },
  bgTealTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,181,173,0.12)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },

  header: { backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 4 },

  // glass cards — light frosted
  glassCard:  { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.glassBorder, backgroundColor: C.glassBg, marginBottom: 14 },
  glassInner: { padding: 18 },

  // hero
  heroBanner:   {},
  heroTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  heroGreeting: { fontSize: 13, color: C.textSecondary, fontWeight: '500', marginBottom: 2 },
  heroName:     { fontSize: 22, fontWeight: '800', color: C.textPrimary, letterSpacing: 0.2 },
  statusPill:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(46,125,50,0.10)', borderWidth: 1, borderColor: 'rgba(46,125,50,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  statusTxt:    { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  vitalsRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,181,173,0.06)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(0,181,173,0.15)' },
  statBadge:    { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  statUnit:     { fontSize: 11, fontWeight: '500', color: C.textSecondary },
  statLabel:    { fontSize: 10, color: C.textMuted, fontWeight: '500', marginTop: 2, textAlign: 'center' },
  vDiv:         { width: 1, height: 32, backgroundColor: 'rgba(0,181,173,0.20)' },

  // carousel
  carouselCard:  { marginRight: 12 },
  carouselRow:   { flexDirection: 'row', alignItems: 'center' },
  carouselIcon:  { width: 50, height: 50, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.60)' },
  carouselLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 },
  carouselTitle: { fontSize: 16, fontWeight: '800', color: C.textPrimary, marginBottom: 3, lineHeight: 22 },
  carouselSub:   { fontSize: 12, color: C.textSecondary, lineHeight: 16 },
  dotsRow:       { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,181,173,0.25)' },
  dotActive:     { width: 18, borderRadius: 3 },

  // search
  searchWrap:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  searchInput: { flex: 1, fontSize: 14, color: C.textPrimary, padding: 0 },

  // section
  secHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  secTitle:   { fontSize: 17, fontWeight: '800', color: C.textPrimary, letterSpacing: 0.2 },
  viewAllRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllTxt: { fontSize: 13, fontWeight: '600' },

  // grid — 2-column for 4 cards
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 0 },
  actionCard:   { width: (width - 44) / 2, minHeight: 140, padding: 0, marginBottom: 0 },
  actionTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14, paddingBottom: 0, marginBottom: 12 },
  actionIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionArrow:  { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.70)' },
  actionLabel:  { fontSize: 13, fontWeight: '700', color: C.textPrimary, paddingHorizontal: 14, marginBottom: 3, lineHeight: 18 },
  actionSub:    { fontSize: 11, color: C.textMuted, paddingHorizontal: 14, paddingBottom: 16, lineHeight: 15 },
  glowStrip:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, opacity: 0.55, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },

  // risk
  riskCard:     { marginBottom: 12 },
  riskRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  riskIconBg:   { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  riskTitle:    { fontSize: 14, fontWeight: '700', color: C.textPrimary },
  riskBadge:    { backgroundColor: 'rgba(229,57,53,0.12)', borderWidth: 1, borderColor: 'rgba(229,57,53,0.30)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  riskBadgeTxt: { fontSize: 9, fontWeight: '800', color: C.red1, letterSpacing: 0.8 },
  riskSub:      { fontSize: 12, color: C.textSecondary, lineHeight: 18 },
  bar:          { height: 6, backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  barFill:      { height: '100%', borderRadius: 3 },
  barLabels:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel:     { fontSize: 10, color: C.textMuted, fontWeight: '500' },

  // ai
  aiCard:    { marginBottom: 12 },
  aiTitle:   { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 4 },
  aiSub:     { fontSize: 12, color: C.textSecondary, lineHeight: 18 },
  aiChip:    { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(123,31,162,0.08)', borderWidth: 1, borderColor: 'rgba(123,31,162,0.20)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 4 },
  aiChipTxt: { fontSize: 12, fontWeight: '600' },
});
