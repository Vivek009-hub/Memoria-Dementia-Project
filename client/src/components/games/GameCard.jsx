import React from 'react';

const CATEGORY_LABEL_MAP = {
  MEMORY_MATCHING: 'Memory Matching 🧩',
  PICTURE_RECOGNITION: 'Picture Recognition 🖼️',
  FAMILIAR_FACE: 'Familiar People 👤',
  SEQUENCE: 'Sequence Memory 🔢',
  PATTERN: 'Pattern Recall 🎨',
  PUZZLE: 'Mind Puzzle 🧩',
  WORD_LANGUAGE: 'Word & Language 🔤',
  MUSIC_MEMORY: 'Music & Sound 🎵',
  DAILY_LIFE: 'Daily Routines 🏠',
};

const CATEGORY_COLOR_MAP = {
  MEMORY_MATCHING: 'bg-purple-100 text-purple-800 border-purple-300',
  PICTURE_RECOGNITION: 'bg-blue-100 text-blue-800 border-blue-300',
  FAMILIAR_FACE: 'bg-pink-100 text-pink-800 border-pink-300',
  SEQUENCE: 'bg-amber-100 text-amber-800 border-amber-300',
  PATTERN: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  WORD_LANGUAGE: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  PUZZLE: 'bg-teal-100 text-teal-800 border-teal-300',
  MUSIC_MEMORY: 'bg-rose-100 text-rose-800 border-rose-300',
  DAILY_LIFE: 'bg-orange-100 text-orange-800 border-orange-300',
};

export function GameCard({ game, onPlay }) {
  const categoryBadgeClass = CATEGORY_COLOR_MAP[game.category] || 'bg-gray-100 text-gray-800 border-gray-300';
  const categoryLabel = CATEGORY_LABEL_MAP[game.category] || game.category;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${categoryBadgeClass}`}>
            {categoryLabel}
          </span>
          {game.difficulty && (
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {game.difficulty}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-2">{game.title}</h3>
        <p className="text-slate-600 text-base leading-relaxed mb-6">{game.description}</p>
      </div>

      <button
        onClick={() => onPlay(game)}
        className="w-full min-h-[56px] py-3 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xl font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        <span>Play Game</span>
        <span aria-hidden="true">➔</span>
      </button>
    </div>
  );
}
