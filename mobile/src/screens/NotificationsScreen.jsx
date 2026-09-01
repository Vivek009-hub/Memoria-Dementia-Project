/**
 * NotificationsScreen.jsx — Notification & Activity Center Hub (Phase F8 / B9)
 *
 * Displays patient notifications with:
 * - All vs Unread tab filters
 * - Real-time unread count sync
 * - One-tap Mark All as Read button
 * - Deep navigation routing to target feature tabs upon clicking notifications
 * - Preferences settings modal
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, CheckCheck, RefreshCw, AlertTriangle, Settings, Filter, Sparkles
} from 'lucide-react';
import { NotificationItem } from '../components/NotificationItem.jsx';
import { NotificationPreferencesModal } from '../components/NotificationPreferencesModal.jsx';
import * as notificationsApi from '../api/notifications.api.js';

export function NotificationsScreen({ onNavigate, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [markingAll, setMarkingAll] = useState(false);
  const [prefModalOpen, setPrefModalOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await notificationsApi.listNotifications({
        isRead: filterUnread ? 'false' : undefined,
        limit: 30,
      });

      if (res.data) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }

      // Update unread badge counter in header
      const countRes = await notificationsApi.getUnreadCount();
      if (countRes.data?.unreadCount !== undefined) {
        onUnreadCountChange && onUnreadCountChange(countRes.data.unreadCount);
      }
    } catch (err) {
      setErrorMsg(err.message || 'We couldn\'t load your notifications right now.');
    } finally {
      setLoading(false);
    }
  }, [filterUnread, onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Actions
  const handleMarkRead = async (notificationId) => {
    await notificationsApi.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    const countRes = await notificationsApi.getUnreadCount();
    if (countRes.data?.unreadCount !== undefined) {
      onUnreadCountChange && onUnreadCountChange(countRes.data.unreadCount);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUnreadCountChange && onUnreadCountChange(0);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  // Safe navigation handler on notification tap
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkRead(notification._id);
    }

    if (!onNavigate) return;

    const type = notification.type;
    if (type === 'REMINDER') {
      onNavigate('reminders');
    } else if (type === 'COMMUNITY_SESSION' || type === 'MEETING') {
      onNavigate('community');
    } else if (type === 'SOS' || type === 'POSSIBLE_FALL' || type === 'GEOFENCE') {
      onNavigate('safety');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0F172A] border border-[#27324A] rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-[#F4C542] mb-2">
            <Bell className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Activity & Notifications</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#F8FAFC] tracking-tight">Notification Center</h1>
          <p className="text-[#CBD5E1] text-base mt-1">
            View important updates, reminders, and community alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPrefModalOpen(true)}
            className="p-3 bg-[#151B2B] hover:bg-[#242D40] text-[#CBD5E1] hover:text-[#F8FAFC] rounded-2xl border border-[#27324A] transition-all shadow-sm"
            title="Notification Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="px-5 py-3 bg-[#F4C542] hover:bg-[#FFD75A] disabled:opacity-40 text-[#0F172A] font-extrabold text-sm rounded-2xl shadow-lg shadow-[#F4C542]/20 flex items-center space-x-2 transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-[#0F172A] border border-[#27324A] rounded-3xl p-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterUnread(false)}
            className={`py-2.5 px-5 rounded-2xl text-xs font-extrabold transition-all ${
              !filterUnread
                ? 'bg-[#F4C542] text-[#0F172A] shadow-md'
                : 'bg-[#151B2B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#27324A]'
            }`}
          >
            All Notifications
          </button>

          <button
            onClick={() => setFilterUnread(true)}
            className={`py-2.5 px-5 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
              filterUnread
                ? 'bg-[#F4C542] text-[#0F172A] shadow-md'
                : 'bg-[#151B2B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#27324A]'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#EF4444] text-white font-black text-xs rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={fetchNotifications}
          className="p-2.5 bg-[#151B2B] hover:bg-[#242D40] border border-[#27324A] rounded-2xl text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
          title="Refresh notifications"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Notification List */}
      {loading ? (
        <div className="bg-[#0F172A] rounded-3xl p-12 border border-[#27324A] text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-[#F4C542] animate-spin mx-auto mb-3" />
          <p className="text-[#CBD5E1] font-bold text-lg">Loading notifications...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#0F172A] rounded-3xl p-8 border border-red-500/30 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-[#EF4444] mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-[#F8FAFC] mb-1">We Couldn't Load Notifications</h3>
            <p className="text-sm text-[#94A3B8]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchNotifications}
            className="px-6 py-3 bg-[#151B2B] hover:bg-[#242D40] text-[#F8FAFC] font-bold text-sm rounded-2xl border border-[#27324A] transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-[#0F172A] rounded-3xl p-12 border border-[#27324A] text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-[#F4C542]/10 border border-[#F4C542]/30 rounded-full flex items-center justify-center mx-auto text-[#F4C542]">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-black text-[#F8FAFC]">You're All Caught Up</h3>
          <p className="text-[#94A3B8] text-base max-w-md mx-auto">
            {filterUnread
              ? 'You have no unread notifications right now.'
              : 'No new activity or notifications at this time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onMarkRead={handleMarkRead}
              onClick={handleNotificationClick}
            />
          ))}
        </div>
      )}

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={prefModalOpen}
        onClose={() => setPrefModalOpen(false)}
      />
    </div>
  );
}
