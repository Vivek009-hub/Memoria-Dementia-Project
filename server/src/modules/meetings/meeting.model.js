/**
 * meeting.model.js — Meeting model schema
 *
 * Per DATABASE.md §22 (Meetings Collection) and Prompt §5, §6, §7.
 * Stores Meeting Circle sessions for Community Sessions.
 */

import mongoose from 'mongoose';

export const MEETING_TYPES = ['VIDEO', 'VOICE'];
export const MEETING_STATUSES = [
  'SCHEDULED',
  'READY',
  'LIVE',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
];

const meetingSchema = new mongoose.Schema(
  {
    communitySessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunitySession',
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
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'hostId is required'],
    },
    scheduledAt: {
      type: Date,
      required: [true, 'scheduledAt is required'],
    },
    startAt: {
      type: Date,
      default: null,
    },
    endAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
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
    maximumParticipants: {
      type: Number,
      required: [true, 'maximumParticipants is required'],
      min: [1, 'maximumParticipants must be at least 1'],
      default: 20,
    },
    activeParticipantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: MEETING_STATUSES,
        message: '{VALUE} is not a valid meeting status',
      },
      default: 'SCHEDULED',
    },
    provider: {
      type: String,
      trim: true,
      default: 'mock',
    },
    providerMeetingId: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
  },
  {
    timestamps: true,
    collection: 'meetings',
  }
);

// Indexes per DATABASE.md §22 & §33 and Prompt §44
meetingSchema.index({ communitySessionId: 1 });
meetingSchema.index({ status: 1, scheduledAt: 1 });
meetingSchema.index({ providerMeetingId: 1 });
meetingSchema.index({ hostId: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
