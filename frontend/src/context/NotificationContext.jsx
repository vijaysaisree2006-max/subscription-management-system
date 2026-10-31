import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif_01',
    title: 'Overdue Invoice: Hyperion Supply Chain',
    message: 'Invoice INV-2026-0982 ($499.00) is past due by 7 days. Dunning retry cycle active.',
    timestamp: '12m ago',
    type: 'warning',
    isRead: false,
    targetModule: 'invoices',
    targetFilter: 'overdue',
    roles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'notif_02',
    title: 'Payment Authorization Failed',
    message: 'Andina Logistics SA (Amex •••• 3004) auto-debit of $499.00 was declined. Card expired.',
    timestamp: '45m ago',
    type: 'error',
    isRead: false,
    targetModule: 'payments',
    targetFilter: 'failed',
    roles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'notif_03',
    title: 'Quotation Confirmed: Al-Mansoor Group',
    message: 'Quotation sub_1Qf33k confirmed by client. Ready for manual or automated contract activation.',
    timestamp: '2h ago',
    type: 'success',
    isRead: false,
    targetModule: 'subscriptions',
    targetFilter: 'confirmed',
    roles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'notif_04',
    title: 'Annual Contract Renewal Upcoming',
    message: 'Meridian Health Tech Ltd contract sub_1Qk89a ($4,990.00/yr) is scheduled for renewal.',
    timestamp: '1d ago',
    type: 'info',
    isRead: true,
    targetModule: 'subscriptions',
    targetFilter: 'active',
    roles: ['ADMIN', 'STAFF'],
  },
  {
    id: 'notif_05',
    title: 'Unpaid Receivable Alert',
    message: 'Invoice INV-2026-0980 ($499.00) requires billing operations review before grace period cutoff.',
    timestamp: '2d ago',
    type: 'warning',
    isRead: true,
    targetModule: 'invoices',
    targetFilter: 'overdue',
    roles: ['ADMIN', 'STAFF'],
  },
  // Customer-scoped notifications
  {
    id: 'notif_cust_01',
    title: 'Upcoming Annual Renewal Notice',
    message: 'Your Enterprise Suite subscription ($4,990.00/yr) will renew automatically on Jan 15, 2027.',
    timestamp: '1h ago',
    type: 'info',
    isRead: false,
    targetModule: 'portal',
    targetFilter: 'ALL',
    roles: ['CUSTOMER'],
  },
  {
    id: 'notif_cust_02',
    title: 'Payment Receipt Settled',
    message: 'Invoice INV-2026-0984 ($4,990.00) was successfully paid via Visa •••• 4242.',
    timestamp: '2d ago',
    type: 'success',
    isRead: true,
    targetModule: 'portal',
    targetFilter: 'ALL',
    roles: ['CUSTOMER'],
  },
];

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  // Load from localStorage or use defaults
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('sms_notifications_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse notifications from localStorage', e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  // Save to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem('sms_notifications_list', JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  // Filter notifications for active user role
  const userRole = user?.role || 'ADMIN';
  const roleNotifications = notifications.filter((n) => n.roles.includes(userRole));
  const unreadCount = roleNotifications.filter((n) => !n.isRead).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.roles.includes(userRole) ? { ...n, isRead: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications((prev) => prev.filter((n) => !n.roles.includes(userRole)));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const resetToDefault = () => {
    setNotifications(DEFAULT_NOTIFICATIONS);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: roleNotifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        deleteNotification,
        resetToDefault,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
