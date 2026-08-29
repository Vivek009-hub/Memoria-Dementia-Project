import mongoose from 'mongoose';

const RELATIONSHIP_TYPES = ['FAMILY', 'PROFESSIONAL', 'GUARDIAN', 'OTHER'];
const STATUSES = ['PENDING', 'ACTIVE', 'REVOKED'];

const caregiverRelationshipSchema = new mongoose.Schema(
  {
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'caregiverId is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    relationshipType: {
      type: String,
      required: [true, 'relationshipType is required'],
      enum: {
        values: RELATIONSHIP_TYPES,
        message: '{VALUE} is not a valid relationship type',
      },
    },
    permissions: {
      viewProfile: { type: Boolean, default: true },
      manageMemories: { type: Boolean, default: false },
      manageReminders: { type: Boolean, default: false },
      viewCognitiveActivity: { type: Boolean, default: false },
      viewLocation: { type: Boolean, default: false },
      manageGeofences: { type: Boolean, default: false },
      receiveSafetyAlerts: { type: Boolean, default: false },
      manageCommunityRegistration: { type: Boolean, default: false },
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: STATUSES,
        message: '{VALUE} is not a valid status',
      },
      default: 'PENDING',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'caregiverRelationships',
  }
);

// Indexes per DATABASE.md
caregiverRelationshipSchema.index({ caregiverId: 1 });
caregiverRelationshipSchema.index({ patientId: 1 });
caregiverRelationshipSchema.index({ status: 1 });

// Prevent duplicate active relationships for the same caregiver/patient pair
caregiverRelationshipSchema.index(
  { caregiverId: 1, patientId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['PENDING', 'ACTIVE'] } },
  }
);

const CaregiverRelationship = mongoose.model('CaregiverRelationship', caregiverRelationshipSchema);

export default CaregiverRelationship;
