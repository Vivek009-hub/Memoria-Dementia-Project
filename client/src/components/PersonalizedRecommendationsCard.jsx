/**
 * PersonalizedRecommendationsCard.jsx — AI Game & Activity Recommendations Card
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Gamepad2, Clock, RefreshCw, ChevronRight } from 'lucide-react';
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
          { id: 'memory_match', title: 'Memory Match Cards', category: 'Cognitive', difficulty: 'Easy', route: '/app/games' },
          { id: 'word_recall', title: 'Daily Word Recall', category: 'Language', difficulty: 'Medium', route: '/app/games' },
        ],
        routine: 'Morning music therapy and memory photo review',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  return (
    <div className="bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-5 shadow-xs space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#D8B24C]">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h3 className="text-base font-semibold text-[#F5F5F0] tracking-tight">
            Picked For You Today
          </h3>
        </div>
        <button
          onClick={fetchRecs}
          className="p-1.5 text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg bg-[#151515] border border-[#343434] transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D8B24C]' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-[#A7A7A2]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D8B24C]" />
          <span className="text-xs font-medium">Curating personalized activities...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations?.games && recommendations.games.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recommendations.games.map((game, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate && onNavigate(game.route || '/app/games')}
                  className="p-3 bg-[#151515] border border-[#343434] hover:border-[#D8B24C]/60 rounded-lg flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#D8B24C]/10 text-[#D8B24C] rounded-lg border border-[#D8B24C]/30">
                      <Gamepad2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors">
                        {game.title}
                      </h4>
                      <span className="text-[10px] text-[#74746F] font-medium">
                        {game.category || 'Cognitive'} &bull; {game.difficulty || 'Easy'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#74746F] group-hover:text-[#D8B24C] group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          )}

          {recommendations?.routine && (
            <div className="p-3 bg-[#151515] border border-[#343434] rounded-lg flex items-center space-x-2.5 text-xs text-[#A7A7A2]">
              <Clock className="w-4 h-4 text-[#D8B24C] shrink-0" />
              <span>{typeof recommendations.routine === 'string' ? recommendations.routine : 'Recommended daily routine ready'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
