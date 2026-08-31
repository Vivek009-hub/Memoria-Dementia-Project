import React, { useState } from 'react';

const PICTURE_ITEMS = [
  { icon: '🍎', prompt: 'Which icon is an Apple?', options: ['🍎', '🍌', '🚗', '🐶'], answer: '🍎' },
  { icon: '🚗', prompt: 'Which icon is a Car?', options: ['🐱', '🚗', '⚽', '🏡'], answer: '🚗' },
  { icon: '🐶', prompt: 'Which icon is a Dog?', options: ['🐶', '🍎', '📱', '🚲'], answer: '🐶' },
];

export function PictureRecognitionEngine({ difficulty = 'MEDIUM', onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());

  const currentItem = PICTURE_ITEMS[currentIdx];

  const handleSelect = (option) => {
    if (option === currentItem.answer) {
      if (currentIdx + 1 < PICTURE_ITEMS.length) {
        setCurrentIdx((i) => i + 1);
      } else {
        const totalTimeMs = Date.now() - startTime;
        const totalAttempts = PICTURE_ITEMS.length + mistakes;
        const accuracy = Math.round((PICTURE_ITEMS.length / totalAttempts) * 100);
        const score = Math.max(10, 100 - mistakes * 15);

        onComplete({
          score,
          accuracy: Math.min(100, Math.max(0, accuracy)),
          responseTimeMs: totalTimeMs,
          mistakes,
          hintsUsed: 0,
        });
      }
    } else {
      setMistakes((m) => m + 1);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-md w-full mb-6 text-center">
        <span className="text-sm font-semibold text-slate-500 block mb-2">
          Item {currentIdx + 1} of {PICTURE_ITEMS.length}
        </span>
        <h3 className="text-2xl font-extrabold text-slate-900 leading-snug">
          {currentItem.prompt}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {currentItem.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className="h-32 bg-white hover:bg-blue-50 border-2 border-slate-300 hover:border-blue-600 text-6xl rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-center active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
