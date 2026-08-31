import React, { useState, useEffect } from 'react';

const CARD_SYMBOLS = ['🍎', '🍌', '🍒', '🍇', '🍓', '🍊', '🍉', '🍍'];

export function MemoryMatchEngine({ difficulty = 'MEDIUM', onComplete }) {
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [startTime] = useState(Date.now());
  const [isProcessing, setIsProcessing] = useState(false);

  const getPairCount = () => {
    if (difficulty === 'EASY') return 3; // 6 cards
    if (difficulty === 'HARD') return 8; // 16 cards
    return 4; // 8 cards (MEDIUM)
  };

  useEffect(() => {
    const pairCount = getPairCount();
    const selectedSymbols = CARD_SYMBOLS.slice(0, pairCount);
    const cardDeck = [...selectedSymbols, ...selectedSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({ id: idx, symbol }));

    setCards(cardDeck);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMistakes(0);
  }, [difficulty]);

  const handleCardClick = (index) => {
    if (
      isProcessing ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].symbol)
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = newFlipped;
      const firstSymbol = cards[firstIdx].symbol;
      const secondSymbol = cards[secondIdx].symbol;

      if (firstSymbol === secondSymbol) {
        const newMatched = [...matchedPairs, firstSymbol];
        setMatchedPairs(newMatched);
        setFlippedIndices([]);
        setIsProcessing(false);

        // Check victory
        if (newMatched.length === getPairCount()) {
          const totalTimeMs = Date.now() - startTime;
          const totalAttempts = newMatched.length + mistakes;
          const accuracy = Math.round((newMatched.length / totalAttempts) * 100);
          const score = Math.max(10, 100 - mistakes * 10);

          onComplete({
            score,
            accuracy: Math.min(100, Math.max(0, accuracy)),
            responseTimeMs: totalTimeMs,
            mistakes,
            hintsUsed: 0,
          });
        }
      } else {
        setMistakes((prev) => prev + 1);
        setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <p className="text-xl font-bold text-slate-800">
          Find matching pairs! ({matchedPairs.length} / {getPairCount()} matched)
        </p>
      </div>

      <div
        className={`grid gap-4 w-full max-w-lg ${
          cards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4'
        }`}
      >
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.symbol);
          const isMatched = matchedPairs.includes(card.symbol);

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={isMatched || isProcessing}
              className={`h-24 md:h-28 rounded-2xl text-4xl flex items-center justify-center transition-all duration-300 border-2 font-bold shadow-md ${
                isMatched
                  ? 'bg-emerald-100 border-emerald-400 opacity-80 cursor-default'
                  : isFlipped
                  ? 'bg-white border-blue-500 shadow-lg scale-105'
                  : 'bg-blue-600 hover:bg-blue-700 border-blue-800 text-transparent active:scale-95'
              }`}
            >
              {isFlipped ? card.symbol : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
