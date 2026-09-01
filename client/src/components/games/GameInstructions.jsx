import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function GameInstructions({ game, onStart, onClose, isStarting = false }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(game?.difficulty || 'MEDIUM');

  if (!game) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[#202020] rounded-xl max-w-lg w-full p-6 border border-[#343434] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A7A7A2] hover:text-[#F5F5F0] p-1.5 rounded-lg hover:bg-[#242424] transition-colors"
          aria-label="Close instructions"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-[#9B6B9E]/15 border border-[#9B6B9E]/30 rounded-xl flex items-center justify-center mx-auto text-[#9B6B9E] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#F5F5F0]">{game.title}</h2>
        </div>

        <div className="bg-[#151515] p-4 rounded-lg border border-[#343434] mb-5">
          <h3 className="text-sm font-semibold text-[#D8B24C] mb-1">How to Play:</h3>
          <p className="text-[#A7A7A2] text-sm leading-relaxed whitespace-pre-line">
            {game.instructions || game.description || 'Follow the prompts on screen to complete the exercise at your own comfortable pace.'}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-[#F5F5F0] text-sm font-semibold mb-2 text-center">
            Select Difficulty:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${
                  selectedDifficulty === diff
                    ? 'bg-[#D8B24C] text-[#151515] border-[#D8B24C]'
                    : 'bg-[#151515] text-[#A7A7A2] border-[#343434] hover:text-[#F5F5F0]'
                }`}
              >
                {diff === 'EASY' ? 'Easy' : diff === 'MEDIUM' ? 'Medium' : 'Hard'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onStart(selectedDifficulty)}
            disabled={isStarting}
            className="w-full py-3 bg-[#D8B24C] hover:bg-[#F0C75E] disabled:opacity-50 text-[#151515] text-sm font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 touch-target"
          >
            <span>{isStarting ? 'Starting Session...' : 'Start Exercise'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-[#A7A7A2] hover:text-[#F5F5F0] text-xs font-medium text-center"
          >
            Back to Library
          </button>
        </div>
      </div>
    </div>
  );
}
