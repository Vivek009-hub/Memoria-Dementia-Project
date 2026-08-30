/**
 * locationEvent.model.js — Location Event Mongoose model
 *
 * Per DATABASE.md §26 (Locations Collection).
 * Stores authorized patient location updates.
 */

import mongoose from 'mongoose';

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

const locationEventSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    latitude: {
      type: Number,
      required: [true, 'latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'longitude is required'],
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: 'MOBILE_APP',
      trim: true,
    },
    deviceId: {
      type: String,
      default: null,
      trim: true,
    },
    location: {
      type: geoPointSchema,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'locations',
  }
);

// Indexes per DATABASE.md §26
locationEventSchema.index({ patientId: 1, timestamp: -1 });
locationEventSchema.index({ location: '2dsphere' });

const LocationEvent = mongoose.model('LocationEvent', locationEventSchema);

export default LocationEvent;
