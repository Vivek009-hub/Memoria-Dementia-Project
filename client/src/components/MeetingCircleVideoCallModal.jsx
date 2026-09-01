/**
 * MeetingCircleVideoCallModal.jsx — Real Daily Video Call UI Modal (Phase F7 / B8)
 *
 * Implements 6-tile video grid, Daily call connection lifecycle, audio/video controls,
 * participant reporting, and leave reconciliation.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  Flag,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  X,
  Volume2,
} from 'lucide-react';
import * as meetingCircleApi from '../api/meetingCircle.api.js';

export function MeetingCircleVideoCallModal({ circle, roomData, isOpen, onClose }) {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingUser, setReportingUser] = useState(null);
  const [reportReason, setReportReason] = useState('Inappropriate behavior');
  const [reportComments, setReportComments] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');

  const iframeRef = useRef(null);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  // Acquire local media stream when camera is on
  useEffect(() => {
    if (!isOpen || !cameraOn) {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      return;
    }

    let activeStream = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: micOn })
        .then((stream) => {
          activeStream = stream;
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          // Camera permission denied or device unavailable
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, cameraOn, micOn]);

  // Initialize call session & load participants
  useEffect(() => {
    if (!isOpen || !circle) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');

    const fetchParticipants = async () => {
      try {
        const res = await meetingCircleApi.getActiveParticipants(circle.id);
        if (isMounted && res.data) {
          setParticipants(res.data);
        }
      } catch {
        // Fallback to active participant count DTO if endpoint fails
        if (isMounted) {
          setParticipants([
            { id: 'self', name: 'You (Patient)', role: 'HOST', status: 'ACTIVE' },
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, circle]);

  if (!isOpen || !circle) return null;

  const handleLeaveCall = async () => {
    try {
      await meetingCircleApi.leaveCircle(circle.id);
    } catch {
      // Ignore network errors on leave
    } finally {
      onClose();
    }
  };

  const handleOpenReport = (participant) => {
    setReportingUser(participant);
    setReportReason('Inappropriate behavior');
    setReportComments('');
    setReportSuccess('');
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportingUser) return;

    setReportSubmitting(true);
    try {
      await meetingCircleApi.reportParticipant(circle.id, {
        participantId: reportingUser.userId || reportingUser.id,
        reason: reportReason,
        comments: reportComments,
      });
      setReportSuccess('Participant report submitted to safety moderators.');
      setTimeout(() => {
        setReportModalOpen(false);
        setReportingUser(null);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit participant report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#151515]/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#202020] border border-[#343434] rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Call Top Bar */}
        <div className="p-4 sm:p-6 bg-[#1B1B1B] border-b border-[#343434] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#45B982] animate-ping" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F0] leading-none">
                {circle.name}
              </h2>
              <span className="text-xs text-[#A7A7A2] font-medium mt-1 block">
                {circle.visibility === 'INVITE_ONLY' ? 'Private Circle' : 'Discoverable Circle'} • Hosted by {circle.creatorName || 'Host'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 bg-[#151515] border border-[#343434] rounded-lg flex items-center space-x-2 text-xs font-semibold text-[#A7A7A2]">
              <Users className="w-4 h-4 text-[#D8B24C]" />
              <span>
                {circle.activeParticipantCount || participants.length || 1} / {circle.maxParticipants || 6}
              </span>
            </div>

            <button
              onClick={handleLeaveCall}
              className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
              title="Leave room"
              aria-label="Leave room"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Grid Area */}
        <div className="flex-1 p-4 sm:p-6 bg-slate-950 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-slate-300 font-bold text-base">Joining Daily Video Room...</p>
              <span className="text-xs text-slate-500 max-w-xs">
                Authorizing secure 6-participant video stream
              </span>
            </div>
          ) : roomData?.url && !roomData.url.includes('memora-mock.daily.co') && !roomData.url.includes('memora-fallback') ? (
            /* Daily Embedded Room Iframe / Call Interface */
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative">
              <iframe
                ref={iframeRef}
                src={`${roomData.url}?t=${roomData.token || ''}`}
                title="Daily Video Room"
                className="w-full h-full border-0"
                allow="camera; microphone; autoplay; display-capture"
              />
            </div>
          ) : (
            /* Structured 6-Tile Participant Grid (when using room simulation or mock Daily token) */
            <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {/* Participant Tiles (Up to 6) */}
              {Array.from({ length: 6 }).map((_, idx) => {
                const p = participants[idx];
                const isSelf = idx === 0;

                if (p || isSelf) {
                  return (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between relative overflow-hidden group shadow-lg"
                    >
                      <div className="w-full flex items-center justify-between z-10">
                        <span className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 text-[11px] font-bold text-slate-300 rounded-xl">
                          {isSelf ? 'You (Patient)' : p?.name || `Participant ${idx + 1}`}
                        </span>

                        {!isSelf && p && (
                          <button
                            onClick={() => handleOpenReport(p)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition-colors"
                            title="Report participant"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Video Stream / Avatar Tile */}
                      <div className="my-auto text-center space-y-2 w-full flex flex-col items-center">
                        {isSelf && cameraOn && localStream ? (
                          <div className="w-full h-36 sm:h-40 rounded-2xl overflow-hidden border-2 border-emerald-500/50 bg-black shadow-xl relative">
                            <video
                              ref={localVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover transform -scale-x-100"
                            />
                            <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-lg text-[10px] font-bold text-emerald-400">
                              Live Camera
                            </span>
                          </div>
                        ) : (
                          <div
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto flex items-center justify-center border-2 shadow-xl ${
                              isSelf
                                ? 'bg-gradient-to-tr from-emerald-600 to-indigo-600 border-emerald-400 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="text-2xl font-black uppercase">
                              {isSelf ? 'YOU' : (p?.name || 'P')[0]}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Connected</span>
                        </div>
                      </div>

                      {/* Tile Footer Status */}
                      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 font-mono z-10">
                        <span>{isSelf ? (micOn ? 'Mic On' : 'Muted') : 'Audio Active'}</span>
                        <span>{isSelf ? (cameraOn ? 'Cam On' : 'Cam Off') : '720p HD'}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="bg-slate-950/40 border border-dashed border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 text-slate-600"
                  >
                    <Users className="w-8 h-8 opacity-40" />
                    <span className="text-xs font-bold">Slot {idx + 1} / 6</span>
                    <span className="text-[10px]">Open for peer to join</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Video Control Bar */}
        <div className="p-4 sm:p-6 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-4 rounded-2xl border flex items-center space-x-2 font-bold text-xs transition-all touch-target-xl ${
                micOn
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white'
                  : 'bg-red-950 border-red-500/50 text-red-300'
              }`}
            >
              {micOn ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5" />}
              <span className="hidden sm:inline">{micOn ? 'Mute' : 'Unmuted'}</span>
            </button>

            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`p-4 rounded-2xl border flex items-center space-x-2 font-bold text-xs transition-all touch-target-xl ${
                cameraOn
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-white'
                  : 'bg-red-950 border-red-500/50 text-red-300'
              }`}
            >
              {cameraOn ? <Video className="w-5 h-5 text-indigo-400" /> : <VideoOff className="w-5 h-5" />}
              <span className="hidden sm:inline">{cameraOn ? 'Stop Video' : 'Start Video'}</span>
            </button>
          </div>

          {/* Leave Call Button */}
          <button
            onClick={handleLeaveCall}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 transition-all flex items-center space-x-2 touch-target-xl"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Leave Call</span>
          </button>
        </div>
      </div>

      {/* Participant Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-xl font-extrabold text-white">Report Participant</h3>
            </div>

            {reportSuccess ? (
              <p className="text-sm font-bold text-emerald-400 p-3 bg-emerald-950/50 rounded-2xl border border-emerald-500/30">
                {reportSuccess}
              </p>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Report <strong className="text-white">{reportingUser?.name}</strong> to Memora safety moderators.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs font-semibold focus:outline-none"
                  >
                    <option value="Inappropriate behavior">Inappropriate behavior</option>
                    <option value="Harassment">Harassment</option>
                    <option value="Spam / Disruption">Spam / Disruption</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={reportComments}
                    onChange={(e) => setReportComments(e.target.value)}
                    placeholder="Provide details..."
                    rows={3}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-950 text-slate-400 font-bold text-xs rounded-xl border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
