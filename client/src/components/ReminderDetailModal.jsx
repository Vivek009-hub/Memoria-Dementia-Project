/**
 * ReminderDetailModal.jsx — Memora Full Details View Modal for a Reminder
 */

import React, { useState } from 'react';
import { X, Clock, Globe, Repeat, Volume2, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ReminderDetailModal({ reminder, onClose, onComplete, onSkip, onEdit, onDelete }) {
  const [actionLoading, setActionLoading] = useState(false);

  if (!reminder) return null;

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
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-detail-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#343434] bg-[#1B1B1B]">
          <span className="px-2.5 py-0.5 bg-[#D8B24C]/10 text-[#D8B24C] text-xs font-semibold rounded-md border border-[#D8B24C]/30 uppercase">
            {reminder.type?.replace('_', ' ')}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
            aria-label="Close reminder details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="bg-[#151515] p-5 rounded-lg border border-[#343434] space-y-2">
            <div className="flex items-center space-x-2 text-[#D8B24C]">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-semibold text-[#F5F5F0]">{formatTime(reminder.schedule?.time)}</span>
            </div>
            <h2 id="reminder-detail-title" className="text-xl font-semibold text-[#F5F5F0] leading-snug">
              {reminder.title}
            </h2>
          </div>

          {reminder.description ? (
            <div className="p-4 bg-[#151515] rounded-lg border border-[#343434] text-[#F5F5F0] text-sm leading-relaxed">
              {reminder.description}
            </div>
          ) : (
            <p className="text-xs text-[#74746F] italic">No description added.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-3 p-3 bg-[#151515] rounded-lg border border-[#343434]">
              <Globe className="w-4 h-4 text-[#D8B24C] shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-[#74746F] uppercase block">Timezone</span>
                <span className="text-[#F5F5F0] font-medium">{reminder.timezone}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-[#151515] rounded-lg border border-[#343434]">
              <Repeat className="w-4 h-4 text-[#D8B24C] shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-[#74746F] uppercase block">Recurrence</span>
                <span className="text-[#F5F5F0] font-medium">
                  {reminder.recurrence ? reminder.recurrence.frequency : 'One-Time'}
                </span>
              </div>
            </div>
          </div>

          {reminder.recurrence?.frequency === 'WEEKLY' && reminder.recurrence.weekdays?.length > 0 && (
            <div className="p-3 bg-[#151515] rounded-lg border border-[#343434]">
              <span className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider block mb-2">Repeats On</span>
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((dayName, idx) => {
                  const isSelected = reminder.recurrence.weekdays.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        isSelected
                          ? 'bg-[#D8B24C] text-[#151515]'
                          : 'bg-[#202020] text-[#74746F] border border-[#343434]'
                      }`}
                    >
                      {dayName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {reminder.voiceEnabled && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#D8B24C] p-3 bg-[#D8B24C]/10 rounded-lg border border-[#D8B24C]/30">
              <Volume2 className="w-4 h-4 text-[#D8B24C]" />
              <span>Voice prompt announcement enabled</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#343434] bg-[#1B1B1B] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(reminder);
                }}
                className="px-4 py-2 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] text-xs font-medium rounded-lg border border-[#343434] flex items-center space-x-2 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(reminder);
                }}
                className="px-4 py-2 bg-[#D95C5C]/10 hover:bg-[#D95C5C]/20 text-[#D95C5C] text-xs font-semibold rounded-lg border border-[#D95C5C]/30 flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
              className="px-4 py-2 bg-[#45B982] hover:bg-[#45B982]/90 text-[#151515] font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
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
