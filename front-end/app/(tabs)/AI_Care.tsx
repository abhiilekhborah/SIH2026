import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Colors ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0D9488',
  primaryLight: '#14B8A6',
  primaryDark: '#0F766E',
  primaryBg: '#F0FDFA',
  primaryBorder: '#99F6E4',
  secondary: '#2563EB',
  secondaryLight: '#3B82F6',
  accent: '#6366F1',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  userBubble: '#0D9488',
  aiBubble: '#FFFFFF',
  emergency: '#DC2626',
  emergencyBg: '#FEF2F2',
  success: '#16A34A',
  warning: '#F59E0B',
};

// ─── Types ──────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  time: string;
  unread?: boolean;
}

// ─── Mock Data ──────────────────────────────────────────────────────────

const SUGGESTION_CHIPS: { id: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: '1', label: 'Explain my symptoms', icon: 'medical-outline' },
  { id: '2', label: 'Analyze my report', icon: 'document-text-outline' },
  { id: '3', label: 'Understand my prescription', icon: 'ribbon-outline' },
  { id: '4', label: 'Health & nutrition', icon: 'nutrition-outline' },
  { id: '5', label: 'Doctor preparation', icon: 'clipboard-outline' },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    text: 'I have been having headaches for the past 3 days. They are mostly on the right side of my head and get worse in the afternoon.',
    timestamp: '10:24 AM',
  },
  {
    id: '2',
    role: 'ai',
    text: 'I understand you are experiencing recurring headaches. Let me help you understand this better.\n\n**Possible Causes:**\n• Tension headache — the most common type, often from stress or poor posture\n• Migraine — typically one-sided with throbbing pain\n• Dehydration or insufficient sleep\n• Eye strain from screen time\n\n**Recommendations:**\n• Stay hydrated — aim for 8 glasses of water daily\n• Take regular screen breaks (20-20-20 rule)\n• Maintain a consistent sleep schedule\n• Try cold compress on the affected area\n\n**When to see a doctor:**\nIf headaches persist beyond a week, are severe, or are accompanied by fever, vision changes, or confusion, please consult a healthcare professional immediately.',
    timestamp: '10:25 AM',
  },
  {
    id: '3',
    role: 'user',
    text: 'I also feel slight nausea sometimes. Could this be a migraine?',
    timestamp: '10:28 AM',
  },
  {
    id: '4',
    role: 'ai',
    text: 'Nausea combined with one-sided headaches can indeed be a sign of migraine. Here is what you should know:\n\n**Migraine Indicators:**\n• One-sided, throbbing headache\n• Nausea or vomiting\n• Sensitivity to light and sound\n• Aura (visual disturbances) in some cases\n\n**Self-care Steps:**\n• Rest in a dark, quiet room during episodes\n• Apply cold therapy to forehead or neck\n• Avoid known triggers (caffeine, certain foods, stress)\n• Consider keeping a headache diary\n\n**Important:** This is general health information. For proper diagnosis and treatment, please schedule an appointment with your doctor.',
    timestamp: '10:29 AM',
  },
];

const MOCK_CONVERSATIONS: ChatConversation[] = [
  { id: '1', title: 'Blood Test Explanation', lastMessage: 'Your CBC results show normal...', time: '2h ago' },
  { id: '2', title: 'Headache Symptoms', lastMessage: 'Based on your description...', time: '4h ago', unread: true },
  { id: '3', title: 'Prescription Analysis', lastMessage: 'Amoxicillin 500mg should be...', time: 'Yesterday' },
  { id: '4', title: 'Diet Recommendations', lastMessage: 'For your diabetes management...', time: '3 days ago' },
  { id: '5', title: 'Previous Consultation', lastMessage: 'Follow up with Dr. Sharma...', time: '1 week ago' },
];

// ─── AI Avatar ──────────────────────────────────────────────────────────

function AIAvatar({ size = 40 }: { size?: number }) {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryLight]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[aiAvatarStyles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Ionicons name="medical" size={size * 0.5} color="#FFFFFF" />
    </LinearGradient>
  );
}

const aiAvatarStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Online Indicator ───────────────────────────────────────────────────

