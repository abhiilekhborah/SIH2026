import { AppHeader } from '@/components/app-header';
import { useSideMenu } from '@/components/side-menu-context';
import { useNotifications } from '@/components/notification-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Colors ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#0D9488',
  primaryLight: '#2DD4BF',
  primaryDark: '#0F766E',
  primaryBg: '#F0FDFA',
  primaryBorder: '#99F6E4',
  secondary: '#3B82F6',
  secondaryLight: '#60A5FA',
  accent: '#6366F1',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  userBubble: '#0D9488',
  aiBubble: '#FFFFFF',
  emergency: '#EF4444',
  emergencyBg: '#FEF2F2',
  success: '#10B981',
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

function AIAvatar({ size = 40, animate = false }: { size?: number, animate?: boolean }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [animate]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <LinearGradient
        colors={['#0D9488', '#2DD4BF']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[aiAvatarStyles.container, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Ionicons name="medical" size={size * 0.5} color="#FFFFFF" />
      </LinearGradient>
    </Animated.View>
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
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.6)',
  },
  info: { flex: 1, marginLeft: 14 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },
});

// ─── Suggestion Chips ───────────────────────────────────────────────────

function SuggestionChips({ onSelect }: { onSelect: (label: string) => void }) {
  return (
    <View style={chipStyles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={chipStyles.scrollContainer}
      >
        {SUGGESTION_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.id}
            style={chipStyles.card}
            activeOpacity={0.7}
            onPress={() => onSelect(chip.label)}
          >
            <View style={chipStyles.iconContainer}>
              <Ionicons name={chip.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={chipStyles.cardText} numberOfLines={2}>{chip.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrapper: {
    paddingTop: 90,
    width: '100%',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 130,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 20,
    padding: 14,
    alignItems: 'flex-start',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
  },
});

// ─── Empty State ────────────────────────────────────────────────────────

function EmptyState({ onSelectSuggestion }: { onSelectSuggestion: (text: string) => void }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.title}>How can I help you today?</Text>
      <SuggestionChips onSelect={onSelectSuggestion} />
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 180,
  },
  avatarWrapper: {
    marginBottom: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
    transform: [{ scale: 1.2 }],
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginTop : 40,
    marginBottom : 20,
    letterSpacing: -0.5,
  },
});

// ─── Message Bubble ─────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  const slideAnim = useRef(new Animated.Value(15)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();
  }, []);

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
    <Animated.View style={[bubbleStyles.row, isUser && bubbleStyles.userRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {!isUser && (
        <View style={bubbleStyles.avatarContainer}>
          <AIAvatar size={32} />
        </View>
      )}
      {isUser ? (
        <LinearGradient
          colors={['#2DD4BF', '#0D9488']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[bubbleStyles.bubble, bubbleStyles.userBubble]}
        >
          <Text style={bubbleStyles.userText}>{message.text}</Text>
        </LinearGradient>
      ) : (
        <View style={[bubbleStyles.bubble, bubbleStyles.aiBubble]}>
          <View>{renderFormattedText(message.text)}</View>
        </View>
      )}
    </Animated.View>
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  aiBubble: {
    backgroundColor: COLORS.aiBubble,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    borderBottomLeftRadius: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
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
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
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
  isKeyboardVisible,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onHistory: () => void;
  onCamera: () => void;
  onAttachment: () => void;
  onMic: () => void;
  onEmergency: () => void;
  isKeyboardVisible?: boolean;
}) {
  const hasText = value.trim().length > 0;
  const bottomPadding = isKeyboardVisible ? (Platform.OS === 'ios' ? 12 : 12) : (Platform.OS === 'ios' ? 95 : 85);

  return (
    <View style={[inputStyles.outerContainer, { paddingBottom: bottomPadding }]}>
      <BlurView intensity={60} tint="light" style={inputStyles.blurContainer}>
        {/* Left Icons */}
        <View style={inputStyles.leftIcons}>
          <TouchableOpacity style={inputStyles.iconButton} onPress={onHistory} activeOpacity={0.6}>
            <Ionicons name="time-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={inputStyles.iconButton} onPress={onCamera} activeOpacity={0.6}>
            <Ionicons name="camera-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={inputStyles.iconButton} onPress={onAttachment} activeOpacity={0.6}>
            <Ionicons name="attach-outline" size={22} color={COLORS.textSecondary} />
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
            <Ionicons name="mic-outline" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSend}
            activeOpacity={0.7}
            disabled={!hasText}
          >
            <LinearGradient
              colors={hasText ? ['#2DD4BF', '#0D9488'] : [COLORS.border, COLORS.border]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[inputStyles.sendButton, hasText && inputStyles.sendButtonActive]}
            >
              <Ionicons name="arrow-up" size={20} color={hasText ? '#FFFFFF' : COLORS.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 1)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    minHeight: 60,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 8,
    maxHeight: 120,
    paddingVertical: 8,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendButtonActive: {
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

// ─── Past Chats Bottom Sheet ────────────────────────────────────────────

function PastChatsSheet({
  visible,
  onClose,
  onSelectConversation,
  onNewChat,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
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
            <TouchableOpacity style={historyStyles.newChatButton} activeOpacity={0.7} onPress={onNewChat}>
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
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 32,
    maxHeight: SCREEN_HEIGHT * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
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
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
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

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

async function fetchGroqResponse(chatMessages: Message[]): Promise<string> {
  const formattedMessages = chatMessages.map((msg) => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text,
  }));

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: 'You are AI Care, a professional, empathetic, and knowledgeable AI health assistant. Respond in plain, clear text without any markdown formatting like asterisks, hashtags, or bullet symbols. Use natural paragraphs and simple sentences instead. Always remind users to consult a real doctor for serious issues.',
        },
        ...formattedMessages,
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}

// Typewriter: reveals text word by word to simulate streaming
function typewriterEffect(
  fullText: string,
  messageId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  scrollToBottom: () => void,
  onDone: () => void
) {
  const words = fullText.split(' ');
  let index = 0;
  const interval = setInterval(() => {
    index++;
    const partial = words.slice(0, index).join(' ');
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, text: partial } : m))
    );
    scrollToBottom();
    if (index >= words.length) {
      clearInterval(interval);
      onDone();
    }
  }, 30);
}

