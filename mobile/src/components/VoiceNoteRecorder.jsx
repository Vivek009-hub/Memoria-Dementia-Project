/**
 * VoiceNoteRecorder.jsx — Memora Mobile Voice Note Recorder Component
 *
 * Dark charcoal theme (#181818 base, #202020 secondary surface, #8B5CF6 Purple accent).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

const MAX_RECORDING_SECONDS = 120; // 2 minutes limit

export function VoiceNoteRecorder({ onAudioRecorded, onAudioRemoved, existingAudioUrl }) {
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopMediaStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = async () => {
    setErrorMsg('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Voice recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      audioChunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        const url = URL.createObjectURL(finalBlob);

        setAudioBlob(finalBlob);
        setAudioUrl(url);
        stopMediaStream();

        if (onAudioRecorded) {
          onAudioRecorded(finalBlob, recordingSeconds || 1, mimeType || 'audio/webm');
        }
      };

      recorder.start(100);
      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            stopRecording();
            setErrorMsg('Maximum voice note duration (2 minutes) reached.');
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      stopMediaStream();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Microphone permission is required to record a voice note.');
      } else {
        setErrorMsg('Could not access microphone.');
      }
    }
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  const handleRemove = () => {
    if (isPlaying && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    }
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setCurrentTime(0);
    setDuration(0);
    setErrorMsg('');
    if (onAudioRemoved) onAudioRemoved();
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setErrorMsg('Playback failed.'));
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 bg-memora-surface-secondary border border-memora-border rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-[#8B5CF6] flex items-center space-x-2">
          <Mic className="w-4 h-4 text-[#8B5CF6]" />
          <span>Voice Note (Optional)</span>
        </label>
        {recording && (
          <span className="flex items-center space-x-1.5 text-xs text-red-400 font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Recording ({formatSeconds(recordingSeconds)})</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-2 text-xs text-red-400 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recording State Controls */}
      {!recording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-3.5 px-4 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 touch-target"
        >
          <Mic className="w-4.5 h-4.5" />
          <span>🎙 Record Voice Note</span>
        </button>
      )}

      {recording && (
        <button
          type="button"
          onClick={stopRecording}
          className="w-full py-3.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2 touch-target shadow-lg"
        >
          <Square className="w-4 h-4 fill-white" />
          <span>Stop Recording</span>
        </button>
      )}

      {/* Preview Player & Controls */}
      {!recording && audioUrl && (
        <div className="space-y-3 pt-1">
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onTimeUpdate={() => setCurrentTime(audioPlayerRef.current?.currentTime || 0)}
            onLoadedMetadata={() => setDuration(audioPlayerRef.current?.duration || 0)}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center justify-between bg-memora-surface p-3 rounded-2xl border border-memora-border space-x-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="p-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full transition-all shadow-md shrink-0 touch-target"
              title={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const newTime = Number(e.target.value);
                  if (audioPlayerRef.current) audioPlayerRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                className="w-full h-1.5 bg-memora-border rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
              />
              <div className="flex justify-between text-[10px] font-mono text-memora-text-muted">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration || recordingSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={startRecording}
                className="p-2 text-memora-text-muted hover:text-memora-text rounded-xl transition-colors"
                title="Re-record"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Remove voice note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
