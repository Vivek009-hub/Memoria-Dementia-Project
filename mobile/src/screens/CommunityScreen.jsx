/**
 * CommunityScreen.jsx — Community Workshops & Meeting Circles Screen (Phase F13 / B13)
 *
 * Integrates Community Voting for session proposals, Scheduled Workshop pre-registration,
 * and Memora Meeting Circles.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, ThumbsUp, Calendar, Video, RefreshCw, AlertTriangle, Check, Plus, Clock
} from 'lucide-react';
import { VotingCard } from '../components/VotingCard.jsx';
import { ScheduledSessionCard } from '../components/ScheduledSessionCard.jsx';
import { MeetingCircleRoomModal } from '../components/MeetingCircleRoomModal.jsx';
import * as communityApi from '../api/community.api.js';

export function CommunityScreen({ patientId }) {
  const [proposals, setProposals] = useState([]);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Active sub-tab ('vote' | 'schedule' | 'meetingCircle')
  const [activeTab, setActiveTab] = useState('vote');

  // Modal states
  const [selectedSession, setSelectedSession] = useState(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [activeMeetingSession, setActiveMeetingSession] = useState(null);

  // Fetch proposals data
  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await communityApi.listProposals();
      if (res.data) {
        setProposals(res.data);
      } else {
        setProposals([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load session proposals right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch scheduled sessions data
  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await communityApi.listScheduledSessions();
      if (res.data) {
        setScheduledSessions(res.data);
      } else {
        setScheduledSessions([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load scheduled sessions right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
    fetchSchedule();
  }, [fetchProposals, fetchSchedule]);

  // Vote Actions
  const handleVote = async (ideaId) => {
    await communityApi.voteForProposal(ideaId);
    fetchProposals();
  };

  const handleRemoveVote = async (ideaId) => {
    await communityApi.removeVote(ideaId);
    fetchProposals();
  };

  // Registration Actions
  const handleRegister = async (sessionId) => {
    await communityApi.registerForSession(sessionId);
    fetchSchedule();
  };

  const handleCancelRegister = async (sessionId) => {
    await communityApi.cancelRegistration(sessionId);
    fetchSchedule();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-memora-accent mb-1">
            <Users className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Memora Community</span>
          </div>
          <h1 className="text-3xl font-black text-memora-text tracking-tight">Community & Meeting Circle</h1>
          <p className="text-sm text-memora-text-muted mt-1">
            Vote on upcoming session ideas, pre-register for events, and join Meeting Circles.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'vote') fetchProposals();
            else fetchSchedule();
          }}
          className="p-3 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text-secondary hover:text-memora-text transition-colors self-start md:self-auto"
          title="Refresh community data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation View Tabs */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-3 shadow-lg flex items-center space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('vote')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'vote'
              ? 'bg-memora-accent text-memora-bg font-black shadow-lg'
              : 'bg-memora-surface-secondary text-memora-text-muted hover:text-memora-text border border-memora-border'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>🗳️ Vote for Sessions ({proposals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-memora-accent text-memora-bg font-black shadow-lg'
              : 'bg-memora-surface-secondary text-memora-text-muted hover:text-memora-text border border-memora-border'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>📅 Schedule ({scheduledSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('meetingCircle')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center space-x-2 transition-all whitespace-nowrap ${
            activeTab === 'meetingCircle'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-memora-surface-secondary text-memora-text-muted hover:text-memora-text border border-memora-border'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>🤝 Meeting Circle</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-memora-accent animate-spin mx-auto mb-3" />
          <p className="text-memora-text font-bold text-lg">Loading community sessions...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-memora-surface border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-memora-text mb-1">We Couldn't Load Community Sessions</h3>
            <p className="text-sm text-memora-text-muted">{errorMsg}</p>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'vote') fetchProposals();
              else fetchSchedule();
            }}
            className="px-6 py-3 bg-memora-surface-secondary hover:bg-memora-surface-hover text-memora-text font-bold text-sm rounded-2xl border border-memora-border transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : activeTab === 'vote' ? (
        /* Voting Proposals Grid */
        proposals.length === 0 ? (
          <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg space-y-3">
            <ThumbsUp className="w-12 h-12 text-memora-accent mx-auto opacity-75" />
            <h3 className="text-2xl font-black text-memora-text">No Active Voting Proposals</h3>
            <p className="text-sm text-memora-text-muted max-w-md mx-auto leading-relaxed">
              There are no session proposals open for voting right now. Check back soon for new community topic proposals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.map((prop) => (
              <VotingCard
                key={prop._id}
                proposal={prop}
                onVote={handleVote}
                onRemoveVote={handleRemoveVote}
              />
            ))}
          </div>
        )
      ) : activeTab === 'schedule' ? (
        /* Scheduled Sessions Grid */
        scheduledSessions.length === 0 ? (
          <div className="bg-memora-surface border border-memora-border rounded-3xl p-12 text-center shadow-lg space-y-3">
            <Calendar className="w-12 h-12 text-memora-accent mx-auto opacity-75" />
            <h3 className="text-2xl font-black text-memora-text">No Scheduled Sessions</h3>
            <p className="text-sm text-memora-text-muted max-w-md mx-auto leading-relaxed">
              No community sessions are currently scheduled. Check the Vote tab to vote for upcoming session proposals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledSessions.map((sess) => (
              <ScheduledSessionCard
                key={sess._id}
                session={sess}
                onRegister={handleRegister}
                onCancelRegister={handleCancelRegister}
                onOpenMeeting={(s) => {
                  setActiveMeetingSession(s);
                  setMeetingModalOpen(true);
                }}
                onSelect={(s) => setSelectedSession(s)}
              />
            ))}
          </div>
        )
      ) : (
        /* Meeting Circle Tab */
        <div className="space-y-6">
          <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-memora-text flex items-center space-x-2">
              <Video className="w-5 h-5 text-emerald-400" />
              <span>Available Meeting Circles</span>
            </h2>

            {scheduledSessions.filter((s) => s.isRegistered).length === 0 ? (
              <div className="text-center py-8 text-memora-text-muted space-y-2">
                <Video className="w-12 h-12 mx-auto opacity-40 text-memora-accent" />
                <p className="text-sm">You have not registered for any upcoming sessions yet.</p>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="px-4 py-2 bg-memora-accent hover:bg-memora-accent-bright text-memora-bg font-black text-xs rounded-xl"
                >
                  Browse Schedule & Pre-Register
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledSessions
                  .filter((s) => s.isRegistered)
                  .map((sess) => (
                    <div
                      key={sess._id}
                      className="p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-base font-bold text-memora-text">{sess.title}</h4>
                        <span className="text-xs text-memora-text-muted">
                          {sess.scheduledAt ? new Date(sess.scheduledAt).toLocaleString() : 'Scheduled Event'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveMeetingSession(sess);
                          setMeetingModalOpen(true);
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Room</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Meeting Circle Room Modal */}
      <MeetingCircleRoomModal
        session={activeMeetingSession}
        isOpen={meetingModalOpen}
        onClose={() => {
          setMeetingModalOpen(false);
          setActiveMeetingSession(null);
        }}
      />
    </div>
  );
}
