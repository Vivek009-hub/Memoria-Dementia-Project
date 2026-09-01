/**
 * ReminderCard.jsx — Reminders Component
 */

import React, { useState } from 'react';
import {
  Pill, Utensils, Calendar, Activity, Gift, Clock, Users, Video,
  CheckCircle2, XCircle, Volume2, Repeat
} from 'lucide-react';

const TYPE_ICONS = {
  MEDICATION: Pill,
  MEAL: Utensils,
  APPOINTMENT: Calendar,
  ACTIVITY: Activity,
  BIRTHDAY: Gift,
  IMPORTANT_EVENT: Clock,
  COMMUNITY_SESSION: Users,
  MEETING_CIRCLE: Video,
  OTHER: Clock,
};

export function ReminderCard({ reminder, status = 'PENDING', onComplete, onSkip, onSelect }) {
  const [acting, setActing] = useState(false);

  const TypeIcon = TYPE_ICONS[reminder.type] || Clock;

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      const minStr = m < 10 ? `0${m}` : m;
      return `${hour12}:${minStr} ${period}`;
    } catch {
      return timeStr;
    }
  };

  const handleCompleteClick = async (e) => {
    e.stopPropagation();
    if (acting) return;
    setActing(true);
    try {
      await onComplete(reminder);
    } finally {
      setActing(false);
    }
  };

  const handleSkipClick = async (e) => {
    e.stopPropagation();
    if (acting) return;
    setActing(true);
    try {
      await onSkip(reminder);
    } finally {
      setActing(false);
    }
  };

  const isCompleted = status === 'COMPLETED';
  const isSkipped = status === 'SKIPPED' || status === 'CANCELLED';

  return (
    <div
      onClick={() => onSelect && onSelect(reminder)}
      className={`group relative bg-[#202020] border rounded-xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isCompleted
          ? 'border-[#45B982]/40 bg-[#45B982]/5'
          : isSkipped
          ? 'border-[#343434] opacity-60'
          : 'border-[#343434] hover:border-[#D8B24C]/60'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Open reminder: ${reminder.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect && onSelect(reminder);
        }
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-[#D8B24C] tracking-tight font-mono">
              {formatTime(reminder.schedule?.time)}
            </span>
            {reminder.voiceEnabled && (
              <span className="p-1 bg-[#D8B24C]/10 text-[#D8B24C] rounded border border-[#D8B24C]/20" title="Voice assistance enabled">
                <Volume2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#151515] border border-[#343434] text-[#A7A7A2] flex items-center space-x-1.5 capitalize">
            <TypeIcon className="w-3.5 h-3.5 text-[#D8B24C]" />
            <span>{reminder.type?.toLowerCase().replace('_', ' ')}</span>
          </div>
        </div>

        <h3 className={`text-base font-semibold mb-1 line-clamp-1 ${isCompleted ? 'line-through text-[#74746F]' : 'text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors'}`}>
          {reminder.title}
        </h3>

        {reminder.description && (
          <p className="text-xs text-[#A7A7A2] line-clamp-2 mb-3 leading-relaxed">
            {reminder.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-[#A7A7A2] mb-3">
          {reminder.recurrence ? (
            <div className="flex items-center space-x-1 bg-[#151515] px-2.5 py-0.5 rounded-md border border-[#343434] text-[#A7A7A2]">
              <Repeat className="w-3 h-3 text-[#D8B24C]" />
              <span>
                {reminder.recurrence.frequency}
                {reminder.recurrence.frequency === 'WEEKLY' && reminder.recurrence.weekdays?.length > 0 && (
                  ` (${reminder.recurrence.weekdays.length} days)`
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-[#151515] px-2.5 py-0.5 rounded-md border border-[#343434] text-[#74746F]">
              <span>One-Time</span>
            </div>
          )}

          {isCompleted && (
            <span className="px-2.5 py-0.5 bg-[#45B982]/10 text-[#45B982] text-xs font-medium rounded-md border border-[#45B982]/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </span>
          )}

          {isSkipped && (
            <span className="px-2.5 py-0.5 bg-[#151515] text-[#74746F] text-xs font-medium rounded-md border border-[#343434] flex items-center space-x-1">
              <XCircle className="w-3 h-3" />
              <span>Skipped</span>
            </span>
          )}
        </div>
      </div>

      {!isCompleted && !isSkipped && (onComplete || onSkip) && (
        <div className="pt-3 border-t border-[#343434] flex items-center justify-between gap-2">
          {onComplete && (
            <button
              onClick={handleCompleteClick}
              disabled={acting}
              className="flex-1 py-2 bg-[#45B982] hover:bg-[#45B982]/90 disabled:opacity-50 text-[#151515] font-semibold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors touch-target"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          )}

          {onSkip && (
            <button
              onClick={handleSkipClick}
              disabled={acting}
              className="py-2 px-3 bg-transparent hover:bg-[#151515] disabled:opacity-50 text-[#A7A7A2] hover:text-[#F5F5F0] font-medium text-xs rounded-lg border border-[#343434] transition-colors touch-target"
            >
              <span>Skip</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
