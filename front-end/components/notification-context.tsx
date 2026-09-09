import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { NotificationPanel, NotificationSection, NotificationItem } from './notification-panel';
import {
  fetchNotifications,
  markAllNotificationsRead,
  notificationKindToType,
  relativeTime,
  sectionLabel,
  type ApiNotification,
} from '@/lib/notifications';

/**
 * Maps a push notification "type" (from the backend data payload)
 * to an icon + color for the in-app notification panel.
 */
const NOTIFICATION_TYPE_MAP: Record<string, { icon: string; iconColor: string }> = {
  appointment: { icon: 'heart-outline', iconColor: '#EF4444' },
  prescription: { icon: 'medkit-outline', iconColor: '#1A66E8' },
  message: { icon: 'chatbubble-outline', iconColor: '#16A34A' },
  lab_result: { icon: 'document-text-outline', iconColor: '#9333EA' },
  reminder: { icon: 'notifications-outline', iconColor: '#F59E0B' },
  payment: { icon: 'card-outline', iconColor: '#1A66E8' },
  referral: { icon: 'people-outline', iconColor: '#16A34A' },
  default: { icon: 'notifications-outline', iconColor: '#00B5AD' },
};

/**
 * Turns API rows into the panel's Today / Yesterday / A week ago sections,
 * preserving the newest-first order the server returned.
 */
function groupNotifications(rows: ApiNotification[]): NotificationSection[] {
  const sections: NotificationSection[] = [];

  for (const row of rows) {
    const label = sectionLabel(row.createdAt);
    const { icon, iconColor } = getNotificationIcon(
      notificationKindToType(row.payload?.kind)
    );

    const item: NotificationItem = {
      id: row.id,
      icon,
      iconColor,
      title: notificationTitle(row),
      description: row.message ?? '',
      time: relativeTime(row.createdAt),
    };

    const section = sections.find((s) => s.label === label);
    if (section) section.data.push(item);
    else sections.push({ label, data: [item] });
  }

  return sections;
}

function notificationTitle(row: ApiNotification): string {
  switch (row.payload?.kind) {
    case 'prescription_issued':
      return 'New Prescription';
    case 'pharmacy_order_received':
      return 'New Prescription Order';
    case 'pharmacy_order_status':
      return row.payload?.status === 'ready'
        ? 'Prescription Ready'
        : 'Order Update';
    case 'pharmacy_message':
      return 'Message from Pharmacy';
    default:
      return 'Notification';
  }
}

type NotificationContextType = {
  openNotifications: () => void;
  /** Add a real push notification to the "Today" section of the panel */
  addNotification: (item: NotificationItem) => void;
  /** The Expo push token (set by _layout.tsx after registration) */
  expoPushToken: string | null;
  /** Set the push token (called from _layout.tsx) */
  setExpoPushToken: (token: string | null) => void;
  /** Unread notification count */
  unreadCount: number;
  /** Re-fetch from the server. */
  refreshNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  openNotifications: () => {},
  addNotification: () => {},
  expoPushToken: null,
  setExpoPushToken: () => {},
  unreadCount: 0,
  refreshNotifications: async () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

/**
 * Maps a push notification type string to an icon config.
 */
export function getNotificationIcon(type?: string) {
  return NOTIFICATION_TYPE_MAP[type ?? 'default'] ?? NOTIFICATION_TYPE_MAP.default;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [sections, setSections] = useState<NotificationSection[]>([]);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const { notifications, unreadCount: unread } = await fetchNotifications({ limit: 50 });
      setSections(groupNotifications(notifications));
      setUnreadCount(unread);
    } catch {
      // A notification panel is not worth an error state — leave what we have.
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openNotifications = useCallback(() => {
    setVisible(true);
    refresh();

    // Opening the panel is what counts as reading them.
    setUnreadCount(0);
    markAllNotificationsRead().catch(() => {});
  }, [refresh]);
  const closeNotifications = useCallback(() => setVisible(false), []);

  /**
   * Add a new notification to the "Today" section at the top.
   * Called when a push notification arrives while the app is in the foreground.
   */
  const addNotification = useCallback((item: NotificationItem) => {
    setSections((prev) => {
      const todayIndex = prev.findIndex((s) => s.label === 'Today');
      if (todayIndex >= 0) {
        // Prepend to existing "Today" section
        const updated = [...prev];
        updated[todayIndex] = {
          ...updated[todayIndex],
          data: [item, ...updated[todayIndex].data],
        };
        return updated;
      } else {
        // No "Today" section yet — create one at the top
        return [{ label: 'Today', data: [item] }, ...prev];
      }
    });
    setUnreadCount((c) => c + 1);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSections((prev) =>
      prev
        .map((section) => ({
          ...section,
          data: section.data.filter((item) => item.id !== id),
        }))
        .filter((section) => section.data.length > 0)
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        openNotifications,
        addNotification,
        expoPushToken,
        setExpoPushToken,
        unreadCount,
        refreshNotifications: refresh,
      }}
    >
      {children}
      <NotificationPanel
        visible={visible}
        onClose={closeNotifications}
        sections={sections}
        onDelete={handleDelete}
      />
    </NotificationContext.Provider>
  );
}
