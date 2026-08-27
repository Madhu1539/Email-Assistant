'use strict';

const mongoose = require('mongoose');

const AI_OPERATIONS = ['summarize', 'generate_reply'];
const AI_STATUSES   = ['success', 'failure', 'timeout'];
const AI_PROVIDERS  = ['openrouter', 'gemini'];

const aiSessionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    operation: {
      type: String,
      enum: AI_OPERATIONS,
      required: true,
    },
    emailId: {
      type: String,
      required: true,
    },
    threadId: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: AI_PROVIDERS,
      required: true,
    },
    status: {
      type: String,
      enum: AI_STATUSES,
      required: true,
    },
    errorCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

aiSessionSchema.index({ owner: 1, createdAt: -1 });

const AISession = mongoose.model('AISession', aiSessionSchema);

module.exports = AISession;