function OnlineIndicator() {
  return (
    <View style={onlineStyles.container}>
      <View style={onlineStyles.dot} />
      <Text style={onlineStyles.text}>Online</Text>
    </View>
  );
}

const onlineStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  text: { fontSize: 11, fontWeight: '500', color: COLORS.success },
});

// ─── AI Care Header ─────────────────────────────────────────────────────

function AICareHeader() {
  return (
    <View style={headerStyles.container}>
      <AIAvatar size={44} />
      <View style={headerStyles.info}>
        <Text style={headerStyles.title}>AI Care</Text>
        <Text style={headerStyles.subtitle}>Your AI Health Assistant</Text>
      </View>
      <OnlineIndicator />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  info: { flex: 1, marginLeft: 12 },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
});

// ─── Suggestion Chips ───────────────────────────────────────────────────

function SuggestionChips({ onSelect }: { onSelect: (label: string) => void }) {
  return (
    <View style={chipStyles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chipStyles.container}>
        {SUGGESTION_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={chipStyles.chip}
            activeOpacity={0.7}
            onPress={() => onSelect(chip.label)}
          >
            <Ionicons name={chip.icon} size={16} color={COLORS.primary} />
            <Text style={chipStyles.chipText}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrapper: { marginVertical: 12 },
  container: { paddingHorizontal: 20, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryBg,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.primaryDark },
});

// ─── Empty State ────────────────────────────────────────────────────────

function EmptyState({ onSelectSuggestion }: { onSelectSuggestion: (text: string) => void }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.title}>How can I help you today?</Text>
      <Text style={emptyStyles.subtitle}>
        Ask AI Care about your health, reports, medications, or symptoms.
      </Text>
      <SuggestionChips onSelect={onSelectSuggestion} />
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});

// ─── Message Bubble ─────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Text key={index} style={bubbleStyles.boldText}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      }
      if (line.startsWith('• ')) {
        return (
          <Text key={index} style={bubbleStyles.bulletText}>
            {'  '}{line}
          </Text>
        );
      }
      if (line.trim() === '') {
        return <Text key={index}>{'\n'}</Text>;
      }
      return (
        <Text key={index} style={bubbleStyles.regularText}>
          {line}
        </Text>
      );
    });
  };

  return (
    <View style={[bubbleStyles.row, isUser && bubbleStyles.userRow]}>
      {!isUser && (
        <View style={bubbleStyles.avatarContainer}>
          <AIAvatar size={32} />
        </View>
      )}
      <View style={[bubbleStyles.bubble, isUser ? bubbleStyles.userBubble : bubbleStyles.aiBubble]}>
        {isUser ? (
          <Text style={bubbleStyles.userText}>{message.text}</Text>
        ) : (
          <View>{renderFormattedText(message.text)}</View>
        )}
      </View>
    </View>
  );
}

const bubbleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  userRow: { justifyContent: 'flex-end' },
  avatarContainer: { marginRight: 8, marginBottom: 2 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  boldText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    marginTop: 8,
  },
  bulletText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  regularText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
});

// ─── Medical Disclaimer ─────────────────────────────────────────────────

function MedicalDisclaimer() {
  return (
    <View style={disclaimerStyles.container}>
      <Ionicons name="information-circle-outline" size={14} color={COLORS.textMuted} />
      <Text style={disclaimerStyles.text}>
        AI Care provides general health information and does not replace professional medical advice.
      </Text>
    </View>
  );
}

const disclaimerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  text: { fontSize: 11, color: '#92400E', lineHeight: 16, flex: 1 },
});

// ─── Typing Indicator ───────────────────────────────────────────────────

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]),
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={typingStyles.row}>
      <View style={typingStyles.avatarContainer}>
        <AIAvatar size={32} />
      </View>
      <View style={typingStyles.bubble}>
        <Animated.View style={[typingStyles.dot, { opacity: dot1 }]} />
        <Animated.View style={[typingStyles.dot, { opacity: dot2 }]} />
        <Animated.View style={[typingStyles.dot, { opacity: dot3 }]} />
      </View>
    </View>
  );
}

const typingStyles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 16, paddingHorizontal: 20, alignItems: 'flex-end' },
  avatarContainer: { marginRight: 8, marginBottom: 2 },
  bubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.aiBubble,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },
});

