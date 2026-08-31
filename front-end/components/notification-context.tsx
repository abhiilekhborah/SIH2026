import { createContext, useContext, useState, useCallback } from 'react';
import { NotificationPanel, NotificationSection } from './notification-panel';

const INITIAL_SECTIONS: NotificationSection[] = [
  {
    label: 'Today',
    data: [
      {
        id: '1',
        icon: 'heart-outline',
        iconColor: '#EF4444',
        title: 'New Appointment Confirmed',
        description: 'Your appointment with Dr. Sarah Johnson has been confirmed for tomorrow at 10:00 AM.',
        time: '2m ago',
      },
      {
        id: '2',
        icon: 'medkit-outline',
        iconColor: '#1A66E8',
        title: 'Prescription Ready',
        description: 'Your prescription for Amoxicillin is ready for pickup at City Pharmacy.',
        time: '1h ago',
      },
      {
        id: '3',
        icon: 'chatbubble-outline',
        iconColor: '#16A34A',
        title: 'New Message from Dr. Lee',
        description: 'Dr. Lee sent you a message regarding your recent lab results.',
        time: '3h ago',
      },
    ],
  },
  {
    label: 'Yesterday',
    data: [
      {
        id: '4',
        icon: 'document-text-outline',
        iconColor: '#9333EA',
        title: 'Lab Results Available',
        description: 'Your blood test results from HealthLab are now available to view.',
        time: '1d ago',
      },
      {
        id: '5',
        icon: 'notifications-outline',
        iconColor: '#F59E0B',
        title: 'Appointment Reminder',
        description: 'You have a checkup scheduled with Dr. Patel in 2 days.',
        time: '1d ago',
      },
    ],
  },
  {
    label: 'A week ago',
    data: [
      {
        id: '6',
        icon: 'star-outline',
        iconColor: '#F59E0B',
        title: 'Rate Your Visit',
        description: 'How was your experience with City Hospital? Leave a review to help others.',
        time: '5d ago',
      },
      {
        id: '7',
        icon: 'card-outline',
        iconColor: '#1A66E8',
        title: 'Payment Processed',
        description: 'Your payment of $45.00 for consultation has been processed successfully.',
        time: '6d ago',
      },
      {
        id: '8',
        icon: 'people-outline',
        iconColor: '#16A34A',
        title: 'Referral Reward',
        description: 'You earned 500 health points for referring a friend to MediQuick.',
        time: '7d ago',
      },
    ],
  },
];

type NotificationContextType = {
  openNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  openNotifications: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [sections, setSections] = useState(INITIAL_SECTIONS);

  const openNotifications = useCallback(() => setVisible(true), []);
  const closeNotifications = useCallback(() => setVisible(false), []);

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
    <NotificationContext.Provider value={{ openNotifications }}>
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
