/**
 * VoiceNoteRecorder.jsx — Memora Native Voice Note Recording Component
 *
 * Uses browser MediaRecorder API to capture audio, preview recordings, and
 * pass the Blob & metadata back to memory forms.
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

  // Clean up media tracks & object URLs on unmount
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
        setErrorMsg('Could not access microphone. Please check your browser settings.');
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
        .catch(() => setErrorMsg('Playback failed. Please try again.'));
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 bg-[#151515] border border-[#343434] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#D8B24C] flex items-center space-x-2">
          <Mic className="w-4 h-4" />
          <span>Voice Note (Optional)</span>
        </label>
        {recording && (
          <span className="flex items-center space-x-1.5 text-xs text-[#D95C5C] font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#D95C5C]" />
            <span>Recording ({formatSeconds(recordingSeconds)} / 2:00)</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-lg flex items-center space-x-2 text-xs text-[#D95C5C]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Recording State Controls */}
      {!recording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-3 px-4 bg-[#242424] hover:bg-[#2F2F2F] text-[#F5F5F0] border border-[#343434] hover:border-[#D8B24C]/50 font-semibold text-xs rounded-lg transition-all flex items-center justify-center space-x-2 touch-target"
        >
          <Mic className="w-4 h-4 text-[#D8B24C]" />
          <span>🎙 Record Voice Note</span>
        </button>
      )}

      {recording && (
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 py-3 px-4 bg-[#D95C5C] hover:bg-[#E26B6B] text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center space-x-2 touch-target shadow-xs"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Stop Recording</span>
          </button>
        </div>
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

          <div className="flex items-center justify-between bg-[#202020] p-3 rounded-lg border border-[#343434] space-x-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="p-2 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] rounded-full transition-colors shrink-0"
              title={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-[#151515]" /> : <Play className="w-4 h-4 fill-[#151515] ml-0.5" />}
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
                className="w-full h-1.5 bg-[#343434] rounded-lg appearance-none cursor-pointer accent-[#D8B24C]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#A7A7A2]">
                <span>{formatSeconds(currentTime)}</span>
                <span>{formatSeconds(duration || recordingSeconds)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={startRecording}
                className="p-2 text-[#A7A7A2] hover:text-[#F5F5F0] hover:bg-[#2F2F2F] rounded-lg transition-colors"
                title="Re-record"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-[#D95C5C] hover:bg-[#D95C5C]/10 rounded-lg transition-colors"
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
