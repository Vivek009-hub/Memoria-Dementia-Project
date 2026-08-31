/**
 * MeetingsPage.jsx — Meeting Circle & Live Room Page (Phase F7 / B8)
 */

import React, { useState, useEffect } from 'react';
import { Video, Calendar, Users, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ScheduledSessionCard } from '../components/ScheduledSessionCard.jsx';
import { MeetingCircleRoomModal } from '../components/MeetingCircleRoomModal.jsx';
import * as communityApi from '../api/community.api.js';

export function MeetingsPage({ patientId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await communityApi.getScheduledSessions();
      if (res.data) {
        setSessions(res.data);
      } else {
        setSessions([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load meeting rooms right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRegister = async (sessionId) => {
    await communityApi.registerForSession(sessionId);
    fetchSessions();
  };

  const handleOpenMeeting = (session) => {
    setActiveSession(session);
    setModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Video className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Live Video & Audio</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Meeting Circle</h1>
          <p className="text-sm text-slate-400 mt-1">
            Join live virtual gatherings with specialized hosts, music therapists, and peers.
          </p>
        </div>

        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-2 text-emerald-300 text-xs font-bold self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Patient Token Authorization</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading active meeting rooms...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Could Not Load Meetings</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={fetchSessions}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
          <Video className="w-12 h-12 text-emerald-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white">No Meeting Circle Rooms Currently Open</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Check the Community tab schedule to pre-register for upcoming sessions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((sess) => (
            <ScheduledSessionCard
              key={sess._id}
              session={sess}
              onRegister={handleRegister}
              onCancelRegister={handleRegister}
              onOpenMeeting={handleOpenMeeting}
            />
          ))}
        </div>
      )}

      {activeSession && (
        <MeetingCircleRoomModal
          session={activeSession}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setActiveSession(null);
          }}
        />
      )}
    </div>
  );
}
