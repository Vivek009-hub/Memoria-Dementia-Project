/**
 * VotingCard.jsx — Community Proposal Voting Card
 *
 * Displays session idea title, description, category, vote count, user vote status,
 * and one-tap Vote / Unvote button.
 */

import React, { useState } from 'react';
import { ThumbsUp, Users, Sparkles, Check } from 'lucide-react';

export function VotingCard({ proposal, onVote, onRemoveVote }) {
  const [voting, setVoting] = useState(false);

  const hasVoted = Boolean(proposal.hasVoted);

  const handleVoteClick = async (e) => {
    e.stopPropagation();
    if (voting) return;
    setVoting(true);
    try {
      if (hasVoted) {
        await onRemoveVote(proposal._id);
      } else {
        await onVote(proposal._id);
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-5 shadow-lg transition-all flex flex-col justify-between space-y-4">
      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-extrabold rounded-full border border-purple-500/30 uppercase">
            {proposal.category || 'COMMUNITY'}
          </span>

          <div className="flex items-center space-x-1 text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{proposal.voteCount || 0} interested</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
          {proposal.title}
        </h3>

        {/* Description */}
        {proposal.description && (
          <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
            {proposal.description}
          </p>
        )}
      </div>

      {/* Vote Action Button */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={handleVoteClick}
          disabled={voting}
          className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all touch-target-xl ${
            hasVoted
              ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
          }`}
        >
          {hasVoted ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>✓ You Voted (Tap to Undo)</span>
            </>
          ) : (
            <>
              <ThumbsUp className="w-4 h-4" />
              <span>{voting ? 'Recording Vote...' : 'Vote for this Session'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
