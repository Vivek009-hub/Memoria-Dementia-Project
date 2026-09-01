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
  REMINDER: 'bg-[#F4C542]/20 text-[#FFD75A] border-[#F4C542]/40',
  COMMUNITY_SESSION: 'bg-[#6366F1]/20 text-[#818CF8] border-[#6366F1]/40',
  MEETING: 'bg-[#14B8A6]/20 text-[#2DD4BF] border-[#14B8A6]/40',
  SOS: 'bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/40',
  POSSIBLE_FALL: 'bg-[#EF4444]/20 text-[#FCA5A5] border-[#EF4444]/40',
  GEOFENCE: 'bg-[#F59E0B]/20 text-[#FCD34D] border-[#F59E0B]/40',
  SYSTEM: 'bg-[#818CF8]/20 text-[#A78BFA] border-[#818CF8]/40',
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
      className={`group relative bg-[#0F172A] border rounded-3xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
        !notification.isRead
          ? 'border-[#6366F1]/50 bg-[#6366F1]/10'
          : 'border-[#27324A] opacity-75 hover:opacity-100 hover:border-[#3B4C6E]'
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
                <span className="text-xs font-black uppercase tracking-wider text-[#94A3B8]">
                  {notification.type?.replace('_', ' ')}
                </span>
                {notification.priority === 'CRITICAL' && (
                  <span className="px-2 py-0.5 bg-[#EF4444]/20 text-[#FCA5A5] text-xs font-black rounded-lg border border-[#EF4444]/40 uppercase">
                    Critical
                  </span>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-[#F8FAFC] leading-snug group-hover:text-[#F4C542] transition-colors">
                {notification.title}
              </h3>
            </div>
          </div>

          {!notification.isRead && (
            <span className="w-3 h-3 bg-[#F4C542] rounded-full shrink-0 animate-pulse mt-2 shadow-lg shadow-[#F4C542]/50" />
          )}
        </div>

        {/* Message */}
        <p className="text-sm font-semibold text-[#CBD5E1] leading-relaxed pl-12">
          {notification.message}
        </p>
      </div>

      {/* Footer Timestamp + Actions */}
      <div className="pt-3 border-t border-[#27324A] flex items-center justify-between text-xs text-[#94A3B8]">
        <span className="font-mono font-bold">{formatTimestamp(notification.createdAt)}</span>

        <div className="flex items-center space-x-2">
          {!notification.isRead && onMarkRead && (
            <button
              onClick={handleMarkReadClick}
              disabled={marking}
              className="px-3 py-1.5 bg-[#151B2B] hover:bg-[#242D40] text-[#CBD5E1] text-xs font-extrabold rounded-xl border border-[#27324A] flex items-center space-x-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Mark Read</span>
            </button>
          )}

          <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:text-[#F4C542] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
