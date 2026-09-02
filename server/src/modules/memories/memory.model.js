import mongoose from 'mongoose';

/**
 * Memory Model — DATABASE.md §14
 *
 * Collection: memories
 *
 * Stores personalized memory content for patients.
 * Media is referenced by URL only — binary storage is out of scope for B5.
 */

const MEMORY_TYPES = ['PHOTO', 'PERSON', 'PLACE', 'STORY', 'EVENT', 'OBJECT'];

const memorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [200, 'title must be at most 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'description must be at most 5000 characters'],
      default: null,
    },

    type: {
      type: String,
      required: [true, 'type is required'],
      enum: {
        values: MEMORY_TYPES,
        message: '{VALUE} is not a valid memory type',
      },
    },

    mediaUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'mediaUrl must be at most 2048 characters'],
      default: null,
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'thumbnailUrl must be at most 2048 characters'],
      default: null,
    },

    audioUrl: {
      type: String,
      trim: true,
      maxlength: [2048, 'audioUrl must be at most 2048 characters'],
      default: null,
    },

    audioDuration: {
      type: Number,
      default: 0,
    },

    audioMimeType: {
      type: String,
      trim: true,
      default: null,
    },

    voiceNote: {
      type: {
        audioUrl: { type: String, trim: true, default: null },
        path: { type: String, trim: true, default: null },
        mimeType: { type: String, trim: true, default: null },
        duration: { type: Number, default: 0 },
      },
      default: null,
    },

    relatedPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      default: null,
    },

    relatedPlace: {
      type: String,
      trim: true,
      maxlength: [300, 'relatedPlace must be at most 300 characters'],
      default: null,
    },

    importantDate: {
      type: Date,
      default: null,
    },

    datePrecision: {
      type: String,
      enum: {
        values: ['exact', 'month', 'year', 'unknown'],
        message: '{VALUE} is not a valid date precision',
      },
      default: 'exact',
    },

    language: {
      type: String,
      trim: true,
      maxlength: [10, 'language must be at most 10 characters'],
      default: 'en',
    },

    tags: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'tags must contain at most 20 items',
      },
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'memories',
  }
);

// Indexes per DATABASE.md §14
memorySchema.index({ patientId: 1, type: 1 });
memorySchema.index({ patientId: 1, importantDate: 1 });
memorySchema.index({ patientId: 1, isActive: 1 });
memorySchema.index({ patientId: 1, createdAt: -1 });

const Memory = mongoose.models.Memory || mongoose.model('Memory', memorySchema);

export { MEMORY_TYPES };
export default Memory;
