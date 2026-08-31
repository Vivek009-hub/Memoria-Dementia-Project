/**
 * NotificationItem.jsx — Elder-Friendly Notification Card Component
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
  REMINDER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  COMMUNITY_SESSION: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  MEETING: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  SOS: 'bg-red-500/20 text-red-300 border-red-500/30',
  POSSIBLE_FALL: 'bg-red-500/20 text-red-300 border-red-500/30',
  GEOFENCE: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  SYSTEM: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
};

export function NotificationItem({ notification, onMarkRead, onClick }) {
  const [marking, setMarking] = useState(false);

  const TypeIcon = TYPE_ICONS[notification.type] || Bell;
  const typeStyle = TYPE_STYLES[notification.type] || TYPE_STYLES.SYSTEM;

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
      className={`group relative bg-slate-900 border rounded-3xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
        !notification.isRead
          ? 'border-indigo-500/50 bg-indigo-950/15'
          : 'border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-700'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Notification: ${notification.title}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-2xl border ${typeStyle}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {notification.type?.replace('_', ' ')}
                </span>
                {notification.priority === 'CRITICAL' && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-black rounded-md border border-red-500/40">
                    CRITICAL
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors">
                {notification.title}
              </h3>
            </div>
          </div>

          {!notification.isRead && (
            <span className="w-3 h-3 bg-indigo-500 rounded-full shrink-0 shadow-lg shadow-indigo-500/50 animate-pulse mt-1" />
          )}
        </div>

        <p className="text-sm text-slate-300 leading-relaxed pl-12">
          {notification.message}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="font-bold">{formatTimestamp(notification.createdAt)}</span>

        <div className="flex items-center space-x-2">
          {!notification.isRead && onMarkRead && (
            <button
              onClick={handleMarkReadClick}
              disabled={marking}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center space-x-1 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark Read</span>
            </button>
          )}

          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
