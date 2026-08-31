/**
 * meetingCircle.model.js — Meeting Circle Mongoose Schema
 *
 * Stores Meeting Circles (patient-created and discoverable small-group video circles).
 * Capacity is strictly locked to max 6 participants.
 */

import mongoose from 'mongoose';

export const CIRCLE_VISIBILITIES = ['DISCOVERABLE', 'INVITE_ONLY'];
export const CIRCLE_STATUSES = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

const meetingCircleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Circle name is required'],
      trim: true,
      maxlength: [150, 'Circle name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'creatorId is required'],
    },
    visibility: {
      type: String,
      enum: {
        values: CIRCLE_VISIBILITIES,
        message: '{VALUE} is not a valid circle visibility',
      },
      default: 'DISCOVERABLE',
    },
    maxParticipants: {
      type: Number,
      default: 6,
      min: [1, 'Maximum participants must be at least 1'],
      max: [6, 'Maximum participants cannot exceed 6'],
    },
    activeParticipantCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
    status: {
      type: String,
      enum: {
        values: CIRCLE_STATUSES,
        message: '{VALUE} is not a valid circle status',
      },
      default: 'OPEN',
    },
    provider: {
      type: String,
      trim: true,
      default: 'daily',
    },
    providerRoomName: {
      type: String,
      trim: true,
      default: null,
    },
    providerRoomUrl: {
      type: String,
      trim: true,
      default: null,
    },
    invitedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'meeting_circles',
  }
);

// Indexes
meetingCircleSchema.index({ creatorId: 1 });
meetingCircleSchema.index({ visibility: 1, status: 1 });
meetingCircleSchema.index({ providerRoomName: 1 });

const MeetingCircle = mongoose.model('MeetingCircle', meetingCircleSchema);

export default MeetingCircle;
