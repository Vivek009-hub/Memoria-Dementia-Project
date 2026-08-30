import React, { useState } from 'react';

export function GameInstructions({ game, onStart, onClose, isStarting = false }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(game?.difficulty || 'MEDIUM');

  if (!game) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 border-4 border-blue-600 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 text-2xl font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="Close instructions"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <span className="text-5xl mb-2 block">🧠</span>
          <h2 className="text-3xl font-extrabold text-slate-900">{game.title}</h2>
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
          <h3 className="text-lg font-bold text-slate-700 mb-2">How to Play:</h3>
          <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
            {game.instructions || game.description || 'Follow the prompts on screen to complete the exercise at your own comfortable pace.'}
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-slate-800 text-lg font-bold mb-3 text-center">
            Select Difficulty:
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`py-3 px-2 rounded-xl text-base font-bold transition-all border-2 ${
                  selectedDifficulty === diff
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {diff === 'EASY' ? '🟢 Easy' : diff === 'MEDIUM' ? '🟡 Medium' : '🔴 Hard'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onStart(selectedDifficulty)}
            disabled={isStarting}
            className="w-full min-h-[64px] bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-slate-400 text-white text-2xl font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            <span>{isStarting ? 'Starting Session...' : 'Start Game NOW 🚀'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-slate-600 hover:text-slate-800 text-lg font-semibold text-center"
          >
            Back to Library
          </button>
        </div>
      </div>
    </div>
  );
}
