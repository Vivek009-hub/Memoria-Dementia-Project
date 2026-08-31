import React, { useState } from 'react';

const QUESTIONS = [
  { prompt: 'What season comes after Winter?', options: ['Spring', 'Summer', 'Autumn', 'Monsoon'], answer: 'Spring' },
  { prompt: 'Which animal gives milk and says "moo"?', options: ['Cow', 'Dog', 'Cat', 'Bird'], answer: 'Cow' },
  { prompt: 'What color is the sky on a clear day?', options: ['Blue', 'Green', 'Red', 'Yellow'], answer: 'Blue' },
  { prompt: 'Which item is used to eat soup?', options: ['Spoon', 'Fork', 'Key', 'Comb'], answer: 'Spoon' },
];

export function WordLanguageEngine({ difficulty = 'MEDIUM', onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());

  const currentQ = QUESTIONS[currentIdx];

  const handleSelectOption = (option) => {
    if (option === currentQ.answer) {
      if (currentIdx + 1 < QUESTIONS.length) {
        setCurrentIdx((i) => i + 1);
      } else {
        const totalTimeMs = Date.now() - startTime;
        const totalAttempts = QUESTIONS.length + mistakes;
        const accuracy = Math.round((QUESTIONS.length / totalAttempts) * 100);
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
          Question {currentIdx + 1} of {QUESTIONS.length}
        </span>
        <h3 className="text-2xl font-extrabold text-slate-900 leading-snug">
          {currentQ.prompt}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {currentQ.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelectOption(opt)}
            className="min-h-[64px] py-4 px-6 bg-white hover:bg-blue-50 border-2 border-slate-300 hover:border-blue-600 text-slate-900 text-xl font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98 text-center"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
