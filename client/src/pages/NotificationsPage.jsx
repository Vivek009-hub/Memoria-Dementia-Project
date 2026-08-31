/**
 * NotificationsPage.jsx — Notifications & Activity Feed Page (Phase F10 / B9)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, CheckCheck, Settings, RefreshCw, AlertTriangle, Filter, ChevronLeft, ChevronRight
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Bell className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Activity Center</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time activity alerts, routine reminders, and community updates.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-sm rounded-2xl border border-slate-700 flex items-center space-x-2 transition-all"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={() => setPrefsModalOpen(true)}
            className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition-colors"
            title="Notification Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedType(cat.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                selectedType === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800"
          />
          <span>Unread Only</span>
        </label>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading notifications...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Could Not Load Notifications</h3>
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
          <Bell className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white">No Notifications Found</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            You're all caught up! New routine alerts and activity updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <NotificationItem
              key={item._id}
              notification={item}
              onMarkRead={handleMarkRead}
              onClick={handleNotificationClick}
            />
          ))}

          {pagination.pages > 1 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-sm mt-4">
              <span className="text-slate-400 text-xs font-bold">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-slate-950 border border-slate-800 disabled:opacity-40 rounded-xl text-white font-bold"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2 bg-slate-950 border border-slate-800 disabled:opacity-40 rounded-xl text-white font-bold"
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
