/**
 * ReminderCard.jsx — Reminders Component
 */

import React, { useState } from 'react';
import {
  Pill, Utensils, Calendar, Activity, Gift, Clock, Users, Video,
  CheckCircle2, XCircle, ChevronRight, Volume2, Repeat
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
      className={`group relative bg-[#252525] border rounded-xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
        isCompleted
          ? 'border-[#8BAA78]/40 bg-[#8BAA78]/5'
          : isSkipped
          ? 'border-[#343434] opacity-60'
          : 'border-[#343434] hover:border-[#DDBB55]/50'
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
            <span className="text-xl font-semibold text-[#DDBB55] tracking-tight">
              {formatTime(reminder.schedule?.time)}
            </span>
            {reminder.voiceEnabled && (
              <span className="p-1 bg-[#DDBB55]/10 text-[#DDBB55] rounded" title="Voice assistance enabled">
                <Volume2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#1E1E1E] border border-[#343434] text-[#A0A0A0] flex items-center space-x-1.5 capitalize">
            <TypeIcon className="w-3.5 h-3.5 text-[#DDBB55]" />
            <span>{reminder.type?.toLowerCase().replace('_', ' ')}</span>
          </div>
        </div>

        <h3 className={`text-base font-semibold mb-1 line-clamp-1 ${isCompleted ? 'line-through text-[#747474]' : 'text-[#E8E8E8] group-hover:text-[#DDBB55] transition-colors'}`}>
          {reminder.title}
        </h3>

        {reminder.description && (
          <p className="text-xs text-[#A0A0A0] line-clamp-2 mb-3 leading-relaxed">
            {reminder.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-[#A0A0A0] mb-3">
          {reminder.recurrence ? (
            <div className="flex items-center space-x-1 bg-[#1E1E1E] px-2.5 py-0.5 rounded-md border border-[#343434] text-[#A0A0A0]">
              <Repeat className="w-3 h-3 text-[#DDBB55]" />
              <span>
                {reminder.recurrence.frequency}
                {reminder.recurrence.frequency === 'WEEKLY' && reminder.recurrence.weekdays?.length > 0 && (
                  ` (${reminder.recurrence.weekdays.length} days)`
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-[#1E1E1E] px-2.5 py-0.5 rounded-md border border-[#343434] text-[#747474]">
              <span>One-Time</span>
            </div>
          )}

          {isCompleted && (
            <span className="px-2.5 py-0.5 bg-[#8BAA78]/10 text-[#8BAA78] text-xs font-medium rounded-md border border-[#8BAA78]/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </span>
          )}

          {isSkipped && (
            <span className="px-2.5 py-0.5 bg-[#1E1E1E] text-[#747474] text-xs font-medium rounded-md border border-[#343434] flex items-center space-x-1">
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
              className="flex-1 py-2 bg-[#8BAA78] hover:bg-[#8BAA78]/90 disabled:opacity-50 text-[#1E1E1E] font-semibold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          )}

          {onSkip && (
            <button
              onClick={handleSkipClick}
              disabled={acting}
              className="py-2 px-3 bg-transparent hover:bg-[#1E1E1E] disabled:opacity-50 text-[#A0A0A0] hover:text-[#E8E8E8] font-medium text-xs rounded-lg border border-[#343434] transition-colors"
            >
              <span>Skip</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

