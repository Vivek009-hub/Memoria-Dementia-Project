/**
 * NotificationItem.jsx — Elder-Friendly Notification Card Component
 *
 * Displays notification category icon, title, message, priority indicator,
 * relative timestamp, and mark-as-read action.
 */

import React, { useState } from 'react';
import {
  Bell, Clock, Users, Video, ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight, Check
} from 'lucide-react';

const TYPE_ICONS = {
  REMINDER: Clock,
  COMMUNITY_SESSION: Users,
  MEETING: Video,
  SOS: ShieldAlert,
  POSSIBLE_FALL: AlertTriangle,
  GEOFENCE: AlertCircle,
  DEVICE_OFFLINE: AlertCircle,
  LOW_BATTERY: AlertCircle,
  SYSTEM: Bell,
};

const TYPE_STYLES = {
  REMINDER: 'bg-purple-100 text-purple-800 border-purple-300',
  COMMUNITY_SESSION: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  MEETING: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  SOS: 'bg-rose-100 text-rose-800 border-rose-300',
  POSSIBLE_FALL: 'bg-rose-100 text-rose-800 border-rose-300',
  GEOFENCE: 'bg-amber-100 text-amber-800 border-amber-300',
  SYSTEM: 'bg-blue-100 text-blue-800 border-blue-300',
};

export function NotificationItem({ notification, onMarkRead, onClick }) {
  const [marking, setMarking] = useState(false);

  const TypeIcon = TYPE_ICONS[notification.type] || Bell;
  const typeStyle = TYPE_STYLES[notification.type] || TYPE_STYLES.SYSTEM;

  // Format relative timestamp
  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleMarkReadClick = async (e) => {
    e.stopPropagation();
    if (marking || notification.isRead) return;
    setMarking(true);
    try {
      await onMarkRead(notification._id);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(notification)}
      className={`group relative bg-white border-2 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
        !notification.isRead
          ? 'border-blue-500 bg-blue-50/30'
          : 'border-slate-200 hover:border-slate-300 opacity-90 hover:opacity-100'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Notification: ${notification.title}`}
    >
      <div>
        {/* Top Header: Category Icon + Title + Unread Indicator */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border font-bold ${typeStyle}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {notification.type?.replace('_', ' ')}
                </span>
                {notification.priority === 'CRITICAL' && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-black rounded-lg border border-rose-300 uppercase">
                    Critical
                  </span>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                {notification.title}
              </h3>
            </div>
          </div>

          {!notification.isRead && (
            <span className="w-3 h-3 bg-blue-600 rounded-full shrink-0 animate-pulse mt-2" />
          )}
        </div>

        {/* Message */}
        <p className="text-sm font-semibold text-slate-600 leading-relaxed pl-12">
          {notification.message}
        </p>
      </div>

      {/* Footer Timestamp + Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-mono font-bold text-slate-500">{formatTimestamp(notification.createdAt)}</span>

        <div className="flex items-center space-x-2">
          {!notification.isRead && onMarkRead && (
            <button
              onClick={handleMarkReadClick}
              disabled={marking}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl border border-slate-300 flex items-center space-x-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark Read</span>
            </button>
          )}

          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
