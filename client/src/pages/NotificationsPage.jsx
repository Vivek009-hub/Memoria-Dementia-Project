/**
 * NotificationsPage.jsx — Memora Activity Center & Notifications Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, CheckCheck, Settings, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { NotificationItem } from '../components/NotificationItem.jsx';
import { NotificationPreferencesModal } from '../components/NotificationPreferencesModal.jsx';
import * as notificationsApi from '../api/notifications.api.js';

const TYPE_FILTERS = [
  { id: '', label: 'All Alerts' },
  { id: 'REMINDER', label: 'Reminders' },
  { id: 'COMMUNITY_SESSION', label: 'Community' },
  { id: 'MEETING', label: 'Meetings' },
  { id: 'SOS', label: 'Safety SOS' },
  { id: 'SYSTEM', label: 'System' },
];

export function NotificationsPage({ onNavigate, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedType, setSelectedType] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await notificationsApi.getNotifications({
        type: selectedType || undefined,
        unreadOnly: unreadOnly ? true : undefined,
        page,
        limit: 10,
      });

      if (res.data) {
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }

      if (res.pagination) {
        setPagination(res.pagination);
      }

      if (res.unreadCount !== undefined && onUnreadCountChange) {
        onUnreadCountChange(res.unreadCount);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load notifications right now.');
    } finally {
      setLoading(false);
    }
  }, [selectedType, unreadOnly, page, onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    await notificationsApi.markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkRead(notification._id);
    }
    if (notification.type === 'REMINDER' && onNavigate) {
      onNavigate('/app/reminders');
    } else if (notification.type === 'COMMUNITY_SESSION' && onNavigate) {
      onNavigate('/app/community');
    } else if (notification.type === 'MEETING' && onNavigate) {
      onNavigate('/app/meetings');
    } else if ((notification.type === 'SOS' || notification.type === 'POSSIBLE_FALL') && onNavigate) {
      onNavigate('/app/safety');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-indigo-700 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-200 mb-2">
            <Bell className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Activity & Notification Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Notifications</h1>
          <p className="text-blue-100 text-base mt-1">
            Real-time activity alerts, routine reminders, and community updates.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 disabled:opacity-50 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md flex items-center space-x-2 transition-all shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-emerald-300" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={() => setPrefsModalOpen(true)}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 backdrop-blur-md transition-all shadow-sm"
            title="Notification Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedType(cat.id);
                setPage(1);
              }}
              className={`py-2 px-4 rounded-xl text-sm font-extrabold transition-all whitespace-nowrap ${
                selectedType === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <label className="flex items-center space-x-2.5 text-sm font-bold text-slate-700 cursor-pointer shrink-0 px-2 py-1 bg-slate-50 rounded-xl border border-slate-200 select-none">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <span>Unread Only</span>
        </label>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 border-2 border-slate-200 text-center shadow-sm">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-lg">Loading notifications...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-white rounded-3xl p-8 border-2 border-red-200 text-center shadow-sm space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Could Not Load Notifications</h3>
            <p className="text-sm text-slate-600">{errorMsg}</p>
          </div>
          <button
            onClick={fetchNotifications}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border-2 border-slate-200 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">You're All Caught Up!</h3>
          <p className="text-slate-600 text-base max-w-md mx-auto">
            No new activity or notifications at this time. Routine alerts and updates will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <NotificationItem
              key={item._id}
              notification={item}
              onMarkRead={handleMarkRead}
              onClick={handleNotificationClick}
            />
          ))}

          {pagination.pages > 1 && (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 flex items-center justify-between text-sm font-bold text-slate-700 mt-6 shadow-sm">
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl border border-slate-300 text-slate-800 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl border border-slate-300 text-slate-800 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <NotificationPreferencesModal
        isOpen={prefsModalOpen}
        onClose={() => setPrefsModalOpen(false)}
      />
    </div>
  );
}
