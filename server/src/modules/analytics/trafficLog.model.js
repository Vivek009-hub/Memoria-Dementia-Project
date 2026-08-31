/**
 * trafficLog.model.js — MongoDB Schema for Basic Operational Traffic Monitoring
 */

import mongoose from 'mongoose';

const trafficLogSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
      uppercase: true,
    },
    statusCode: {
      type: Number,
      required: true,
    },
    responseTimeMs: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      expires: 2592000, // 30 days retention automatically via TTL index
    },
  },
  {
    timestamps: false,
    collection: 'traffic_logs',
  }
);

trafficLogSchema.index({ timestamp: -1 });
trafficLogSchema.index({ statusCode: 1 });

const TrafficLog = mongoose.model('TrafficLog', trafficLogSchema);

export default TrafficLog;
