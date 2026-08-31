import React from 'react';

export function GameHeader({ title, score = 0, timerSeconds = 0, onExit }) {
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <header className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-base transition-colors border border-slate-700"
          title="Exit game"
        >
          ✕ Exit
        </button>
        <h2 className="text-xl md:text-2xl font-bold truncate max-w-[200px] md:max-w-xs">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <span className="text-xs uppercase font-semibold text-slate-400 block">Time</span>
          <span className="text-xl font-mono font-bold text-amber-400">{formatTime(timerSeconds)}</span>
        </div>

        <div className="text-center bg-blue-900/60 px-4 py-1 rounded-xl border border-blue-700/60">
          <span className="text-xs uppercase font-semibold text-blue-300 block">Score</span>
          <span className="text-2xl font-extrabold text-blue-300">{score}</span>
        </div>
      </div>
    </header>
  );
}
