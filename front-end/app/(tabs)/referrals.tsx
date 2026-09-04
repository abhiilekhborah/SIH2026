import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const TEAL = '#00B5AD';

export default function ReferralsScreen() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="Referrals"
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
            <Ionicons name="gift" size={38} color={TEAL} />
          </View>
          <Text style={styles.heroTitle}>Refer & Earn</Text>
          <Text style={styles.heroSub}>Invite friends and family to MediQuick{'\n'}and earn health rewards together.</Text>
          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={14} color="#F57C00" />
            <Text style={styles.rewardText}>Earn 500 pts per referral</Text>
          </View>
        </View>

        {/* Referral code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeValue}>MQ-ARJUN-7291</Text>
            <TouchableOpacity style={styles.copyBtn}>
              <Ionicons name="copy-outline" size={18} color={TEAL} />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Steps */}
        <Text style={styles.sectionTitle}>How it works</Text>
        {[
          { step: '1', icon: 'share-social-outline', title: 'Share your code', text: 'Send your unique referral code to friends.' },
          { step: '2', icon: 'person-add-outline',   title: 'They sign up',    text: 'Your friend creates a MediQuick account.' },
          { step: '3', icon: 'star-outline',         title: 'Both earn',       text: 'You both receive 500 reward points.' },
        ].map(item => (
          <View key={item.step} style={styles.stepCard}>
            <View style={styles.stepBadge}><Text style={styles.stepNum}>{item.step}</Text></View>
            <View style={[styles.stepIconWrap]}><Ionicons name={item.icon as any} size={20} color={TEAL} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepText}>{item.text}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={18} color="#fff" />
          <Text style={styles.shareBtnText}>Share Referral Link</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#F0FAFA' },
  bgLight:   { ...StyleSheet.absoluteFillObject, backgroundColor: '#F0FAFA' },
  bgTealTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,181,173,0.12)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  header:    { backgroundColor: 'transparent' },

  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },

  heroCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 28, marginBottom: 16 },
  heroIconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(0,181,173,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,181,173,0.20)' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#0D3349', marginBottom: 4 },
  heroSub:   { fontSize: 13, color: '#4A7080', textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(245,124,0,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(245,124,0,0.20)' },
  rewardText: { fontSize: 12, fontWeight: '700', color: '#F57C00' },

  codeCard: { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 18, marginBottom: 22 },
  codeLabel: { fontSize: 12, fontWeight: '600', color: '#8AACBA', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeValue: { fontSize: 20, fontWeight: '800', color: '#0D3349', letterSpacing: 1 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,181,173,0.10)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(0,181,173,0.20)' },
  copyText: { fontSize: 12, fontWeight: '700', color: TEAL },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0D3349', marginBottom: 12, letterSpacing: 0.2 },
  stepCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 14, marginBottom: 10, gap: 12 },
  stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNum:   { fontSize: 12, fontWeight: '800', color: '#fff' },
  stepIconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(0,181,173,0.10)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepTitle: { fontSize: 13, fontWeight: '700', color: '#0D3349', marginBottom: 2 },
  stepText:  { fontSize: 12, color: '#4A7080' },

  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: TEAL, borderRadius: 16, paddingVertical: 15, marginTop: 6 },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

