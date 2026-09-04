import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const TEAL = '#00B5AD';

function InfoCard({ icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={22} color={TEAL} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Light gradient backdrop */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="About Us"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        style={styles.header}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="medkit" size={40} color={TEAL} />
          </View>
          <Text style={styles.appName}>MediQuick</Text>
          <Text style={styles.tagline}>Your trusted healthcare companion</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0  •  SIH 2026</Text>
          </View>
        </View>

        {/* About cards */}
        <Text style={styles.sectionTitle}>What we do</Text>
        <InfoCard icon="flash-outline"     title="Emergency SOS"       text="Instantly connect to emergency services and nearby hospitals with a single tap." />
        <InfoCard icon="videocam-outline"  title="Video Consultations"  text="Consult certified doctors from the comfort of your home, anytime." />
        <InfoCard icon="document-text-outline" title="Digital Records"  text="Securely store and access prescriptions, lab reports, and medical history." />
        <InfoCard icon="sparkles-outline"  title="AI Health Assistant"  text="Get instant AI-powered guidance for symptoms, medications, and more." />
        <InfoCard icon="people-outline"    title="Community Care"       text="Refer friends and earn health rewards while expanding our care network." />

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: '#F0FAFA' },
  bgLight:    { ...StyleSheet.absoluteFillObject, backgroundColor: '#F0FAFA' },
  bgTealTop:  { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,181,173,0.12)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  header:     { backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  heroCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 28, marginBottom: 24 },
  heroIconWrap: { width: 76, height: 76, borderRadius: 24, backgroundColor: 'rgba(0,181,173,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: 'rgba(0,181,173,0.20)' },
  appName:  { fontSize: 26, fontWeight: '800', color: '#0D3349', letterSpacing: 0.3, marginBottom: 4 },
  tagline:  { fontSize: 14, color: '#4A7080', fontWeight: '500', marginBottom: 12 },
  versionBadge: { backgroundColor: 'rgba(0,181,173,0.10)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(0,181,173,0.20)' },
  versionText: { fontSize: 12, color: TEAL, fontWeight: '600' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0D3349', marginBottom: 12, letterSpacing: 0.2 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 16, marginBottom: 10, gap: 14 },
  infoIconWrap: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(0,181,173,0.10)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', flexShrink: 0 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#0D3349', marginBottom: 3 },
  infoText:  { fontSize: 12, color: '#4A7080', lineHeight: 18 },
});
