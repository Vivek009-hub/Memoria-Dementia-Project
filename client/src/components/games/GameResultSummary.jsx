import React from 'react';

export function GameResultSummary({ session, gameTitle, onPlayAgain, onBackToLibrary }) {
  if (!session) return null;

  const { score = 0, accuracy = 100, responseTimeMs = 0, mistakes = 0 } = session;
  const timeSeconds = Math.round(responseTimeMs / 1000);

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 border-4 border-emerald-500 shadow-2xl text-center relative">
        <div className="text-6xl mb-3 animate-bounce">🌟</div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Great Job!</h2>
        <p className="text-slate-600 text-lg mb-6">{gameTitle || 'Exercise Completed'}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
            <span className="text-sm font-semibold text-emerald-800 uppercase block">Score</span>
            <span className="text-3xl font-black text-emerald-700">{score}</span>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
            <span className="text-sm font-semibold text-blue-800 uppercase block">Accuracy</span>
            <span className="text-3xl font-black text-blue-700">{Math.round(accuracy)}%</span>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <span className="text-sm font-semibold text-amber-800 uppercase block">Time Taken</span>
            <span className="text-2xl font-bold text-amber-700">{timeSeconds}s</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-sm font-semibold text-slate-600 uppercase block">Mistakes</span>
            <span className="text-2xl font-bold text-slate-700">{mistakes}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full min-h-[60px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xl font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>🔄 Play Again</span>
          </button>

          <button
            onClick={onBackToLibrary}
            className="w-full min-h-[52px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-lg font-bold rounded-2xl transition-colors"
          >
            Back to Games Library
          </button>
        </div>
      </div>
    </div>
  );
}
