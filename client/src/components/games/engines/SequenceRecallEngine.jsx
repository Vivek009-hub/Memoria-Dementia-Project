import React, { useState, useEffect } from 'react';

const COLORS = [
  { id: 'RED', label: '🔴 Red', bg: 'bg-red-500 hover:bg-red-600', activeBg: 'bg-red-300' },
  { id: 'BLUE', label: '🔵 Blue', bg: 'bg-blue-500 hover:bg-blue-600', activeBg: 'bg-blue-300' },
  { id: 'GREEN', label: '🟢 Green', bg: 'bg-green-500 hover:bg-green-600', activeBg: 'bg-green-300' },
  { id: 'YELLOW', label: '🟡 Yellow', bg: 'bg-amber-400 hover:bg-amber-500', activeBg: 'bg-amber-200' },
];

export function SequenceRecallEngine({ difficulty = 'MEDIUM', onComplete }) {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [phase, setPhase] = useState('MEMORIZE'); // 'MEMORIZE' | 'RECALL'
  const [activeColor, setActiveColor] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);
  const [startTime] = useState(Date.now());

  const targetRounds = difficulty === 'EASY' ? 3 : difficulty === 'HARD' ? 5 : 4;
  const sequenceLength = round + 2;

  useEffect(() => {
    startNextRound();
  }, [round]);

  const startNextRound = () => {
    setPhase('MEMORIZE');
    setUserSequence([]);
    const newSeq = Array.from({ length: sequenceLength }, () => COLORS[Math.floor(Math.random() * COLORS.length)].id);
    setSequence(newSeq);

    // Play sequence animation
    newSeq.forEach((colorId, idx) => {
      setTimeout(() => {
        setActiveColor(colorId);
        setTimeout(() => setActiveColor(null), 600);
      }, (idx + 1) * 900);
    });

    setTimeout(() => {
      setPhase('RECALL');
    }, (newSeq.length + 1) * 900);
  };

  const handleColorClick = (colorId) => {
    if (phase !== 'RECALL') return;

    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    const nextUserSeq = [...userSequence, colorId];
    setUserSequence(nextUserSeq);

    const currentIdx = nextUserSeq.length - 1;
    if (colorId !== sequence[currentIdx]) {
      // Mistake made
      setMistakes((prev) => prev + 1);
      setTimeout(() => {
        startNextRound();
      }, 500);
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      // Completed round
      if (round < targetRounds) {
        setTimeout(() => {
          setRound((r) => r + 1);
        }, 800);
      } else {
        // Game complete
        const totalTimeMs = Date.now() - startTime;
        const totalInputs = targetRounds * 4 + mistakes;
        const accuracy = Math.round((targetRounds * 4 / totalInputs) * 100);
        const score = Math.max(10, 100 - mistakes * 15);

        onComplete({
          score,
          accuracy: Math.min(100, Math.max(0, accuracy)),
          responseTimeMs: totalTimeMs,
          mistakes,
          hintsUsed: 0,
        });
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <p className="text-xl font-bold text-slate-800 mb-1">
          {phase === 'MEMORIZE' ? '👀 Watch the sequence...' : '👉 Repeat the sequence!'}
        </p>
        <span className="text-sm font-semibold text-slate-500">
          Round {round} of {targetRounds}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {COLORS.map((c) => (
          <button
            key={c.id}
            onClick={() => handleColorClick(c.id)}
            disabled={phase !== 'RECALL'}
            className={`h-32 rounded-3xl text-2xl font-black text-white transition-all shadow-lg flex items-center justify-center ${
              activeColor === c.id ? `${c.activeBg} scale-105 ring-4 ring-white` : c.bg
            } ${phase !== 'RECALL' ? 'cursor-not-allowed opacity-90' : 'active:scale-95'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
