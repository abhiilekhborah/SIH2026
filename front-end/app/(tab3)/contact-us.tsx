import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_BLUE = '#1A66E8';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';
const BORDER_COLOR = '#E2E8F0';
const BG_PAGE = '#F8FAFC';

export default function ContactUsScreen() {
  const { openMenu } = useSideMenu();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Urgent Delivery' | 'Cold Chain Failure'>('Normal');

  const handleSubmitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing Fields', 'Please enter a Subject and Message description.');
      return;
    }
    Alert.alert(
      'Support Ticket Created',
      `Ticket #${Math.floor(10000 + Math.random() * 90000)} submitted to MediQuick Pharmacist Operations. Priority: ${priority}. An agent will call you within 10 mins.`
    );
    setSubject('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader
        title="Contact Support"
        showMenu
        showNotification={false}
        onPressMenu={openMenu}
        centerElement={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Pharmacist Helpdesk</Text>
            <Text style={styles.headerSubtitle}>24/7 Operations Support</Text>
          </View>
        }
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Urgent Helpline Cards */}
        <View style={styles.helplineGrid}>
          <TouchableOpacity
            style={[styles.helplineCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
            onPress={() => Alert.alert('Calling Operations Hotline', 'Connecting to 1800-123-MEDI...')}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={22} color="#1D4ED8" />
            <Text style={styles.helplineTitle}>24/7 Rx Support</Text>
            <Text style={styles.helplinePhone}>1800-123-MEDI</Text>
            <Text style={styles.helplineSub}>Instant Pharmacist Assist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.helplineCard, { backgroundColor: '#FEF2F2', borderColor: '#FECDD3' }]}
            onPress={() => Alert.alert('Calling Emergency Distributor', 'Connecting to Rural Drug Supply Hub...')}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={22} color="#DC2626" />
            <Text style={[styles.helplineTitle, { color: '#DC2626' }]}>Distributor Emergency</Text>
            <Text style={styles.helplinePhone}>+91 98000 11222</Text>
            <Text style={styles.helplineSub}>Restock Fast-Track</Text>
          </TouchableOpacity>
        </View>

        {/* Create Support Ticket Form */}
        <Text style={styles.sectionHeading}>Submit Support Ticket</Text>
        <View style={styles.ticketCard}>
          <Text style={styles.fieldLabel}>Issue Priority Level</Text>
          <View style={styles.priorityRow}>
            {(['Normal', 'Urgent Delivery', 'Cold Chain Failure'] as const).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.priorityChip, priority === p && styles.priorityChipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.priorityChipText, priority === p && styles.priorityChipTextActive]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Subject / Topic *</Text>
          <TextInput
            style={styles.inputField}
            placeholder="e.g. Stock discrepancy for Amoxicillin"
            placeholderTextColor="#94A3B8"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.fieldLabel}>Detailed Description *</Text>
          <TextInput
            style={[styles.inputField, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="Describe the issue or medicine query in detail..."
            placeholderTextColor="#94A3B8"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTicket} activeOpacity={0.8}>
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionHeading}>Common Pharmacist FAQs</Text>
        <View style={styles.faqCard}>
          <Text style={styles.faqQuestion}>Q: How do I handle generic drug substitutions?</Text>
          <Text style={styles.faqAnswer}>
            A: If the exact brand is out of stock, select "Substitutes OK" in the Quick SBRT text box to propose a bioequivalent salt to the prescribing doctor.
          </Text>
          <View style={styles.divider} />
          <Text style={styles.faqQuestion}>Q: What is the procedure if cold-chain temperature exceeds 8°C?</Text>
          <Text style={styles.faqAnswer}>
            A: Immediately transfer Lantus Insulin and vaccines to the backup secondary cold bag and report to Distributor Emergency hotline.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG_PAGE },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: TEXT_DARK },
  headerSubtitle: { fontSize: 11, color: PRIMARY_BLUE, fontWeight: '600' },
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 14 },
  helplineGrid: { flexDirection: 'row', gap: 10 },
  helplineCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  helplineTitle: { fontSize: 12, fontWeight: '800', color: '#1E40AF', textAlign: 'center' },
  helplinePhone: { fontSize: 14, fontWeight: '800', color: TEXT_DARK, marginTop: 2 },
  helplineSub: { fontSize: 10, color: TEXT_MUTED, textAlign: 'center' },
  sectionHeading: { fontSize: 15, fontWeight: '800', color: TEXT_DARK, marginTop: 4 },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 8,
  },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginTop: 4 },
  priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  priorityChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityChipActive: { backgroundColor: PRIMARY_BLUE },
  priorityChipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  priorityChipTextActive: { color: '#FFFFFF' },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: TEXT_DARK,
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingVertical: 10 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 6,
  },
  faqQuestion: { fontSize: 13, fontWeight: '700', color: TEXT_DARK },
  faqAnswer: { fontSize: 12, color: TEXT_MUTED, lineHeight: 17 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
});
