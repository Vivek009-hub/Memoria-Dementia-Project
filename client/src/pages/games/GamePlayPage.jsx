import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchGameById, startGameSession, submitGameSession } from '../../api/gamesApi.js';
import { GameHeader } from '../../components/games/GameHeader.jsx';
import { GameInstructions } from '../../components/games/GameInstructions.jsx';
import { GameResultSummary } from '../../components/games/GameResultSummary.jsx';
import { MemoryMatchEngine } from '../../components/games/engines/MemoryMatchEngine.jsx';
import { SequenceRecallEngine } from '../../components/games/engines/SequenceRecallEngine.jsx';
import { WordLanguageEngine } from '../../components/games/engines/WordLanguageEngine.jsx';
import { PictureRecognitionEngine } from '../../components/games/engines/PictureRecognitionEngine.jsx';

export function GamePlayPage() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [game, setGame] = useState(location.state?.game || null);
  const [sessionId, setSessionId] = useState(location.state?.sessionId || null);
  const [difficulty, setDifficulty] = useState(location.state?.difficulty || 'MEDIUM');

  const [gameState, setGameState] = useState(
    location.state?.sessionId ? 'PLAYING' : 'INSTRUCTIONS'
  ); // 'INSTRUCTIONS' | 'PLAYING' | 'SUMMARY'

  const [score, setScore] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [completedSession, setCompletedSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!game);

  useEffect(() => {
    if (!game && gameId) {
      loadGameDetails();
    }
  }, [gameId]);

  useEffect(() => {
    let timer;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  async function loadGameDetails() {
    try {
      setLoading(true);
      const res = await fetchGameById(gameId);
      if (res?.data) {
        setGame(res.data);
      }
    } catch (err) {
      console.warn('Could not load game details from backend', err);
    } finally {
      setLoading(false);
    }
  }

  const handleStartSession = async (selectedDiff) => {
    setDifficulty(selectedDiff);
    try {
      const sessionRes = await startGameSession(gameId, selectedDiff);
      const newSessionId = sessionRes?.data?.id || sessionRes?.data?._id || sessionRes?.id || sessionRes?._id;
      setSessionId(newSessionId);
    } catch (err) {
      console.warn('Could not start game session on backend:', err);
      setSessionId(`fallback_session_${Date.now()}`);
    } finally {
      setGameState('PLAYING');
      setTimerSeconds(0);
    }
  };

  const handleGameComplete = async (gameResults) => {
    setIsSubmitting(true);
    setScore(gameResults.score || 0);

    const payload = {
      score: gameResults.score || 0,
      accuracy: gameResults.accuracy ?? 100,
      responseTimeMs: gameResults.responseTimeMs || timerSeconds * 1000,
      mistakes: gameResults.mistakes || 0,
      hintsUsed: gameResults.hintsUsed || 0,
    };

    const isRealBackendSession =
      sessionId &&
      !sessionId.startsWith('mock_') &&
      !sessionId.startsWith('fallback_') &&
      !sessionId.startsWith('session_');

    try {
      if (isRealBackendSession) {
        const res = await submitGameSession(sessionId, payload);
        const savedData = res?.data || res;
        setCompletedSession({
          ...payload,
          id: savedData?.id || savedData?._id || sessionId,
          completedAt: savedData?.completedAt || new Date().toISOString(),
        });
      } else {
        setCompletedSession({
          ...payload,
          id: sessionId || `session_${Date.now()}`,
          completedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to submit completed game session to backend:', err);
      setCompletedSession({
        ...payload,
        id: sessionId || `session_${Date.now()}`,
        completedAt: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
      setGameState('SUMMARY');
    }
  };

  const renderGameEngine = () => {
    if (!game) return null;

    const category = game.category || 'MEMORY_MATCHING';

    switch (category) {
      case 'SEQUENCE':
        return <SequenceRecallEngine difficulty={difficulty} onComplete={handleGameComplete} />;

      case 'WORD_LANGUAGE':
        return <WordLanguageEngine difficulty={difficulty} onComplete={handleGameComplete} />;

      case 'PICTURE_RECOGNITION':
      case 'FAMILIAR_FACE':
        return <PictureRecognitionEngine difficulty={difficulty} onComplete={handleGameComplete} />;

      case 'MEMORY_MATCHING':
      default:
        return <MemoryMatchEngine difficulty={difficulty} onComplete={handleGameComplete} />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="animate-spin text-5xl mb-4">🧠</div>
        <p className="text-xl font-bold text-slate-700">Loading Game Session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {gameState === 'INSTRUCTIONS' && (
        <GameInstructions
          game={game}
          onStart={handleStartSession}
          onClose={() => navigate('/app/games')}
        />
      )}

      {gameState === 'PLAYING' && (
        <>
          <GameHeader
            title={game?.title || 'Cognitive Exercise'}
            score={score}
            timerSeconds={timerSeconds}
            onExit={() => navigate('/app/games')}
          />
          <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-200 shadow-md min-h-[400px] flex items-center justify-center">
            {renderGameEngine()}
          </div>
        </>
      )}

      {gameState === 'SUMMARY' && (
        <GameResultSummary
          session={completedSession}
          gameTitle={game?.title}
          onPlayAgain={() => {
            setGameState('INSTRUCTIONS');
            setScore(0);
            setTimerSeconds(0);
          }}
          onBackToLibrary={() => navigate('/app/games')}
        />
      )}
    </div>
  );
}
