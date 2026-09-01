/**
 * MeetingCircleRoomModal.jsx — Memora Active Meeting Circle Room Modal Component
 */

import React, { useState, useEffect } from 'react';
import { X, Video, PhoneOff, ShieldCheck, Users, RefreshCw, AlertCircle } from 'lucide-react';
import * as meetingsApi from '../api/meetings.api.js';

export function MeetingCircleRoomModal({ session, isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [meetingData, setMeetingData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && session?._id) {
      joinRoom();
    } else {
      setMeetingData(null);
    }
  }, [isOpen, session]);

  const joinRoom = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await meetingsApi.joinMeetingRoom(session._id);
      if (res.data) {
        setMeetingData(res.data);
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
      className="fixed inset-0 z-50 bg-[#151515]/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meeting-room-title"
    >
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#343434] bg-[#1B1B1B]">
          <div className="flex items-center space-x-2 text-[#D8B24C]">
            <Video className="w-5 h-5" />
            <h2 id="meeting-room-title" className="text-xl font-semibold text-[#F5F5F0] truncate">
              {session?.title || 'Meeting Circle Room'}
            </h2>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
          {loading ? (
            <div className="py-12 space-y-3">
              <RefreshCw className="w-10 h-10 text-[#D8B24C] animate-spin mx-auto" />
              <p className="text-[#F5F5F0] font-semibold text-base">Connecting to Meeting Circle...</p>
              <p className="text-xs text-[#A7A7A2]">Verifying security token and participant authorization</p>
            </div>
          ) : errorMsg ? (
            <div className="py-8 space-y-4 max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-[#E5A83B] mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-[#F5F5F0] mb-1">Meeting Circle Notice</h3>
                <p className="text-xs text-[#A7A7A2] leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={joinRoom}
                className="px-5 py-2.5 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] font-medium text-xs rounded-lg border border-[#343434] inline-flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Joining</span>
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="w-full h-64 bg-[#151515] rounded-xl border border-[#343434] relative flex flex-col items-center justify-center p-6 shadow-inner">
                <div className="w-16 h-16 bg-[#D8B24C]/10 border border-[#D8B24C]/30 rounded-full flex items-center justify-center text-[#D8B24C] mb-3 animate-pulse">
                  <Video className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-[#F5F5F0]">Meeting Circle Active</h3>
                <p className="text-xs text-[#45B982] font-medium mt-1 flex items-center justify-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Secure Patient Token Connected</span>
                </p>

                {meetingData?.participantCount !== undefined && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-[#202020] border border-[#343434] text-[#A7A7A2] text-xs font-medium rounded-full flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-[#D8B24C]" />
                    <span>{meetingData.participantCount} Connected</span>
                  </div>
                )}
              </div>

              <div className="bg-[#151515] p-4 rounded-lg border border-[#343434] text-left text-xs text-[#A7A7A2] space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-[#A7A7A2]">Room Status:</span>
                  <span className="text-[#45B982] font-semibold uppercase">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-[#A7A7A2]">Role Token:</span>
                  <span className="text-[#F5F5F0] font-mono text-[11px]">PATIENT_TOKEN_VERIFIED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#343434] bg-[#1B1B1B] flex items-center justify-center">
          <button
            onClick={handleLeaveRoom}
            className="px-6 py-2.5 bg-[#D95C5C] hover:bg-[#D95C5C]/90 text-[#F5F5F0] font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-2 transition-colors touch-target"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Meeting Circle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
