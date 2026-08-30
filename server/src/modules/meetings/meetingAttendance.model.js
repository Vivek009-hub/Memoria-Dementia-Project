/**
 * meetingAttendance.model.js — Meeting Attendance model schema
 *
 * Per Prompt §24 & §44 (Attendance tracking).
 * Records specific attendance sessions and duration for users in meetings.
 */

import mongoose from 'mongoose';

const meetingAttendanceSchema = new mongoose.Schema(
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
      default: 'PATIENT',
    },
    joinedAt: {
      type: Date,
      required: [true, 'joinedAt is required'],
      default: Date.now,
    },
    leftAt: {
      type: Date,
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['JOINED', 'LEFT', 'REMOVED'],
      default: 'JOINED',
    },
  },
  {
    timestamps: true,
    collection: 'meetingAttendance',
  }
);

meetingAttendanceSchema.index({ meetingId: 1, userId: 1 });
meetingAttendanceSchema.index({ userId: 1, joinedAt: -1 });

const MeetingAttendance = mongoose.model(
  'MeetingAttendance',
  meetingAttendanceSchema
);

export default MeetingAttendance;
