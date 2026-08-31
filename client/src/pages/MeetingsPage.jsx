/**
 * MeetingsPage.jsx — Memora Meeting Circle Real Video Calling Page (Phase F7 / B8)
 *
 * Implements real patient-created, discoverable 6-person video circles with Daily.co infrastructure.
 */

import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Users,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Lock,
  Trash2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { CreateMeetingCircleModal } from '../components/CreateMeetingCircleModal.jsx';
import { MeetingCircleVideoCallModal } from '../components/MeetingCircleVideoCallModal.jsx';
import * as circleApi from '../api/meetingCircle.api.js';

export function MeetingsPage({ patientId }) {
  const [discoverCircles, setDiscoverCircles] = useState([]);
  const [myCircles, setMyCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Active call state
  const [activeCircle, setActiveCircle] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState(null);

  const fetchCircles = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [discRes, myRes] = await Promise.all([
        circleApi.getDiscoverableCircles(),
        circleApi.getMyCircles(),
      ]);

      if (discRes.data) setDiscoverCircles(discRes.data);
      if (myRes.data) setMyCircles(myRes.data);
    } catch (err) {
      setErrorMsg(err.message || 'Could not load meeting circles right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, []);

  const handleCreateCircle = async (circleData) => {
    const res = await circleApi.createCircle(circleData);
    if (res.data) {
      const { circle, roomUrl, token } = res.data;
      setActiveCircle(circle);
      setRoomData({ url: roomUrl, token });
      setCallModalOpen(true);
      fetchCircles();
    }
  };

  const handleJoinCircle = async (circle) => {
    if (circle.activeParticipantCount >= 6) {
      alert('This meeting circle is full. Maximum 6 participants allowed.');
      return;
    }

    setJoiningId(circle.id);
    setErrorMsg('');

    try {
      const res = await circleApi.joinCircle(circle.id);
      if (res.data) {
        const { circle: joinedCircle, roomUrl, token } = res.data;
        setActiveCircle(joinedCircle);
        setRoomData({ url: roomUrl, token });
        setCallModalOpen(true);
        fetchCircles();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to join meeting circle.');
    } finally {
      setJoiningId(null);
    }
  };

  const handleDeleteCircle = async (circleId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to close and delete this meeting circle?')) {
      return;
    }

    try {
      await circleApi.deleteCircle(circleId);
      fetchCircles();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete meeting circle.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Video className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">
              Live Small-Group Video Circles
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Meeting Circle
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Connect with peers and specialized hosts through live, 6-participant virtual video gatherings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 touch-target-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Create Meeting Circle</span>
          </button>

          <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center space-x-2 text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Token Authorization</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-950/80 border border-red-500/40 rounded-3xl p-4 sm:p-6 text-red-200 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchCircles}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center shadow-xl space-y-3">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
          <p className="text-slate-300 font-bold text-lg">Loading Meeting Circles...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* ── SECTION 1: MY CIRCLES ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-extrabold text-white tracking-wide">
                  MY CIRCLES
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                {myCircles.length} {myCircles.length === 1 ? 'circle' : 'circles'}
              </span>
            </div>

            {myCircles.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center space-y-2">
                <Video className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">No Circles Created Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "+ Create Meeting Circle" to start your own 6-person video room!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myCircles.map((circle) => (
                  <CircleCard
                    key={circle.id}
                    circle={circle}
                    isOwner={true}
                    onJoin={handleJoinCircle}
                    onDelete={handleDeleteCircle}
                    joining={joiningId === circle.id}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── SECTION 2: DISCOVER CIRCLES ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-extrabold text-white tracking-wide">
                  DISCOVER CIRCLES
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                {discoverCircles.length} available
              </span>
            </div>

            {discoverCircles.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 text-center space-y-2">
                <Globe className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-300">No Discoverable Circles Open</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first to start a discoverable meeting circle for your peers!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {discoverCircles.map((circle) => (
                  <CircleCard
                    key={circle.id}
                    circle={circle}
                    isOwner={false}
                    onJoin={handleJoinCircle}
                    joining={joiningId === circle.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Create Circle Modal */}
      <CreateMeetingCircleModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateSuccess={handleCreateCircle}
      />

      {/* Real Video Call Modal */}
      {callModalOpen && (
        <MeetingCircleVideoCallModal
          circle={activeCircle}
          roomData={roomData}
          isOpen={callModalOpen}
          onClose={() => {
            setCallModalOpen(false);
            setActiveCircle(null);
            setRoomData(null);
            fetchCircles();
          }}
        />
      )}
    </div>
  );
}

/**
 * Circle Card Component for My Circles & Discover Circles
 */
function CircleCard({ circle, isOwner, onJoin, onDelete, joining }) {
  const isFull = circle.activeParticipantCount >= circle.maxParticipants;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 group transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold">
            {circle.visibility === 'INVITE_ONLY' ? (
              <span className="px-2.5 py-1 bg-indigo-950 border border-indigo-500/30 text-indigo-300 rounded-xl flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Invite Only</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Discoverable</span>
              </span>
            )}
          </div>

          {isOwner && onDelete && (
            <button
              onClick={(e) => onDelete(circle.id, e)}
              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-950 transition-colors"
              title="Delete circle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {circle.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[2rem]">
            {circle.description || 'Small group video gathering.'}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-300">
          <Users className="w-4 h-4 text-amber-400" />
          <span>
            {circle.activeParticipantCount} / {circle.maxParticipants || 6}
          </span>
          {isFull ? (
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wide">
              Full
            </span>
          ) : (
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">
              Open
            </span>
          )}
        </div>

        <button
          onClick={() => onJoin(circle)}
          disabled={joining || isFull}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center space-x-2 touch-target-xl ${
            isFull
              ? 'bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
          }`}
        >
          {joining ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isFull ? 'Full (6/6)' : 'Join Circle'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
