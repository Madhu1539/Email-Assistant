'use strict';

const mongoose = require('mongoose');

const ACTIVITY_TYPES = [
  'gmail_connected',
  'gmail_disconnected',
  'email_sent',
  'email_replied',
  'email_deleted',
  'email_archived',
  'email_starred',
  'email_unstarred',
  'email_read',
  'email_unread',
  'ai_summarize',
  'ai_reply',
  'login',
  'logout',
  'registration',
  'error',
];

const emailActivitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
      default: 'success',
    },
    emailId: {
      type: String,
      default: null,
    },
    threadId: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      default: '',
      maxlength: 500,
    },
    // Safe, non-sensitive additional context
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only createdAt needed
  }
);

// Indexes for efficient owner-scoped queries
emailActivitySchema.index({ owner: 1, createdAt: -1 });
emailActivitySchema.index({ owner: 1, emailId: 1, createdAt: -1 });

const EmailActivity = mongoose.model('EmailActivity', emailActivitySchema);

module.exports = EmailActivity;
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
