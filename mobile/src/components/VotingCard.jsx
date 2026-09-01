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
    <div className="bg-memora-surface border border-memora-border hover:border-memora-accent/50 rounded-3xl p-5 shadow-lg transition-all flex flex-col justify-between space-y-4">
      <div>
        {/* Category Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-memora-accent/20 text-memora-accent text-xs font-extrabold rounded-full border border-memora-accent/30 uppercase">
            {proposal.category || 'COMMUNITY'}
          </span>

          <div className="flex items-center space-x-1 text-xs font-bold text-memora-text-muted bg-memora-surface-secondary px-2.5 py-1 rounded-lg border border-memora-border">
            <Users className="w-3.5 h-3.5 text-memora-accent" />
            <span>{proposal.voteCount || 0} interested</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-memora-text mb-2 line-clamp-2">
          {proposal.title}
        </h3>

        {/* Description */}
        {proposal.description && (
          <p className="text-sm text-memora-text-muted line-clamp-3 leading-relaxed">
            {proposal.description}
          </p>
        )}
      </div>

      {/* Vote Action Button */}
      <div className="pt-3 border-t border-memora-border flex items-center justify-between">
        <button
          onClick={handleVoteClick}
          disabled={voting}
          className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all touch-target-xl ${
            hasVoted
              ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/30'
              : 'bg-memora-accent hover:bg-memora-accent-bright text-memora-bg font-black shadow-lg'
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
