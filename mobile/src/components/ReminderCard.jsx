/**
 * ReminderCard.jsx — Elder-Friendly Reminder Card Component
 *
 * Displays reminder time in 12-hour format, type icon/badge, recurrence pattern,
 * status badge, and one-tap action buttons (Complete / Skip).
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

const TYPE_STYLES = {
  MEDICATION: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  MEAL: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  APPOINTMENT: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  ACTIVITY: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  BIRTHDAY: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  IMPORTANT_EVENT: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  COMMUNITY_SESSION: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  MEETING_CIRCLE: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  OTHER: 'bg-memora-surface-secondary text-memora-text-muted border-memora-border',
};

export function ReminderCard({ reminder, status = 'PENDING', onComplete, onSkip, onSelect }) {
  const [acting, setActing] = useState(false);

  const TypeIcon = TYPE_ICONS[reminder.type] || Clock;
  const typeStyle = TYPE_STYLES[reminder.type] || TYPE_STYLES.OTHER;

  // Format 24h HH:MM to 12h AM/PM
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
      className={`group relative bg-memora-surface border rounded-3xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between ${
        isCompleted
          ? 'border-emerald-500/40 bg-emerald-950/10'
          : isSkipped
          ? 'border-memora-border opacity-65'
          : 'border-memora-border hover:border-memora-accent/50'
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
        {/* Top Bar: Time + Category Badge + Voice Indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-memora-text tracking-tight">
              {formatTime(reminder.schedule?.time)}
            </span>
            {reminder.voiceEnabled && (
              <span className="p-1 bg-memora-accent/20 text-memora-accent rounded-md" title="Voice assistance enabled">
                <Volume2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center space-x-1 uppercase ${typeStyle}`}>
            <TypeIcon className="w-3.5 h-3.5" />
            <span>{reminder.type.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xl font-bold mb-1 line-clamp-1 ${isCompleted ? 'line-through text-memora-text-subtle' : 'text-memora-text group-hover:text-memora-accent transition-colors'}`}>
          {reminder.title}
        </h3>

        {/* Description */}
        {reminder.description && (
          <p className="text-sm text-memora-text-muted line-clamp-2 mb-3 leading-relaxed">
            {reminder.description}
          </p>
        )}

        {/* Recurrence & Status Badges */}
        <div className="flex flex-wrap gap-2 text-xs text-memora-text-muted mb-4">
          {reminder.recurrence ? (
            <div className="flex items-center space-x-1 bg-memora-surface-secondary px-2.5 py-1 rounded-lg border border-memora-border font-bold text-memora-text">
              <Repeat className="w-3 h-3 text-memora-accent" />
              <span>
                {reminder.recurrence.frequency}
                {reminder.recurrence.frequency === 'WEEKLY' && reminder.recurrence.weekdays?.length > 0 && (
                  ` (${reminder.recurrence.weekdays.length} days)`
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 bg-memora-surface-secondary px-2.5 py-1 rounded-lg border border-memora-border text-memora-text-muted font-medium">
              <span>One-Time</span>
            </div>
          )}

          {isCompleted && (
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>COMPLETED</span>
            </span>
          )}

          {isSkipped && (
            <span className="px-2.5 py-1 bg-memora-surface-secondary text-memora-text-muted text-xs font-bold rounded-lg border border-memora-border flex items-center space-x-1">
              <XCircle className="w-3 h-3" />
              <span>SKIPPED</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      {!isCompleted && !isSkipped && (onComplete || onSkip) && (
        <div className="pt-3 border-t border-memora-border flex items-center justify-between gap-2">
          {onComplete && (
            <button
              onClick={handleCompleteClick}
              disabled={acting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all touch-target-xl"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete</span>
            </button>
          )}

          {onSkip && (
            <button
              onClick={handleSkipClick}
              disabled={acting}
              className="py-2.5 px-4 bg-memora-surface-secondary hover:bg-memora-surface-hover disabled:opacity-50 text-memora-text-muted hover:text-memora-text font-bold text-sm rounded-xl border border-memora-border transition-colors"
            >
              <span>Skip</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
