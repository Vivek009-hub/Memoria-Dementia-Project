import mongoose from 'mongoose';

/**
 * FamilyMember Model — DATABASE.md §15
 *
 * Collection: familyMembers
 *
 * Stores familiar people who may be referenced by memories or cognitive activities.
 * A family member is NOT a Memora user — they are a named person in the patient's life.
 */

const familyMemberSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      maxlength: [100, 'name must be at most 100 characters'],
    },

    relationship: {
      type: String,
      trim: true,
      maxlength: [100, 'relationship must be at most 100 characters'],
      default: null,
    },

    photoUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'photoUrl must be at most 2048 characters'],
      default: null,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'description must be at most 2000 characters'],
      default: null,
    },

    language: {
      type: String,
      trim: true,
      maxlength: [10, 'language must be at most 10 characters'],
      default: 'en',
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
    collection: 'familyMembers',
  }
);

// Indexes per DATABASE.md §15
familyMemberSchema.index({ patientId: 1, relationship: 1 });
familyMemberSchema.index({ patientId: 1, isActive: 1 });

const FamilyMember =
  mongoose.models.FamilyMember || mongoose.model('FamilyMember', familyMemberSchema);

export default FamilyMember;
