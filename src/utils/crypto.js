'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit IV for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag

/**
 * Returns the 32-byte encryption key from TOKEN_ENCRYPTION_KEY env var.
 * Supports hex-encoded (64 chars) or raw 32-byte strings.
 */
function getKey() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error('TOKEN_ENCRYPTION_KEY is not set.');

  if (raw.length === 64) {
    // Hex-encoded 32 bytes
    return Buffer.from(raw, 'hex');
  }
  if (raw.length === 32) {
    return Buffer.from(raw, 'utf8');
  }
  throw new Error(
    'TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes) or a 32-character string.'
  );
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a single colon-delimited string: iv:authTag:ciphertext (all hex-encoded).
 *
 * @param {string} plaintext
 * @returns {string} Encrypted value
 */
function encrypt(plaintext) {
  if (!plaintext) throw new Error('Cannot encrypt empty value.');
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a value that was encrypted with `encrypt()`.
 *
 * @param {string} encryptedValue - The colon-delimited iv:authTag:ciphertext string
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedValue) {
  if (!encryptedValue) throw new Error('Cannot decrypt empty value.');
  const parts = encryptedValue.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted value format.');

  const key = getKey();
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const ciphertext = Buffer.from(parts[2], 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
