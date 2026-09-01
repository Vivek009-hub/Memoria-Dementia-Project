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
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Banner Header */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-[#D8B24C]">
            <Video className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Live Small-Group Video Circles
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">
            Meeting Circle
          </h1>
          <p className="text-sm text-[#A7A7A2] max-w-xl leading-relaxed">
            Connect with peers and specialized hosts through live, 6-participant virtual video gatherings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2 touch-target"
          >
            <Plus className="w-4 h-4" />
            <span>Create Meeting Circle</span>
          </button>

          <div className="px-3.5 py-2 bg-[#45B982]/10 border border-[#45B982]/30 rounded-lg flex items-center justify-center space-x-2 text-[#45B982] text-xs font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Encrypted Authorization</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-xl p-4 text-[#D95C5C] text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#D95C5C] shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={fetchCircles}
            className="px-3 py-1.5 bg-[#151515] border border-[#343434] hover:bg-[#242424] text-[#F5F5F0] rounded-lg font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto" />
          <p className="text-[#A7A7A2] text-sm">Loading Meeting Circles...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── SECTION 1: MY CIRCLES ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#343434] pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#45B982]" />
                <h2 className="text-lg font-semibold text-[#F5F5F0] tracking-wide uppercase">
                  My Circles
                </h2>
              </div>
              <span className="text-xs text-[#A7A7A2] font-medium">
                {myCircles.length} {myCircles.length === 1 ? 'circle' : 'circles'}
              </span>
            </div>

            {myCircles.length === 0 ? (
              <div className="bg-[#202020] border border-[#343434] rounded-xl p-8 text-center space-y-2">
                <Video className="w-8 h-8 text-[#74746F] mx-auto" />
                <h3 className="text-sm font-semibold text-[#F5F5F0]">No Circles Created Yet</h3>
                <p className="text-xs text-[#A7A7A2] max-w-sm mx-auto">
                  Click "+ Create Meeting Circle" to start your own 6-person video room!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="flex items-center justify-between border-b border-[#343434] pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#D8B24C]" />
                <h2 className="text-lg font-semibold text-[#F5F5F0] tracking-wide uppercase">
                  Discover Circles
                </h2>
              </div>
              <span className="text-xs text-[#A7A7A2] font-medium">
                {discoverCircles.length} available
              </span>
            </div>

            {discoverCircles.length === 0 ? (
              <div className="bg-[#202020] border border-[#343434] rounded-xl p-8 text-center space-y-2">
                <Globe className="w-8 h-8 text-[#74746F] mx-auto" />
                <h3 className="text-sm font-semibold text-[#F5F5F0]">No Discoverable Circles Open</h3>
                <p className="text-xs text-[#A7A7A2] max-w-sm mx-auto">
                  Be the first to start a discoverable meeting circle for your peers!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 group transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            {circle.visibility === 'INVITE_ONLY' ? (
              <span className="px-2.5 py-1 bg-[#151515] border border-[#343434] text-[#A7A7A2] rounded-md flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Invite Only</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-[#45B982]/10 border border-[#45B982]/30 text-[#45B982] rounded-md flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Discoverable</span>
              </span>
            )}
          </div>

          {isOwner && onDelete && (
            <button
              onClick={(e) => onDelete(circle.id, e)}
              className="p-1.5 text-[#74746F] hover:text-[#D95C5C] rounded-lg hover:bg-[#151515] transition-colors"
              title="Delete circle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors line-clamp-1">
            {circle.name}
          </h3>
          <p className="text-xs text-[#A7A7A2] mt-1 line-clamp-2 min-h-[2rem]">
            {circle.description || 'Small group video gathering.'}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-[#343434] flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-medium text-[#A7A7A2]">
          <Users className="w-4 h-4 text-[#D8B24C]" />
          <span>
            {circle.activeParticipantCount} / {circle.maxParticipants || 6}
          </span>
          {isFull ? (
            <span className="text-[10px] text-[#D95C5C] font-semibold uppercase tracking-wide">
              Full
            </span>
          ) : (
            <span className="text-[10px] text-[#45B982] font-semibold uppercase tracking-wide">
              Open
            </span>
          )}
        </div>

        <button
          onClick={() => onJoin(circle)}
          disabled={joining || isFull}
          className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center space-x-2 touch-target ${
            isFull
              ? 'bg-[#151515] border border-[#343434] text-[#74746F] cursor-not-allowed'
              : 'bg-[#45B982] hover:bg-[#45B982]/90 text-[#151515] shadow-xs'
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
