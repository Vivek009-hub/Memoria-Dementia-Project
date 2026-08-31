/**
 * meetingCircleParticipant.model.js — Meeting Circle Participant Schema
 *
 * Tracks individual participant membership and active status inside Meeting Circles.
 */

import mongoose from 'mongoose';

export const PARTICIPANT_ROLES = ['HOST', 'PARTICIPANT'];
export const PARTICIPANT_STATUSES = ['ACTIVE', 'LEFT'];

const meetingCircleParticipantSchema = new mongoose.Schema(
  {
    circleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MeetingCircle',
      required: [true, 'circleId is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    role: {
      type: String,
      enum: {
        values: PARTICIPANT_ROLES,
        message: '{VALUE} is not a valid participant role',
      },
      default: 'PARTICIPANT',
    },
    status: {
      type: String,
      enum: {
        values: PARTICIPANT_STATUSES,
        message: '{VALUE} is not a valid participant status',
      },
      default: 'ACTIVE',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'meeting_circle_participants',
  }
);

// Compound index to ensure uniqueness per active circle join
meetingCircleParticipantSchema.index({ circleId: 1, userId: 1 });
meetingCircleParticipantSchema.index({ circleId: 1, status: 1 });

const MeetingCircleParticipant = mongoose.model(
  'MeetingCircleParticipant',
  meetingCircleParticipantSchema
);

export default MeetingCircleParticipant;
