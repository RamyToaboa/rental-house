import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Bell, Plus, Menu, Sun, Moon, Mail, Check, Trash2, 
  CheckCheck, Building2, X, Volume2, VolumeX, AlertTriangle, 
  MailOpen, RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationsContext';

const Topbar = ({ onMenuClick, title = 'Dashboard', subtitle }) => {
  const { theme, toggleTheme } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    muted,
    markAsRead, 
    markAsUnread,
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    toggleMute,
  } = useNotifications();
  const isDark = theme === 'dark';

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifPos, setNotifPos] = useState({ top: 0, left: 0, width: 0 });
  const notifButtonRef = useRef(null);
  const notifMenuRef = useRef(null);

  // 👇 Confirm-clear state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Position notification dropdown
  useLayoutEffect(() => {
    if (!isNotifOpen || !notifButtonRef.current) return;
    const rect = notifButtonRef.current.getBoundingClientRect();
    const padding = 12;
    const isMobile = window.innerWidth < 640;
    const width = isMobile ? Math.min(window.innerWidth - padding * 2, 400) : 400;

    let left = isMobile ? padding : rect.right - width;
    left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));

    const spaceBelow = window.innerHeight - rect.bottom;
    const approxHeight = 520;
    const top = spaceBelow < approxHeight && rect.top > approxHeight
      ? rect.top - 8 - approxHeight
      : rect.bottom + 8;

    setNotifPos({ top, left, width });
  }, [isNotifOpen]);

  // Recalculate on resize
  useEffect(() => {
    if (!isNotifOpen) return;
    const handleResize = () => {
      if (!notifButtonRef.current) return;
      const rect = notifButtonRef.current.getBoundingClientRect();
      const padding = 12;
      const isMobile = window.innerWidth < 640;
      const width = isMobile ? Math.min(window.innerWidth - padding * 2, 400) : 400;
      let left = isMobile ? padding : rect.right - width;
      left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));
      setNotifPos(prev => ({ ...prev, left, width }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isNotifOpen]);

  // Click outside + scroll to close
  useEffect(() => {
    if (!isNotifOpen) return;
    const handleClickOutside = (e) => {
      if (
        notifButtonRef.current && !notifButtonRef.current.contains(e.target) &&
        notifMenuRef.current && !notifMenuRef.current.contains(e.target)
      ) {
        setIsNotifOpen(false);
      }
    };
    const handleScroll = (e) => {
      if (notifMenuRef.current && notifMenuRef.current.contains(e.target)) return;
      setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isNotifOpen]);

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <header 
        className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/80 sm:px-6 lg:px-8"
        style={{ willChange: 'transform' }}
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 hidden truncate text-sm text-gray-500 dark:text-slate-400 sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties, tenants..."
              className="w-64 rounded-xl border border-gray-200 bg-gray-50 py-2 pr-4 pl-9 text-sm text-gray-700 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:w-72"
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Notification bell */}
          <button
            ref={notifButtonRef}
            onClick={() => setIsNotifOpen(v => !v)}
            aria-label={`Notifications (${unreadCount} unread)`}
            className={`relative rounded-xl border p-2 shadow-sm transition-colors ${
              isNotifOpen
                ? 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-500/20 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 animate-in zoom-in items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-emerald-200 transition-colors hover:bg-emerald-600 dark:shadow-none sm:px-4">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Property</span>
          </button>
        </div>
      </header>

      {/* 👇 Notification dropdown */}
      {isNotifOpen && createPortal(
        <div
          ref={notifMenuRef}
          style={{
            position: 'fixed',
            top: `${notifPos.top}px`,
            left: `${notifPos.left}px`,
            width: `${notifPos.width}px`,
            zIndex: 9999,
            WebkitOverflowScrolling: 'touch',
          }}
          className="animate-dropdown-in overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800 dark:ring-black/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-50 px-4 py-3 dark:border-slate-700/60">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
              <p className="truncate text-[10px] font-medium text-gray-500 dark:text-slate-400">
                {unreadCount > 0 
                  ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`
                  : 'You\'re all caught up'}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {/* Mute toggle */}
              <button
                onClick={toggleMute}
                title={muted ? 'Unmute sound' : 'Mute sound'}
                className={`rounded-lg p-1.5 transition-colors ${
                  muted
                    ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                    : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10'
                }`}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}

              {/* Clear all */}
              {notifications.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  title="Clear all notifications"
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div
            className="
              max-h-[60vh] sm:max-h-110 overflow-y-auto overscroll-contain
              [-webkit-overflow-scrolling:touch]
              [&::-webkit-scrollbar]:w-2.5
              [&::-webkit-scrollbar-track]:bg-gray-50
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gray-300
              dark:[&::-webkit-scrollbar-track]:bg-slate-900
              dark:[&::-webkit-scrollbar-thumb]:bg-slate-600
            "
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-gray-100 p-4 dark:bg-slate-700/50">
                  <Bell className="h-6 w-6 text-gray-400 dark:text-slate-500" />
                </div>
                <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">No notifications</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  You'll be notified when tenants send messages
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`group relative border-b border-gray-50 transition-colors last:border-0 dark:border-slate-700/60 ${
                    !notif.read
                      ? 'bg-emerald-50/40 dark:bg-emerald-500/5'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <button
                    onClick={() => notif.read ? markAsUnread(notif.id) : markAsRead(notif.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      notif.type === 'contact-message'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                    }`}>
                      <Mail className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1 pr-6">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${
                          !notif.read 
                            ? 'font-bold text-gray-900 dark:text-white' 
                            : 'font-medium text-gray-700 dark:text-slate-300'
                        }`}>
                          {notif.title || 'New message'}
                        </p>
                        {!notif.read && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-slate-400">
                        {notif.message}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-slate-700 dark:text-slate-300">
                          {notif.from}
                        </span>
                        {notif.propertyTitle && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <Building2 className="h-2.5 w-2.5" />
                            {notif.propertyTitle}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Delete single button (hover) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                    className="absolute right-2 top-2 rounded-lg p-1.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:text-slate-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-2 dark:border-slate-700/60 dark:bg-slate-900/50">
              <p className="text-center text-[10px] text-gray-500 dark:text-slate-400">
                Click a message to {unreadCount > 0 ? 'mark as read' : 'toggle read status'}
              </p>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* 👇 Clear All Confirmation Modal */}
      {showClearConfirm && createPortal(
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex flex-col items-center px-6 pt-8 text-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                Clear all notifications?
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                This will permanently remove all {notifications.length} notification{notifications.length > 1 ? 's' : ''}.
                This action cannot be undone.
              </p>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="w-full rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={() => { clearAll(); setShowClearConfirm(false); }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Topbar;