// ─── Chat Input Bar ─────────────────────────────────────────────────────

function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onHistory,
  onCamera,
  onAttachment,
  onMic,
  onEmergency,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onHistory: () => void;
  onCamera: () => void;
  onAttachment: () => void;
  onMic: () => void;
  onEmergency: () => void;
}) {
  const hasText = value.trim().length > 0;

  return (
    <View style={inputStyles.outerContainer}>
      {/* Main Input Bar */}
      <View style={inputStyles.container}>
        {/* Left Icons */}
        <View style={inputStyles.leftIcons}>
          <TouchableOpacity style={inputStyles.iconButton} onPress={onHistory} activeOpacity={0.6}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={inputStyles.iconButton} onPress={onCamera} activeOpacity={0.6}>
            <Ionicons name="camera-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={inputStyles.iconButton} onPress={onAttachment} activeOpacity={0.6}>
            <Ionicons name="attach-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Text Input */}
        <TextInput
          style={inputStyles.textInput}
          placeholder="Ask AI Care..."
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={1000}
        />

        {/* Right Icons */}
        <View style={inputStyles.rightIcons}>
          <TouchableOpacity style={inputStyles.iconButton} onPress={onMic} activeOpacity={0.6}>
            <Ionicons name="mic-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[inputStyles.sendButton, hasText && inputStyles.sendButtonActive]}
            onPress={onSend}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-up" size={22} color={hasText ? '#FFFFFF' : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 75,
    paddingTop: 8,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 52,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingHorizontal: 8,
    maxHeight: 100,
    paddingVertical: 6,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});

// ─── Past Chats Bottom Sheet ────────────────────────────────────────────

