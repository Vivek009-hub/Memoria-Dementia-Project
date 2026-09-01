import React from 'react';
import { X, Clock, Trophy } from 'lucide-react';

export function GameHeader({ title, score = 0, timerSeconds = 0, onExit }) {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="bg-[#202020] text-[#F5F5F0] p-4 rounded-xl border border-[#343434] shadow-xs flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onExit}
          className="bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] font-medium py-1.5 px-3 rounded-lg text-xs transition-colors border border-[#343434] flex items-center space-x-1.5"
          title="Exit game"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
        <h2 className="text-base font-semibold truncate max-w-[200px] md:max-w-xs">{title}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-center flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-[#D8B24C]" />
          <span className="text-sm font-mono font-semibold text-[#F5F5F0]">{formatTime(timerSeconds)}</span>
        </div>

        <div className="text-center bg-[#151515] px-3.5 py-1 rounded-lg border border-[#343434] flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-[#45B982]" />
          <span className="text-sm font-bold text-[#45B982]">{score}</span>
        </div>
      </div>
    </header>
  );
}
