/**
 * communityProposal.model.js — Community Proposal model schema
 *
 * Per DATABASE.md §18 (Community Proposals Collection).
 * Stores session ideas that patients can vote on before they are scheduled.
 */

import mongoose from 'mongoose';

export const SESSION_TYPES = [
  'MUSIC',
  'STORY_SHARING',
  'ART',
  'EXERCISE',
  'MEMORY',
  'EDUCATIONAL',
  'SOCIAL',
  'OTHER',
];

export const PROPOSAL_STATUSES = [
  'DRAFT',
  'VOTING',
  'APPROVED',
  'REJECTED',
  'CLOSED',
  'CONVERTED_TO_SESSION',
];

const communityProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [200, 'title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'description cannot exceed 2000 characters'],
      default: '',
    },
    sessionType: {
      type: String,
      enum: {
        values: SESSION_TYPES,
        message: '{VALUE} is not a valid session type',
      },
      default: 'OTHER',
    },
    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: PROPOSAL_STATUSES,
        message: '{VALUE} is not a valid proposal status',
      },
      default: 'DRAFT',
    },
    votingStartsAt: {
      type: Date,
      default: null,
    },
    votingEndsAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    communitySessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunitySession',
      default: null,
    },
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'communityProposals',
  }
);

// Indexes per DATABASE.md §18 & B7 requirements
communityProposalSchema.index({ status: 1, votingEndsAt: 1 });
communityProposalSchema.index({ createdBy: 1, createdAt: -1 });

const CommunityProposal = mongoose.model('CommunityProposal', communityProposalSchema);

export default CommunityProposal;