// ─── Main AI Care Tab ───────────────────────────────────────────────────

export default function AICare() {
  const { openMenu } = useSideMenu();
  const { openNotifications } = useNotifications();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    scrollToBottom();
    setIsTyping(true);
    scrollToBottom();

    const aiId = (Date.now() + 1).toString();
    const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const fullText = await fetchGroqResponse(updatedMessages);
      setIsTyping(false);
      // Seed the message with an empty string, typewriter fills it in
      setMessages((prev) => [...prev, { id: aiId, role: 'ai', text: '', timestamp: aiTimestamp }]);
      typewriterEffect(fullText, aiId, setMessages, scrollToBottom, () => {});
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: aiId,
          role: 'ai',
          text: 'Sorry, I am having trouble connecting to the AI server right now. Please try again later.',
          timestamp: aiTimestamp,
        },
      ]);
    }
  }, [inputText, messages, scrollToBottom]);

  const handleSelectSuggestion = useCallback((text: string) => {
    setInputText(text);
    setTimeout(async () => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      scrollToBottom();
      setIsTyping(true);
      scrollToBottom();

      const aiId = (Date.now() + 1).toString();
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      try {
        const fullText = await fetchGroqResponse(updatedMessages);
        setIsTyping(false);
        setMessages((prev) => [...prev, { id: aiId, role: 'ai', text: '', timestamp: aiTimestamp }]);
        typewriterEffect(fullText, aiId, setMessages, scrollToBottom, () => {});
      } catch (error) {
        console.error(error);
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: aiId,
            role: 'ai',
            text: 'Sorry, I am having trouble connecting to the AI server right now. Please try again later.',
            timestamp: aiTimestamp,
          },
        ]);
      }
    }, 50);
  }, [messages, scrollToBottom]);

  const handleSelectConversation = useCallback((id: string) => {
    setShowHistory(false);
    // Load mock conversation
    setMessages(MOCK_MESSAGES);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  const handleNewChat = useCallback(() => {
    setShowHistory(false);
    setMessages([]);
    setInputText('');
    setIsTyping(false);
  }, []);

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
      {/* Wow-factor Premium Glassmorphism Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={['#F8FAFC', '#E0F2FE', '#F0FDFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Animated-like Glowing Orbs */}
        <View style={{ position: 'absolute', top: -100, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#2DD4BF', opacity: 0.15 }} />
        <View style={{ position: 'absolute', top: 300, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#3B82F6', opacity: 0.1 }} />
        <View style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#818CF8', opacity: 0.1 }} />
        <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFillObject} />
      </View>

      {/* App Header */}
      <AppHeader
        title="AI Care"
        showMenu={true}
        showNotification={true}
        onPressMenu={openMenu}
        onPressNotification={openNotifications}
        style={{ backgroundColor: 'transparent' }}
        buttonBackgroundColor="rgba(255, 255, 255, 0.4)"
      />

      {/* AI Care Sub-Header */}
      <AICareHeader />

      {/* Chat Area */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
          isKeyboardVisible={isKeyboardVisible}
        />
      </KeyboardAvoidingView>

      {/* Overlays */}
      <PastChatsSheet
        visible={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  messagesList: {
    paddingTop: 16,
    paddingBottom: 20,
  },
});
