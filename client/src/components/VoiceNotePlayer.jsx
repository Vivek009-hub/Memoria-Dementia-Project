/**
 * VoiceNotePlayer.jsx — Memora Accessible Voice Note Audio Player
 *
 * Renders an elder-friendly audio player for playing voice notes attached to memories.
 */

import React, { useState, useRef } from 'react';
import { Mic, Play, Pause, Volume2, AlertCircle } from 'lucide-react';

export function VoiceNotePlayer({ audioUrl, duration: durationProp }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationProp || 0);
  const [errorMsg, setErrorMsg] = useState('');

  const audioRef = useRef(null);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    setErrorMsg('');

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          setIsPlaying(false);
          setErrorMsg('Unable to play audio note. Please try again.');
        });
    }
  };

  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-4 bg-[#151515] border border-[#343434] hover:border-[#D8B24C]/40 rounded-xl space-y-2 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#D8B24C]">
          <Mic className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Voice Note</span>
        </div>
        <span className="text-xs font-mono text-[#A7A7A2]">
          {formatSeconds(currentTime)} / {formatSeconds(duration || durationProp)}
        </span>
      </div>

      {errorMsg && (
        <div className="text-xs text-[#D95C5C] flex items-center space-x-1.5 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || durationProp || 0)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setErrorMsg('Failed to load voice note file.')}
        className="hidden"
      />

      <div className="flex items-center space-x-3 pt-1">
        <button
          type="button"
          onClick={togglePlay}
          className="p-3 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] rounded-full transition-all shadow-xs flex items-center justify-center shrink-0 touch-target"
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-[#151515]" />
          ) : (
            <Play className="w-5 h-5 fill-[#151515] ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const newTime = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }}
            className="w-full h-2 bg-[#252525] rounded-lg appearance-none cursor-pointer accent-[#D8B24C]"
          />
        </div>
      </div>
    </div>
  );
}
