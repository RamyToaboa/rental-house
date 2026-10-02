import React, { createContext, useContext, useState, useEffect } from 'react';
import { playNotificationSound } from '../utils/notificationSound';

const NotificationsContext = createContext(null);

const STORAGE_KEY = 'realEstateInbox';

// 👇 Simple mute preference (admin can toggle)
const MUTE_KEY = 'realEstateInboxMuted';

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // 👇 Sound mute preference
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }, [notifications]);

  // Persist mute preference
  useEffect(() => {
    try {
      localStorage.setItem(MUTE_KEY, String(muted));
    } catch {}
  }, [muted]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // 👇 Play sound when a new notification arrives
  useEffect(() => {
    // We only play sound when the count INCREASES (not on initial load)
    const handleNotificationAdded = () => {
      if (!muted) playNotificationSound();
    };
    window.addEventListener('notification-added', handleNotificationAdded);
    return () => window.removeEventListener('notification-added', handleNotificationAdded);
  }, [muted]);

  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification,
    };
    setNotifications((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return [newNotif, ...safePrev];
    });
    // 👇 Fire an event so the sound only plays when a NEW notification is added
    window.dispatchEvent(new CustomEvent('notification-added'));
    return newNotif;
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAsUnread = (id) => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).filter((n) => n.id !== id)
    );
  };

  const clearAll = () => setNotifications([]);

  const toggleMute = () => setMuted((m) => !m);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  return (
    <NotificationsContext.Provider
      value={{
        notifications: Array.isArray(notifications) ? notifications : [],
        unreadCount,
        muted,
        addNotification,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        clearAll,
        toggleMute,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>');
  return ctx;
};