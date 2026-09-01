import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      unique: true,
    },
    dateOfBirth: {
      type: Date,
    },
    preferredLanguage: {
      type: String,
      trim: true,
      default: 'en',
    },
    accessibilitySettings: {
      largeText: { type: Boolean, default: false },
      highContrast: { type: Boolean, default: false },
      voiceEnabled: { type: Boolean, default: true },
      reducedMotion: { type: Boolean, default: false },
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    safetySettings: {
      locationSharingEnabled: { type: Boolean, default: false },
      fallDetectionEnabled: { type: Boolean, default: false },
      sosEnabled: { type: Boolean, default: true },
    },
    companionSettings: {
      quietHours: {
        enabled: { type: Boolean, default: true },
        start: { type: String, default: '22:00' },
        end: { type: String, default: '07:00' },
      },
      interactionFrequency: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM',
      },
    },
  },
  {
    timestamps: true,
    collection: 'patientProfiles',
  }
);

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;
