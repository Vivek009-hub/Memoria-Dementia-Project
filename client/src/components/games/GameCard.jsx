import React from 'react';

const CATEGORY_LABEL_MAP = {
  MEMORY_MATCHING: 'Memory Matching',
  PICTURE_RECOGNITION: 'Picture Recognition',
  FAMILIAR_FACE: 'Familiar People',
  SEQUENCE: 'Sequence Memory',
  PATTERN: 'Pattern Recall',
  PUZZLE: 'Mind Puzzle',
  WORD_LANGUAGE: 'Word & Language',
  MUSIC_MEMORY: 'Music & Sound',
  DAILY_LIFE: 'Daily Routines',
};

export function GameCard({ game, onPlay }) {
  const categoryLabel = CATEGORY_LABEL_MAP[game.category] || game.category;

  return (
    <div className="bg-[#202020] rounded-xl border border-[#343434] hover:border-[#D8B24C]/60 p-6 shadow-xs transition-all duration-200 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#9B6B9E]/15 text-[#9B6B9E] border border-[#9B6B9E]/30">
            {categoryLabel}
          </span>
          {game.difficulty && (
            <span className="text-xs font-semibold text-[#A7A7A2] uppercase tracking-wider">
              {game.difficulty}
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors mb-2">{game.title}</h3>
        <p className="text-[#A7A7A2] text-sm leading-relaxed mb-6">{game.description}</p>
      </div>

      <button
        onClick={() => onPlay(game)}
        className="w-full py-3 px-5 bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-2 touch-target"
      >
        <span>Play Exercise</span>
        <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
}
