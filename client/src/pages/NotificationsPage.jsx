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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#D8B24C] mb-1">
            <Bell className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Activity Center</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F0] tracking-tight">Notifications</h1>
          <p className="text-xs text-[#A7A7A2] mt-1">
            Real-time activity alerts, routine reminders, and community updates.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="px-4 py-2.5 bg-[#151515] hover:bg-[#242424] disabled:opacity-50 text-[#F5F5F0] font-medium text-xs rounded-lg border border-[#343434] flex items-center space-x-2 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-[#45B982]" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={() => setPrefsModalOpen(true)}
            className="p-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg border border-[#343434] transition-colors"
            title="Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#202020] border border-[#343434] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {TYPE_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedType(cat.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedType === cat.id
                  ? 'bg-[#D8B24C] text-[#151515] shadow-xs'
                  : 'bg-[#151515] border border-[#343434] text-[#A7A7A2] hover:text-[#F5F5F0]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <label className="flex items-center space-x-2 text-xs font-medium text-[#A7A7A2] cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 rounded text-[#D8B24C] bg-[#151515] border-[#343434] focus:ring-[#D8B24C]"
          />
          <span>Unread Only</span>
        </label>
      </div>

      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] font-medium text-sm">Loading notifications...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#202020] border border-[#D95C5C]/30 rounded-xl p-8 text-center shadow-xs space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F0] mb-1">Could Not Load Notifications</h3>
            <p className="text-xs text-[#A7A7A2]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchNotifications}
            className="px-5 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] font-medium text-xs rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center shadow-xs space-y-3">
          <Bell className="w-10 h-10 text-[#D8B24C] mx-auto opacity-50 stroke-1" />
          <h3 className="text-lg font-semibold text-[#F5F5F0]">No Notifications Found</h3>
          <p className="text-[#A7A7A2] text-xs max-w-sm mx-auto">
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
            <div className="bg-[#202020] border border-[#343434] rounded-xl p-4 flex items-center justify-between text-xs mt-4">
              <span className="text-[#A7A7A2] font-medium">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-[#151515] border border-[#343434] disabled:opacity-40 rounded-lg text-[#F5F5F0]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages}
                  className="p-2 bg-[#151515] border border-[#343434] disabled:opacity-40 rounded-lg text-[#F5F5F0]"
                >
                  <ChevronRight className="w-4 h-4" />
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
