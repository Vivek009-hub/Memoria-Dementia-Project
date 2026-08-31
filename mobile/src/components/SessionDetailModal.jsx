/**
 * SessionDetailModal.jsx — Detailed View Modal for a Scheduled Session
 */

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, User, Video, CheckCircle2, ShieldCheck } from 'lucide-react';

export function SessionDetailModal({ session, onClose, onRegister, onCancelRegister, onOpenMeeting }) {
  const [actionLoading, setActionLoading] = useState(false);

  if (!session) return null;

  const isRegistered = Boolean(session.isRegistered);
  const isFull = session.capacity && session.registeredCount >= session.capacity;
  const isCancelled = session.status === 'CANCELLED';

  let formattedDate = 'Upcoming Date';
  if (session.scheduledAt || session.date) {
    try {
      const d = new Date(session.scheduledAt || session.date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString(undefined, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    } catch {
      formattedDate = 'Upcoming Date';
    }
  }

  const handleRegisterClick = async () => {
    if (actionLoading || isCancelled) return;
    setActionLoading(true);
    try {
      if (isRegistered) {
        await onCancelRegister(session._id);
      } else {
        await onRegister(session._id);
      }
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-detail-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-extrabold rounded-full border border-indigo-500/30 uppercase">
            {session.meetingType || 'COMMUNITY SESSION'}
          </span>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
            aria-label="Close session details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Title & Host Profile Banner */}
          <div className="space-y-3">
            <h2 id="session-detail-title" className="text-2xl font-black text-white leading-tight">
              {session.title}
            </h2>

            {(session.speakerName || session.hostName || session.host) && (
              <div className="flex items-center space-x-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {session.speakerImage || session.hostPhoto ? (
                    <img
                      src={session.speakerImage || session.hostPhoto}
                      alt={session.speakerName || session.hostName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-indigo-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-wider">
                    Featured Host / Guest
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {session.speakerName || session.hostName || (typeof session.host === 'object' ? session.host.name : 'Guest Host')}
                  </h4>
                  {(session.speakerTitle || session.hostTitle) && (
                    <span className="text-xs text-slate-400 block">{session.speakerTitle || session.hostTitle}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {session.description ? (
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-200 text-base leading-relaxed">
              {session.description}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No detailed description available.</p>
          )}

          {/* Schedule Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Date</span>
                <span className="text-slate-200 font-medium">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <Users className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">Registration</span>
                <span className="text-slate-200 font-medium">
                  {session.capacity ? `${session.registeredCount || 0} / ${session.capacity} Registered` : 'Open'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={handleRegisterClick}
            disabled={actionLoading || (isFull && !isRegistered) || isCancelled}
            className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
              isRegistered
                ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30'
                : isFull
                ? 'bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
            }`}
          >
            {isRegistered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Registered (Tap to Cancel)</span>
              </>
            ) : isFull ? (
              <span>Session Full</span>
            ) : (
              <span>{actionLoading ? 'Saving...' : 'Pre-Register Now'}</span>
            )}
          </button>

          {isRegistered && onOpenMeeting && (
            <button
              onClick={() => {
                onClose();
                onOpenMeeting(session);
              }}
              className="py-3 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center space-x-2"
            >
              <Video className="w-4 h-4" />
              <span>Join Meeting Circle</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
