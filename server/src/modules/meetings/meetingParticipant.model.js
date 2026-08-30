/**
 * meetingParticipant.model.js — Meeting Participant model schema
 *
 * Per DATABASE.md §23 (Meeting Participants Collection) and Prompt §8.
 * Tracks participants in a Meeting Circle.
 */

import mongoose from 'mongoose';

export const PARTICIPANT_ROLES = ['PATIENT', 'CAREGIVER', 'HOST', 'GUEST'];
export const PARTICIPANT_STATUSES = ['REGISTERED', 'JOINED', 'LEFT', 'REMOVED', 'BANNED'];

const meetingParticipantSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: [true, 'meetingId is required'],
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
      default: 'PATIENT',
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: PARTICIPANT_STATUSES,
        message: '{VALUE} is not a valid participant status',
      },
      default: 'REGISTERED',
    },
  },
  {
    timestamps: true,
    collection: 'meetingParticipants',
  }
);

// Indexes per DATABASE.md §23 & Prompt §44
meetingParticipantSchema.index({ meetingId: 1, userId: 1 }, { unique: true });
meetingParticipantSchema.index({ meetingId: 1, status: 1 });
meetingParticipantSchema.index({ userId: 1, joinedAt: -1 });

const MeetingParticipant = mongoose.model(
  'MeetingParticipant',
  meetingParticipantSchema
);

export default MeetingParticipant;
