import { apiGet, apiPatch } from './api';

/** A row from the `notifications` table. */
export interface ApiNotification {
  id: string;
  userId: string;
  channel: string;
  /** `{ kind, ...context }` — `kind` is what the prescription flow writes. */
  payload: Record<string, unknown> | null;
  status: string;
  message: string | null;
  createdAt: string;
  readAt: string | null;
}

export const fetchNotifications = (options?: { unread?: boolean; limit?: number }) => {
  const query = new URLSearchParams();
  if (options?.unread) query.set('unread', 'true');
  if (options?.limit) query.set('limit', String(options.limit));

  const suffix = query.toString() ? `?${query}` : '';

  return apiGet<{
    success: boolean;
    notifications: ApiNotification[];
    unreadCount: number;
  }>(`/api/v1/notifications${suffix}`);
};

export const markNotificationRead = (id: string) =>
  apiPatch<{ success: boolean }>(`/api/v1/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  apiPatch<{ success: boolean }>('/api/v1/notifications/read-all');

/**
 * Maps the `kind` the backend writes onto the panel's icon vocabulary.
 * See notify() in back-end/database/src/controller/prescriptionController.js.
 */
export function notificationKindToType(kind: unknown): string {
  switch (kind) {
    case 'prescription_issued':
    case 'pharmacy_order_received':
    case 'pharmacy_order_status':
      return 'prescription';
    case 'pharmacy_message':
      return 'message';
    default:
      return 'default';
  }
}

/** "2m ago", "3h ago", "5d ago" — matches how the panel already labels time. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

/** Groups notifications the way the panel renders them. */
export function sectionLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Earlier';

  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 2) return 'Yesterday';
  if (days < 8) return 'A week ago';
  return 'Earlier';
}
