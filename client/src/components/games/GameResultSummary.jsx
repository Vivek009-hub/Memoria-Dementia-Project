import React from 'react';
import { Trophy, RotateCcw, ArrowLeft } from 'lucide-react';

export function GameResultSummary({ session, gameTitle, onPlayAgain, onBackToLibrary }) {
  if (!session) return null;

  const { score = 0, accuracy = 100, responseTimeMs = 0, mistakes = 0 } = session;
  const timeSeconds = Math.round(responseTimeMs / 1000);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#202020] rounded-xl max-w-md w-full p-6 border border-[#343434] shadow-2xl text-center relative">
        <div className="w-14 h-14 bg-[#D8B24C]/15 border border-[#D8B24C]/30 rounded-xl flex items-center justify-center mx-auto text-[#D8B24C] mb-3">
          <Trophy className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-[#F5F5F0] mb-1">Great Job!</h2>
        <p className="text-[#A7A7A2] text-sm mb-5">{gameTitle || 'Exercise Completed'}</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#151515] p-3.5 rounded-lg border border-[#343434]">
            <span className="text-xs font-medium text-[#A7A7A2] uppercase block">Score</span>
            <span className="text-2xl font-bold text-[#45B982]">{score}</span>
          </div>

          <div className="bg-[#151515] p-3.5 rounded-lg border border-[#343434]">
            <span className="text-xs font-medium text-[#A7A7A2] uppercase block">Accuracy</span>
            <span className="text-2xl font-bold text-[#D8B24C]">{Math.round(accuracy)}%</span>
          </div>

          <div className="bg-[#151515] p-3.5 rounded-lg border border-[#343434]">
            <span className="text-xs font-medium text-[#A7A7A2] uppercase block">Time</span>
            <span className="text-xl font-bold text-[#F5F5F0] font-mono">{timeSeconds}s</span>
          </div>

          <div className="bg-[#151515] p-3.5 rounded-lg border border-[#343434]">
            <span className="text-xs font-medium text-[#A7A7A2] uppercase block">Mistakes</span>
            <span className="text-xl font-bold text-[#F5F5F0]">{mistakes}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2 touch-target"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          <button
            onClick={onBackToLibrary}
            className="w-full py-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-semibold rounded-lg border border-[#343434] transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Exercises Library</span>
          </button>
        </div>
      </div>
    </div>
  );
}
