import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGames, fetchGameHistory } from '../../api/gamesApi.js';
import { GameCard } from '../../components/games/GameCard.jsx';
import { GameInstructions } from '../../components/games/GameInstructions.jsx';
import { startGameSession } from '../../api/gamesApi.js';

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
  const [error, setError] = useState(null);

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
      setError(null);
      const res = await fetchGames();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setGames(res.data);
      } else {
        setGames(DEFAULT_MOCK_GAMES);
      }
    } catch (err) {
      console.warn('Backend games API unavailable, falling back to mock catalog', err);
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
    } catch (err) {
      console.warn('Could not load game history', err);
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
      // Start session on B4 backend
      const sessionRes = await startGameSession(gameId, difficulty);
      const sessionId = sessionRes?.data?.id || sessionRes?.data?._id || sessionRes?.id || sessionRes?._id;

      // Navigate to play page with session context
      navigate(`/app/games/${gameId}`, {
        state: {
          game: selectedGameForInstructions,
          sessionId,
          difficulty,
        },
      });
    } catch (err) {
      console.warn('Session start API failed, using fallback session ID:', err);
      // If backend fails or fallback needed, navigate with fallback session ID
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
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 md:p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-5xl">🧠</span>
          <div>
            <h1 className="text-3xl md:text-4xl font-black">Cognitive Games</h1>
            <p className="text-blue-100 text-lg mt-1">Fun, relaxing exercises to stimulate your memory and mind</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('GAMES')}
          className={`py-3 px-6 rounded-2xl font-extrabold text-lg transition-all ${
            activeTab === 'GAMES'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          🎮 Available Games ({games.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`py-3 px-6 rounded-2xl font-extrabold text-lg transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          📜 My Progress History
        </button>
      </div>

      {activeTab === 'GAMES' ? (
        <>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['ALL', 'MEMORY_MATCHING', 'SEQUENCE', 'WORD_LANGUAGE', 'PICTURE_RECOGNITION'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-4 rounded-xl text-sm font-bold border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'All Activities' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-100 animate-pulse h-64 rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id || game._id} game={game} onPlay={handleSelectGame} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Completed Game Sessions</h2>
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-lg">
              No completed game sessions recorded yet. Play a game to see your scores here!
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id || item._id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block">
                      {new Date(item.completedAt || item.createdAt || item.startedAt).toLocaleDateString()}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      {item.game?.title || item.gameId?.title || 'Cognitive Exercise'}
                    </h4>
                    <span className="text-sm font-semibold text-blue-600">Difficulty: {item.difficulty}</span>
                  </div>

                  <div className="flex gap-4 text-right">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">Score</span>
                      <span className="text-xl font-black text-emerald-600">{item.score ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">Accuracy</span>
                      <span className="text-xl font-black text-blue-600">{Math.round(item.accuracy ?? 100)}%</span>
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
