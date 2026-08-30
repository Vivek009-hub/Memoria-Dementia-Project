/**
 * communityVote.model.js — Community Vote model schema
 *
 * Per DATABASE.md §19 (Community Votes Collection).
 * Stores patient votes for session proposals.
 */

import mongoose from 'mongoose';

const communityVoteSchema = new mongoose.Schema(
  {
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityProposal',
      required: [true, 'proposalId is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
  },
  {
    timestamps: true,
    collection: 'communityVotes',
  }
);

// Critical Constraint: Unique vote per patient per proposal
communityVoteSchema.index({ proposalId: 1, patientId: 1 }, { unique: true });
communityVoteSchema.index({ proposalId: 1, createdAt: -1 });
communityVoteSchema.index({ patientId: 1, createdAt: -1 });

const CommunityVote = mongoose.model('CommunityVote', communityVoteSchema);

export default CommunityVote;
