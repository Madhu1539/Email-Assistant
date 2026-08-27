'use strict';

const mongoose = require('mongoose');

const gmailAccountSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Enforces one Gmail account per user (BR-001)
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    provider: {
      type: String,
      required: true,
      default: 'google',
    },
    isConnected: {
      type: Boolean,
      required: true,
      default: false,
    },
    scopes: {
      type: [String],
      default: [],
    },
    // AES-256-GCM encrypted tokens — stored as iv:authTag:ciphertext strings
    encryptedAccessToken: {
      type: String,
      default: null,
      select: false, // Never returned by default — must be explicitly requested
    },
    encryptedRefreshToken: {
      type: String,
      default: null,
      select: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);



// Never return encrypted tokens in JSON output
gmailAccountSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.encryptedAccessToken;
    delete ret.encryptedRefreshToken;
    return ret;
  },
});

const GmailAccount = mongoose.model('GmailAccount', gmailAccountSchema);

module.exports = GmailAccount;
