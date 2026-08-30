/**
 * aiConversation.model.js — AI Conversation model schema
 *
 * Stores persistent chat session history for Memora conversational assistant.
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    sources: [
      {
        memoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory' },
        title: String,
        type: String,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      default: 'Conversation',
      trim: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
    collection: 'aiConversations',
  }
);

aiConversationSchema.index({ userId: 1, updatedAt: -1 });

const AIConversation = mongoose.model('AIConversation', aiConversationSchema);

export default AIConversation;
