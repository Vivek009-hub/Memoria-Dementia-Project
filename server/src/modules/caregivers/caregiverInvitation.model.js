import mongoose from 'mongoose';

const caregiverInvitationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    inviteCode: {
      type: String,
      required: [true, 'inviteCode is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    caregiverEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    relationshipType: {
      type: String,
      default: 'FAMILY',
      enum: ['FAMILY', 'PROFESSIONAL', 'GUARDIAN', 'OTHER'],
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
      default: 'PENDING',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'caregiverInvitations',
  }
);

caregiverInvitationSchema.index({ patientId: 1 });
caregiverInvitationSchema.index({ status: 1 });

const CaregiverInvitation = mongoose.model('CaregiverInvitation', caregiverInvitationSchema);

export default CaregiverInvitation;
