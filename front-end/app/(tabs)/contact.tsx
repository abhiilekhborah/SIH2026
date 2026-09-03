import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';

const TEAL = '#00B5AD';

function ContactCard({ icon, label, value, onPress, color = TEAL }: { icon: any; label: string; value: string; onPress?: () => void; color?: string }) {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.contactCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.contactIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={[styles.contactValue, onPress && { color }]}>{value}</Text>
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color={color} />}
    </Wrapper>
  );
}

export default function ContactScreen() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={styles.bgLight} />
        <View style={styles.bgTealTop} />
      </View>

      <AppHeader
        title="Contact Us"
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
            <Ionicons name="chatbubbles" size={38} color={TEAL} />
          </View>
          <Text style={styles.heroTitle}>Get in Touch</Text>
          <Text style={styles.heroSub}>We're here to help. Reach out any time.</Text>
        </View>

        <Text style={styles.sectionTitle}>Contact Options</Text>
        <ContactCard icon="mail-outline"  label="Email Support"   value="support@mediquick.com"  onPress={() => Linking.openURL('mailto:support@mediquick.com')} />
        <ContactCard icon="call-outline"  label="Helpline"        value="+1 (800) 123-4567"       onPress={() => Linking.openURL('tel:+18001234567')} />
        <ContactCard icon="globe-outline" label="Website"         value="www.mediquick.com"       onPress={() => Linking.openURL('https://mediquick.com')} color="#1976D2" />
        <ContactCard icon="logo-twitter"  label="Twitter / X"    value="@MediQuickApp"                                                                    color="#1DA1F2" />
        <ContactCard icon="time-outline"  label="Support Hours"  value="Mon–Fri, 9am – 6pm IST" />

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

  heroCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 28, marginBottom: 24 },
  heroIconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(0,181,173,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,181,173,0.20)' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#0D3349', marginBottom: 4 },
  heroSub:   { fontSize: 13, color: '#4A7080', textAlign: 'center' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0D3349', marginBottom: 12, letterSpacing: 0.2 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(0,181,173,0.18)', padding: 16, marginBottom: 10, gap: 14 },
  contactIconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  contactLabel: { fontSize: 11, color: '#8AACBA', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  contactValue: { fontSize: 14, fontWeight: '600', color: '#0D3349' },
});

