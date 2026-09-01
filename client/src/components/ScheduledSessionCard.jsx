/**
 * ScheduledSessionCard.jsx — Scheduled Community Event Card Component
 */

import React, { useState } from 'react';
import {
  Calendar, Clock, Users, User, Video, Mic, MapPin, CheckCircle2
} from 'lucide-react';

export function ScheduledSessionCard({ session, onRegister, onCancelRegister, onOpenMeeting, onSelect }) {
  const [actionLoading, setActionLoading] = useState(false);

  const isRegistered = Boolean(session.isRegistered);
  const isFull = session.capacity && session.registeredCount >= session.capacity;
  const isCancelled = session.status === 'CANCELLED';

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
      className="group bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-5 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
      role="button"
      tabIndex={0}
      aria-label={`Open session: ${session.title}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 bg-[#D8B24C]/10 text-[#D8B24C] text-xs font-semibold rounded-md border border-[#D8B24C]/30 uppercase flex items-center space-x-1">
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
            <div className="flex items-center space-x-1 text-xs font-medium text-[#A7A7A2] bg-[#151515] px-2.5 py-1 rounded-md border border-[#343434]">
              <Users className="w-3.5 h-3.5 text-[#D8B24C]" />
              <span>
                {session.registeredCount || 0} / {session.capacity}
              </span>
            </div>
          )}
        </div>

        {(session.hostName || session.speakerName || session.host) && (
          <div className="flex items-center space-x-3 bg-[#151515] p-3 rounded-lg border border-[#343434] mb-3">
            <div className="w-9 h-9 rounded-lg bg-[#202020] border border-[#343434] flex items-center justify-center shrink-0 overflow-hidden">
              {session.speakerImage || session.hostPhoto ? (
                <img
                  src={session.speakerImage || session.hostPhoto}
                  alt={session.speakerName || session.hostName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-[#D8B24C]" />
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase text-[#D8B24C] block tracking-wider">
                Featured Host
              </span>
              <h4 className="text-xs font-semibold text-[#F5F5F0] truncate">
                {session.speakerName || session.hostName || (typeof session.host === 'object' ? session.host.name : 'Guest Host')}
              </h4>
            </div>
          </div>
        )}

        <h3 className="text-base font-semibold text-[#F5F5F0] mb-2 line-clamp-1 group-hover:text-[#D8B24C] transition-colors">
          {session.title}
        </h3>

        <div className="flex flex-wrap gap-2 text-xs text-[#A7A7A2] mb-2">
          <div className="flex items-center space-x-1.5 bg-[#151515] px-2.5 py-1 rounded-md border border-[#343434]">
            <Calendar className="w-3.5 h-3.5 text-[#D8B24C]" />
            <span>{formattedDate}</span>
          </div>

          {timeDisplay && (
            <div className="flex items-center space-x-1.5 bg-[#151515] px-2.5 py-1 rounded-md border border-[#343434]">
              <Clock className="w-3.5 h-3.5 text-[#D8B24C]" />
              <span>{timeDisplay}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-[#343434] flex items-center justify-between gap-2">
        {isCancelled ? (
          <span className="w-full py-2 bg-[#D95C5C]/10 border border-[#D95C5C]/30 text-[#D95C5C] text-xs font-medium rounded-lg text-center">
            Session Cancelled
          </span>
        ) : (
          <>
            <button
              onClick={handleRegisterClick}
              disabled={actionLoading || (isFull && !isRegistered)}
              className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all touch-target ${
                isRegistered
                  ? 'bg-[#45B982]/15 border border-[#45B982]/40 text-[#45B982] hover:bg-[#45B982]/25'
                  : isFull
                  ? 'bg-[#151515] border border-[#343434] text-[#74746F] cursor-not-allowed'
                  : 'bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] shadow-xs'
              }`}
            >
              {isRegistered ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#45B982]" />
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
                className="py-2 px-3 bg-[#45B982] hover:bg-[#45B982]/90 text-[#151515] font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-1 touch-target"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
