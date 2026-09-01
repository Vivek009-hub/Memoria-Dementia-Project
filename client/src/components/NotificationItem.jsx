/**
 * NotificationItem.jsx — Memora Notification Card Component
 */

import React, { useState } from 'react';
import {
  Bell, Clock, Users, Video, ShieldAlert, AlertTriangle, AlertCircle, ChevronRight, Check
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
  REMINDER: 'bg-[#D8B24C]/10 text-[#D8B24C] border-[#D8B24C]/30',
  COMMUNITY_SESSION: 'bg-[#9B6B9E]/10 text-[#9B6B9E] border-[#9B6B9E]/30',
  MEETING: 'bg-[#45B982]/10 text-[#45B982] border-[#45B982]/30',
  SOS: 'bg-[#D95C5C]/10 text-[#D95C5C] border-[#D95C5C]/30',
  POSSIBLE_FALL: 'bg-[#D95C5C]/10 text-[#D95C5C] border-[#D95C5C]/30',
  GEOFENCE: 'bg-[#E5A83B]/10 text-[#E5A83B] border-[#E5A83B]/30',
  SYSTEM: 'bg-[#D8B24C]/10 text-[#D8B24C] border-[#D8B24C]/30',
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
      className={`group relative bg-[#202020] border rounded-xl p-4 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
        !notification.isRead
          ? 'border-[#D8B24C]/50 bg-[#242424]'
          : 'border-[#343434] opacity-80 hover:opacity-100 hover:border-[#343434]/80'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Notification: ${notification.title}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg border ${typeStyle}`}>
              <TypeIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A7A7A2]">
                  {notification.type?.replace('_', ' ')}
                </span>
                {notification.priority === 'CRITICAL' && (
                  <span className="px-2 py-0.5 bg-[#D95C5C]/10 text-[#D95C5C] text-[10px] font-semibold rounded border border-[#D95C5C]/30">
                    CRITICAL
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-[#F5F5F0] leading-snug group-hover:text-[#D8B24C] transition-colors">
                {notification.title}
              </h3>
            </div>
          </div>

          {!notification.isRead && (
            <span className="w-2.5 h-2.5 bg-[#D8B24C] rounded-full shrink-0 animate-pulse mt-1" />
          )}
        </div>

        <p className="text-xs text-[#A7A7A2] leading-relaxed pl-11">
          {notification.message}
        </p>
      </div>

      <div className="pt-2.5 border-t border-[#343434] flex items-center justify-between text-xs text-[#74746F]">
        <span className="font-mono">{formatTimestamp(notification.createdAt)}</span>

        <div className="flex items-center space-x-2">
          {!notification.isRead && onMarkRead && (
            <button
              onClick={handleMarkReadClick}
              disabled={marking}
              className="px-2.5 py-1 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-[11px] font-medium rounded-md border border-[#343434] flex items-center space-x-1 transition-colors"
            >
              <Check className="w-3 h-3 text-[#45B982]" />
              <span>Mark Read</span>
            </button>
          )}

          <ChevronRight className="w-3.5 h-3.5 text-[#74746F] group-hover:text-[#D8B24C] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
