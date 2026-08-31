/**
 * ReminderDetailModal.jsx — Full Details View Modal for a Reminder
 */

import React, { useState } from 'react';
import { X, Clock, Calendar, Globe, Repeat, Volume2, CheckCircle2, Edit3, Trash2, AlertCircle } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ReminderDetailModal({ reminder, onClose, onComplete, onSkip, onEdit, onDelete }) {
  const [actionLoading, setActionLoading] = useState(false);

  if (!reminder) return null;

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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-detail-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-extrabold rounded-full border border-indigo-500/30 uppercase">
            {reminder.type?.replace('_', ' ')}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
            aria-label="Close reminder details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Time & Title Banner */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Clock className="w-6 h-6" />
              <span className="text-2xl font-black text-white">{formatTime(reminder.schedule?.time)}</span>
            </div>
            <h2 id="reminder-detail-title" className="text-xl font-bold text-white leading-snug">
              {reminder.title}
            </h2>
          </div>

          {/* Description */}
          {reminder.description ? (
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-200 text-base leading-relaxed">
              {reminder.description}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No description added.</p>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Timezone</span>
                <span className="text-slate-200 font-medium">{reminder.timezone}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <Repeat className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Recurrence</span>
                <span className="text-slate-200 font-medium">
                  {reminder.recurrence ? reminder.recurrence.frequency : 'One-Time'}
                </span>
              </div>
            </div>
          </div>

          {/* Weekday details for WEEKLY recurrence */}
          {reminder.recurrence?.frequency === 'WEEKLY' && reminder.recurrence.weekdays?.length > 0 && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Repeats On</span>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((dayName, idx) => {
                  const isSelected = reminder.recurrence.weekdays.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {dayName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Voice Prompt Status */}
          {reminder.voiceEnabled && (
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span>Voice prompt enabled for this reminder</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(reminder);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700 flex items-center space-x-2 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(reminder);
                }}
                className="px-4 py-2.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white text-sm font-bold rounded-xl border border-red-800/50 flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {onComplete && (
            <button
              onClick={async () => {
                setActionLoading(true);
                try {
                  await onComplete(reminder);
                  onClose();
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center space-x-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Complete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
