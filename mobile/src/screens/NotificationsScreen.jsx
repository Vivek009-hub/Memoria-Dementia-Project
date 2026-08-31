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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Bell className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Activity & Notifications</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Notification Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            View important updates, reminders, and community alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPrefModalOpen(true)}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-2xl border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2 transition-all touch-target-xl"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
              !filterUnread
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Notifications
          </button>

          <button
            onClick={() => setFilterUnread(true)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-1.5 transition-all ${
              filterUnread
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-400 text-slate-950 font-black text-[10px] rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={fetchNotifications}
          className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          title="Refresh notifications"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Notification List */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading notifications...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">We Couldn't Load Notifications</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={fetchNotifications}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
          <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400">
            <Bell className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-white mb-1">You're All Caught Up</h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            {filterUnread
              ? 'You have no unread notifications right now.'
              : 'No new activity or notifications at this time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
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