function PastChatsSheet({
  visible,
  onClose,
  onSelectConversation,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  const todayConvos = MOCK_CONVERSATIONS.filter((c) => c.time.includes('ago'));
  const yesterdayConvos = MOCK_CONVERSATIONS.filter((c) => c.time === 'Yesterday');
  const earlierConvos = MOCK_CONVERSATIONS.filter((c) => c.time.includes('days') || c.time.includes('week'));

  const renderSection = (title: string, conversations: ChatConversation[]) => (
    <View style={historyStyles.section}>
      <Text style={historyStyles.sectionTitle}>{title}</Text>
      {conversations.map((conv) => (
        <TouchableOpacity
          key={conv.id}
          style={historyStyles.conversationItem}
          activeOpacity={0.7}
          onPress={() => onSelectConversation(conv.id)}
        >
          <View style={historyStyles.convLeft}>
            <View style={historyStyles.convIcon}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={historyStyles.convInfo}>
              <Text style={historyStyles.convTitle} numberOfLines={1}>{conv.title}</Text>
              <Text style={historyStyles.convPreview} numberOfLines={1}>{conv.lastMessage}</Text>
            </View>
          </View>
          <View style={historyStyles.convRight}>
            <Text style={historyStyles.convTime}>{conv.time}</Text>
            <TouchableOpacity style={historyStyles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={historyStyles.overlay} onPress={onClose}>
        <Pressable style={historyStyles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[historyStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* Handle */}
            <View style={historyStyles.handle} />

            {/* Header */}
            <View style={historyStyles.header}>
              <Text style={historyStyles.headerTitle}>Your conversations</Text>
              <TouchableOpacity style={historyStyles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={historyStyles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={historyStyles.searchInput}
                placeholder="Search conversations..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* New Chat Button */}
            <TouchableOpacity style={historyStyles.newChatButton} activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={historyStyles.newChatText}>New chat</Text>
            </TouchableOpacity>

            {/* Conversations List */}
            <ScrollView showsVerticalScrollIndicator={false} style={historyStyles.list}>
              {todayConvos.length > 0 && renderSection('Today', todayConvos)}
              {yesterdayConvos.length > 0 && renderSection('Yesterday', yesterdayConvos)}
              {earlierConvos.length > 0 && renderSection('Earlier', earlierConvos)}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const historyStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContainer: { maxHeight: SCREEN_HEIGHT * 0.75 },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  newChatText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  list: { marginTop: 8 },
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  convLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  convIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center' },
  convInfo: { flex: 1 },
  convTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  convPreview: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  convRight: { alignItems: 'flex-end', gap: 6 },
  convTime: { fontSize: 11, color: COLORS.textMuted },
  moreButton: { padding: 4 },
});

// ─── Main AI Care Tab ───────────────────────────────────────────────────

export default function AICare() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    scrollToBottom();

    // Simulate AI response
    setIsTyping(true);
    scrollToBottom();
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Thank you for sharing that information. Based on what you have described, here are some observations:\n\n**Assessment:**\n• Your symptoms suggest a common condition that can be managed\n• No immediate red flags detected\n\n**Recommendations:**\n• Monitor your symptoms over the next 24-48 hours\n• Stay well hydrated and get adequate rest\n• Over-the-counter relief may help with discomfort\n\n**Next Steps:**\nIf symptoms persist or worsen, please consult with your healthcare provider for a personalized evaluation.\n\nWould you like more specific information about any aspect of your concern?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiMessage]);
      scrollToBottom();
    }, 2000);
  }, [inputText, scrollToBottom]);

  const handleSelectSuggestion = useCallback((text: string) => {
    setInputText(text);
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMessage]);
      scrollToBottom();

      setIsTyping(true);
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: `Regarding "${text}"...\n\nI would be happy to help you with that. Here is what I can tell you:\n\n**Key Points:**\n• This is a common health concern that many patients ask about\n• There are several evidence-based approaches to address this\n• Your individual situation may require personalized guidance\n\n**General Guidance:**\n• Start with lifestyle modifications where applicable\n• Keep track of any changes in your symptoms\n• Consider scheduling a follow-up with your doctor\n\n**Important Note:** For a thorough evaluation and personalized treatment plan, please consult with your healthcare professional.\n\nIs there anything specific you would like me to elaborate on?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setIsTyping(false);
        setMessages((prev) => [...prev, aiMessage]);
        scrollToBottom();
      }, 2000);
    }, 50);
  }, [scrollToBottom]);

  const handleSelectConversation = useCallback((id: string) => {
    setShowHistory(false);
    // Load mock conversation
    setMessages(MOCK_MESSAGES);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const handleCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to grant camera permissions to use this feature.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.5,
      });
      
      if (!result.canceled) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          text: '[Image attached]',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMessage]);
        scrollToBottom();
        
        setIsTyping(true);
        scrollToBottom();
        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            text: 'I received your image. Based on what I can see, I recommend consulting a doctor for a proper diagnosis.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setIsTyping(false);
          setMessages((prev) => [...prev, aiMessage]);
          scrollToBottom();
        }, 2000);
      }
    } catch (error) {
      console.log('Error launching camera:', error);
    }
  };

  const handleMic = () => {
    Alert.alert(
      "Voice Input",
      "Please tap the text input box and use the microphone icon on your keyboard to dictate your message."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Light gradient backdrop */}
      <View style={StyleSheet.absoluteFillObject}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#F0FAFA' }]} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 180, backgroundColor: 'rgba(0,181,173,0.10)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} />
      </View>

      {/* App Header */}
      <AppHeader
        title="AI Care"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        style={{ backgroundColor: 'transparent' }}
        buttonBackgroundColor="rgba(0,181,173,0.12)"
      />

      {/* AI Care Sub-Header */}
      <AICareHeader />

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {!hasMessages ? (
          <EmptyState onSelectSuggestion={handleSelectSuggestion} />
        ) : (
          <View style={styles.messagesContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
            />
            {isTyping && <TypingIndicator />}
            {messages.length > 0 && messages[messages.length - 1].role === 'ai' && <MedicalDisclaimer />}
          </View>
        )}

        {/* Chat Input */}
        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onHistory={() => setShowHistory(true)}
          onCamera={handleCamera}
          onAttachment={() => {}}
          onMic={handleMic}
          onEmergency={() => {}}
        />
      </KeyboardAvoidingView>

      {/* Overlays */}
      <PastChatsSheet
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectConversation={handleSelectConversation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0FAFA',
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messagesList: {
    paddingTop: 16,
    paddingBottom: 8,
  },
});
