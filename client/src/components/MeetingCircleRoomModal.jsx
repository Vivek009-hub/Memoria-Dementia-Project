/**
 * MeetingCircleRoomModal.jsx — Active Meeting Circle Room Modal Component (Phase F7 / B8)
 *
 * Receives room tokens and credentials from B8 backend meeting service.
 */

import React, { useState, useEffect } from 'react';
import { X, Video, Mic, PhoneOff, ShieldCheck, Users, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import * as meetingsApi from '../api/meetings.api.js';

export function MeetingCircleRoomModal({ session, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [meetingData, setMeetingData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (isOpen && session?._id) {
      joinRoom();
    } else {
      setMeetingData(null);
      setJoined(false);
    }
  }, [isOpen, session]);

  const joinRoom = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await meetingsApi.joinMeetingRoom(session._id);
      if (res.data) {
        setMeetingData(res.data);
        setJoined(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to join meeting circle right now. The meeting may not have started yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      if (session?._id) {
        await meetingsApi.leaveMeetingRoom(session._id);
      }
    } catch {
      // Ignore leave error
    } finally {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-room-title"
    >
      <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Video className="w-6 h-6" />
            <h2 id="meeting-room-title" className="text-xl font-black text-white truncate">
              {session?.title || 'Meeting Circle Room'}
            </h2>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="py-12 space-y-3">
              <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
              <p className="text-white font-bold text-lg">Connecting to Meeting Circle...</p>
              <p className="text-xs text-slate-400">Verifying security token and participant authorization</p>
            </div>
          ) : errorMsg ? (
            <div className="py-8 space-y-4 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Meeting Circle Notice</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={joinRoom}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 inline-flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Joining</span>
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="w-full h-64 bg-slate-900 rounded-3xl border border-slate-800 relative flex flex-col items-center justify-center p-6 shadow-inner">
                <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
                  <Video className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-white">Meeting Circle Active</h3>
                <p className="text-xs text-emerald-300 font-bold mt-1 flex items-center justify-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Patient Token Connected</span>
                </p>

                {meetingData?.participantCount !== undefined && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-bold rounded-full flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{meetingData.participantCount} Connected</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-300">Room Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-300">Role Token:</span>
                  <span className="text-slate-300 font-mono">PATIENT_TOKEN_VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-center">
          <button
            onClick={handleLeaveRoom}
            className="px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-base rounded-2xl shadow-lg flex items-center space-x-2 touch-target-xl transition-all"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Leave Meeting Circle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
