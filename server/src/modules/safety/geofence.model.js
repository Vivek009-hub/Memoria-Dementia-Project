/**
 * geofence.model.js — Geofence Mongoose model
 *
 * Per DATABASE.md §27 (Geofences Collection).
 * Stores configured safe zones for patient monitoring.
 */

import mongoose from 'mongoose';

export const GEOFENCE_STATES = ['INSIDE', 'OUTSIDE', 'UNKNOWN'];

const geoPointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false }
);

const geofenceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      maxlength: [100, 'name cannot exceed 100 characters'],
    },
    center: {
      type: geoPointSchema,
      required: true,
    },
    centerLatitude: {
      type: Number,
      required: [true, 'centerLatitude is required'],
      min: -90,
      max: 90,
    },
    centerLongitude: {
      type: Number,
      required: [true, 'centerLongitude is required'],
      min: -180,
      max: 180,
    },
    radiusMeters: {
      type: Number,
      required: [true, 'radiusMeters is required'],
      min: [10, 'radiusMeters must be at least 10 meters'],
      max: [100000, 'radiusMeters cannot exceed 100,000 meters'],
      default: 100,
    },
    currentState: {
      type: String,
      enum: {
        values: GEOFENCE_STATES,
        message: '{VALUE} is not a valid geofence state',
      },
      default: 'UNKNOWN',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
  },
  {
    timestamps: true,
    collection: 'geofences',
  }
);

// Indexes per DATABASE.md §27
geofenceSchema.index({ patientId: 1, isActive: 1 });
geofenceSchema.index({ center: '2dsphere' });

const Geofence = mongoose.model('Geofence', geofenceSchema);

export default Geofence;
