/**
 * PersonalizedRecommendationsCard.jsx — AI Game & Activity Recommendations Card
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Gamepad2, BookOpen, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import * as aiApi from '../api/ai.api.js';

export function PersonalizedRecommendationsCard({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getRecommendations();
      if (res.data) {
        setRecommendations(res.data);
      }
    } catch {
      setRecommendations({
        games: [
          { id: 'memory_match', title: 'Memory Match', category: 'Cognitive', difficulty: 'Easy' },
          { id: 'word_recall', title: 'Word Recall', category: 'Language', difficulty: 'Medium' },
        ],
        routine: 'Morning music therapy and memory review',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
            Picked For You Today
          </h3>
        </div>
        <button
          onClick={fetchRecs}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800 transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
          <span className="text-xs font-bold">Curating personalized activities...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations?.games && recommendations.games.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recommendations.games.map((game, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate && onNavigate('/app/analytics')}
                  className="p-3.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-2xl flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {game.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {game.category || 'Cognitive'} • {game.difficulty || 'Easy'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          )}

          {recommendations?.routine && (
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex items-center space-x-2 text-xs text-indigo-200">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{typeof recommendations.routine === 'string' ? recommendations.routine : 'Recommended daily routine ready'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
