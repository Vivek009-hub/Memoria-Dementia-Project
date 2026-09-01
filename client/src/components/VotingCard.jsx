/**
 * VotingCard.jsx — Community Proposal Voting Card
 */

import React, { useState } from 'react';
import { ThumbsUp, Users, Check } from 'lucide-react';

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
    <div className="bg-[#202020] border border-[#343434] hover:border-[#D8B24C]/60 rounded-xl p-5 shadow-xs transition-all duration-200 flex flex-col justify-between space-y-4 group">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2.5 py-0.5 bg-[#E8688A]/15 text-[#E8688A] text-xs font-semibold rounded-md border border-[#E8688A]/30 uppercase">
            {proposal.category || 'COMMUNITY'}
          </span>

          <div className="flex items-center space-x-1 text-xs font-medium text-[#A7A7A2] bg-[#151515] px-2.5 py-1 rounded-md border border-[#343434]">
            <Users className="w-3.5 h-3.5 text-[#D8B24C]" />
            <span>{proposal.voteCount || 0} interested</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-[#F5F5F0] group-hover:text-[#D8B24C] transition-colors mb-2 line-clamp-2">
          {proposal.title}
        </h3>

        {proposal.description && (
          <p className="text-xs text-[#A7A7A2] line-clamp-3 leading-relaxed">
            {proposal.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[#343434] flex items-center justify-between">
        <button
          onClick={handleVoteClick}
          disabled={voting}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 transition-all touch-target ${
            hasVoted
              ? 'bg-[#45B982]/15 border border-[#45B982]/40 text-[#45B982] hover:bg-[#45B982]/25'
              : 'bg-[#D8B24C] hover:bg-[#F0C75E] text-[#151515] shadow-xs'
          }`}
        >
          {hasVoted ? (
            <>
              <Check className="w-4 h-4 text-[#45B982]" />
              <span>Voted (Tap to Undo)</span>
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
