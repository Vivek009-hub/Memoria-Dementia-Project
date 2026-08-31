/**
 * ScheduledSessionCard.jsx — Scheduled Community Event Card Component
 */

import React, { useState } from 'react';
import {
  Calendar, Clock, Users, User, Video, Mic, MapPin, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';

export function ScheduledSessionCard({ session, onRegister, onCancelRegister, onOpenMeeting, onSelect }) {
  const [actionLoading, setActionLoading] = useState(false);

  const isRegistered = Boolean(session.isRegistered);
  const isFull = session.capacity && session.registeredCount >= session.capacity;
  const isCancelled = session.status === 'CANCELLED';

  // Format date & time
  let formattedDate = 'Upcoming Date';
  if (session.scheduledAt || session.date) {
    try {
      const d = new Date(session.scheduledAt || session.date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = 'Upcoming Date';
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
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

  const timeDisplay = session.startTime
    ? `${formatTime(session.startTime)}${session.endTime ? ` - ${formatTime(session.endTime)}` : ''}`
    : session.time || 'TBA';

  const handleRegisterClick = async (e) => {
    e.stopPropagation();
    if (actionLoading || isCancelled) return;
    setActionLoading(true);
    try {
      if (isRegistered) {
        await onCancelRegister(session._id);
      } else {
        await onRegister(session._id);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(session)}
      className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4"
      role="button"
      tabIndex={0}
      aria-label={`Open session: ${session.title}`}
    >
      <div>
        {/* Top Header: Meeting Type Badge + Capacity Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-extrabold rounded-full border border-indigo-500/30 uppercase flex items-center space-x-1">
            {session.meetingType === 'VIDEO' ? (
              <Video className="w-3.5 h-3.5" />
            ) : session.meetingType === 'AUDIO' ? (
              <Mic className="w-3.5 h-3.5" />
            ) : (
              <MapPin className="w-3.5 h-3.5" />
            )}
            <span>{session.meetingType || 'COMMUNITY SESSION'}</span>
          </span>

          {session.capacity && (
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {session.registeredCount || 0} / {session.capacity} Registered
              </span>
            </div>
          )}
        </div>

        {/* Featured Speaker Avatar / Host Profile */}
        {(session.hostName || session.speakerName || session.host) && (
          <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 overflow-hidden">
              {session.speakerImage || session.hostPhoto ? (
                <img
                  src={session.speakerImage || session.hostPhoto}
                  alt={session.speakerName || session.hostName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider">
                Featured Host / Speaker
              </span>
              <h4 className="text-sm font-bold text-white truncate">
                {session.speakerName || session.hostName || (typeof session.host === 'object' ? session.host.name : 'Guest Host')}
              </h4>
              {(session.speakerTitle || session.hostTitle) && (
                <span className="text-xs text-slate-400 truncate block">
                  {session.speakerTitle || session.hostTitle}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {session.title}
        </h3>

        {/* Date & Time Pills */}
        <div className="flex flex-wrap gap-2 text-xs text-slate-300 mb-2">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-bold">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formattedDate}</span>
          </div>

          {timeDisplay && (
            <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeDisplay}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {isCancelled ? (
          <span className="w-full py-2.5 bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl text-center">
            Session Cancelled
          </span>
        ) : (
          <>
            <button
              onClick={handleRegisterClick}
              disabled={actionLoading || (isFull && !isRegistered)}
              className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-1.5 transition-all touch-target-xl ${
                isRegistered
                  ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30'
                  : isFull
                  ? 'bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              {isRegistered ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Registered (Cancel)</span>
                </>
              ) : isFull ? (
                <span>Session Full</span>
              ) : (
                <span>{actionLoading ? 'Saving...' : 'Pre-Register'}</span>
              )}
            </button>

            {isRegistered && onOpenMeeting && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMeeting(session);
                }}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center space-x-1"
              >
                <Video className="w-4 h-4" />
                <span>Join Meeting</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
