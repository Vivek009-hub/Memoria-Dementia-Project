/**
 * communitySession.model.js — Community Session model schema
 *
 * Per DATABASE.md §20 (Community Sessions Collection).
 * Stores officially approved and scheduled community events.
 */

import mongoose from 'mongoose';
import { SESSION_TYPES } from './communityProposal.model.js';

export const MEETING_TYPES = ['VIDEO', 'VOICE'];
export const REGISTRATION_STATUSES = ['OPEN', 'CLOSED', 'FULL'];
export const SESSION_STATUSES = ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'];

const featuredPersonSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    designation: { type: String, trim: true, default: '' },
    imageUrl: { type: String, trim: true, default: null },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const communitySessionSchema = new mongoose.Schema(
  {
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityProposal',
      default: null,
    },
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
    sessionImageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'startTime is required'],
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
      default: null,
    },
    durationMinutes: {
      type: Number,
      min: [1, 'durationMinutes must be at least 1 minute'],
      default: 60,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'scheduledAt date is required'],
    },
    timezone: {
      type: String,
      required: [true, 'timezone is required'],
      default: 'Asia/Kolkata',
      trim: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    featuredPerson: {
      type: featuredPersonSchema,
      default: () => ({}),
    },
    maximumParticipants: {
      type: Number,
      required: [true, 'maximumParticipants is required'],
      min: [1, 'maximumParticipants must be at least 1'],
      default: 20,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    meetingType: {
      type: String,
      enum: {
        values: MEETING_TYPES,
        message: '{VALUE} is not a valid meeting type',
      },
      default: 'VIDEO',
    },
    meetingUrl: {
      type: String,
      trim: true,
      default: null,
    },
    registrationStatus: {
      type: String,
      enum: {
        values: REGISTRATION_STATUSES,
        message: '{VALUE} is not a valid registration status',
      },
      default: 'OPEN',
    },
    status: {
      type: String,
      enum: {
        values: SESSION_STATUSES,
        message: '{VALUE} is not a valid session status',
      },
      default: 'SCHEDULED',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
  },
  {
    timestamps: true,
    collection: 'communitySessions',
  }
);

// Indexes per DATABASE.md §20
communitySessionSchema.index({ status: 1, scheduledAt: 1 });
communitySessionSchema.index({ scheduledAt: 1 });
communitySessionSchema.index({ registrationStatus: 1 });
communitySessionSchema.index({ proposalId: 1 });

const CommunitySession = mongoose.model('CommunitySession', communitySessionSchema);

export default CommunitySession;
