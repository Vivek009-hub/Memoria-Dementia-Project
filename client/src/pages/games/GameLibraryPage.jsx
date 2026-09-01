import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, History, RefreshCw, Trophy } from 'lucide-react';
import { fetchGames, fetchGameHistory, startGameSession } from '../../api/gamesApi.js';
import { GameCard } from '../../components/games/GameCard.jsx';
import { GameInstructions } from '../../components/games/GameInstructions.jsx';

const DEFAULT_MOCK_GAMES = [
  {
    id: '65f1a0000000000000000001',
    _id: '65f1a0000000000000000001',
    title: 'Memory Match',
    description: 'Exercise your memory by finding matching pairs of familiar items.',
    category: 'MEMORY_MATCHING',
    difficulty: 'EASY',
    instructions: 'Tap on cards to flip them over. Match all pairs of identical cards to complete the exercise!',
  },
  {
    id: '65f1a0000000000000000002',
    _id: '65f1a0000000000000000002',
    title: 'Sequence Recall',
    description: 'Remember and repeat the sequence of colored lights in the correct order.',
    category: 'SEQUENCE',
    difficulty: 'MEDIUM',
    instructions: 'Watch the sequence of colors carefully. When it is your turn, tap the colored buttons in the exact same order!',
  },
  {
    id: '65f1a0000000000000000003',
    _id: '65f1a0000000000000000003',
    title: 'Word & Language',
    description: 'Stimulate language recall by answering simple everyday vocabulary questions.',
    category: 'WORD_LANGUAGE',
    difficulty: 'EASY',
    instructions: 'Read the question carefully and tap the best answer option from the choices given.',
  },
  {
    id: '65f1a0000000000000000004',
    _id: '65f1a0000000000000000004',
    title: 'Picture Recognition',
    description: 'Identify familiar everyday objects and symbols from high-contrast pictures.',
    category: 'PICTURE_RECOGNITION',
    difficulty: 'EASY',
    instructions: 'Look at the prompt and tap the matching picture icon on the screen.',
  },
];

export function GameLibraryPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('GAMES'); // 'GAMES' | 'HISTORY'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [selectedGameForInstructions, setSelectedGameForInstructions] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  useEffect(() => {
    loadGames();
    loadHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      loadHistory();
    }
  }, [activeTab]);

  async function loadGames() {
    try {
      setLoading(true);
      const res = await fetchGames();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setGames(res.data);
      } else {
        setGames(DEFAULT_MOCK_GAMES);
      }
    } catch {
      setGames(DEFAULT_MOCK_GAMES);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetchGameHistory();
      if (res?.data && Array.isArray(res.data)) {
        setHistory(res.data);
      } else if (Array.isArray(res)) {
        setHistory(res);
      }
    } catch {
      // Non-blocking
    }
  }

  const handleSelectGame = (game) => {
    setSelectedGameForInstructions(game);
  };

  const handleStartGame = async (difficulty) => {
    if (!selectedGameForInstructions) return;

    const gameId = selectedGameForInstructions.id || selectedGameForInstructions._id;

    try {
      setIsStartingSession(true);
      const sessionRes = await startGameSession(gameId, difficulty);
      const sessionId = sessionRes?.data?.id || sessionRes?.data?._id || sessionRes?.id || sessionRes?._id;

      navigate(`/app/games/${gameId}`, {
        state: {
          game: selectedGameForInstructions,
          sessionId,
          difficulty,
        },
      });
    } catch {
      navigate(`/app/games/${gameId}`, {
        state: {
          game: selectedGameForInstructions,
          sessionId: `fallback_session_${Date.now()}`,
          difficulty,
        },
      });
    } finally {
      setIsStartingSession(false);
      setSelectedGameForInstructions(null);
    }
  };

  const filteredGames = games.filter((g) => {
    if (selectedCategory === 'ALL') return true;
    return g.category === selectedCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#9B6B9E] mb-1">
            <Gamepad2 className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Brain Practice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">Cognitive Exercises</h1>
          <p className="text-sm text-[#A7A7A2] mt-1">
            Relaxing exercises to stimulate your memory, pattern recall, and cognitive focus.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-3 border-b border-[#343434] pb-3">
        <button
          onClick={() => setActiveTab('GAMES')}
          className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center space-x-2 touch-target ${
            activeTab === 'GAMES'
              ? 'bg-[#D8B24C] text-[#151515] shadow-xs'
              : 'bg-[#202020] text-[#A7A7A2] hover:text-[#F5F5F0] border border-[#343434]'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Available Exercises ({games.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center space-x-2 touch-target ${
            activeTab === 'HISTORY'
              ? 'bg-[#D8B24C] text-[#151515] shadow-xs'
              : 'bg-[#202020] text-[#A7A7A2] hover:text-[#F5F5F0] border border-[#343434]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Progress History</span>
        </button>
      </div>

      {activeTab === 'GAMES' ? (
        <>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'MEMORY_MATCHING', 'SEQUENCE', 'WORD_LANGUAGE', 'PICTURE_RECOGNITION'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#D8B24C] text-[#151515] border-[#D8B24C] font-semibold'
                    : 'bg-[#202020] text-[#A7A7A2] border-[#343434] hover:text-[#F5F5F0]'
                }`}
              >
                {cat === 'ALL' ? 'All Activities' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
              <p className="text-[#A7A7A2] text-sm">Loading exercises...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => (
                <GameCard key={game.id || game._id} game={game} onPlay={handleSelectGame} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* History Tab */
        <div className="bg-[#202020] rounded-xl p-6 border border-[#343434] space-y-4">
          <h2 className="text-lg font-semibold text-[#F5F5F0] flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-[#D8B24C]" />
            <span>Completed Exercise Sessions</span>
          </h2>
          {history.length === 0 ? (
            <div className="text-center py-12 text-[#A7A7A2] text-sm">
              No completed exercise sessions recorded yet. Play a game to see your scores here!
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id || item._id}
                  className="flex items-center justify-between p-4 bg-[#151515] rounded-lg border border-[#343434]"
                >
                  <div>
                    <span className="text-xs text-[#74746F] block font-mono mb-0.5">
                      {new Date(item.completedAt || item.createdAt || item.startedAt).toLocaleDateString()}
                    </span>
                    <h4 className="text-base font-semibold text-[#F5F5F0]">
                      {item.game?.title || item.gameId?.title || 'Cognitive Exercise'}
                    </h4>
                    <span className="text-xs font-medium text-[#9B6B9E]">Difficulty: {item.difficulty}</span>
                  </div>

                  <div className="flex gap-4 text-right">
                    <div>
                      <span className="text-[11px] text-[#A7A7A2] block">Score</span>
                      <span className="text-lg font-bold text-[#45B982]">{item.score ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#A7A7A2] block">Accuracy</span>
                      <span className="text-lg font-bold text-[#D8B24C]">{Math.round(item.accuracy ?? 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions Modal Overlay */}
      {selectedGameForInstructions && (
        <GameInstructions
          game={selectedGameForInstructions}
          onStart={handleStartGame}
          onClose={() => setSelectedGameForInstructions(null)}
          isStarting={isStartingSession}
        />
      )}
    </div>
  );
}
