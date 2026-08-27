'use strict';

const GmailAccount = require('../models/GmailAccount');
const EmailActivity = require('../models/EmailActivity');
const { encrypt, decrypt } = require('../utils/crypto');
const { createOAuth2Client, getAuthUrl } = require('../config/google');
const { generateOAuthState, validateOAuthState } = require('../utils/oauthState');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Initiates the Gmail OAuth flow.
 * Generates secure state, returns the Google consent URL.
 *
 * @param {string} userId
 * @returns {string} Google OAuth consent URL
 */
function startOAuthFlow(userId) {
  const state = generateOAuthState(userId);
  return getAuthUrl(state);
}

/**
 * Handles the OAuth callback from Google.
 * Validates state, exchanges code, encrypts and stores tokens.
 *
 * @param {string} code  - Authorization code from Google
 * @param {string} state - State string from Google
 * @returns {Promise<void>}
 */
async function handleOAuthCallback(code, state) {
  // Validate state — throws OAUTH_STATE_INVALID if invalid/expired
  const { userId } = validateOAuthState(state);

  const oauth2Client = createOAuth2Client();
  let tokens;
  try {
    const response = await oauth2Client.getToken(code);
    tokens = response.tokens;
  } catch (err) {
    logger.error('OAuth token exchange failed', { message: err.message });
    throw createError('OAUTH_ERROR', 'Failed to exchange authorization code. Please try again.');
  }

  const { access_token, refresh_token, expiry_date, scope } = tokens;

  if (!access_token) {
    throw createError('OAUTH_ERROR', 'No access token received from Google.');
  }

  // Get the Gmail address from the token info
  oauth2Client.setCredentials(tokens);
  let gmailEmail = '';
  try {
    const { google } = require('googleapis');
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const info = await oauth2.userinfo.get();
    gmailEmail = info.data.email || '';
  } catch (err) {
    logger.warn('Could not fetch Gmail userinfo', { message: err.message });
  }

  // Encrypt tokens before storage
  const encryptedAccessToken  = encrypt(access_token);
  const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;

  // Upsert GmailAccount — handles both first-connect and reconnect
  await GmailAccount.findOneAndUpdate(
    { owner: userId },
    {
      owner: userId,
      email: gmailEmail,
      provider: 'google',
      isConnected: true,
      scopes: scope ? scope.split(' ') : [],
      encryptedAccessToken,
      ...(encryptedRefreshToken && { encryptedRefreshToken }),
      expiresAt: expiry_date ? new Date(expiry_date) : null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Record activity
  await EmailActivity.create({
    owner: userId,
    type: 'gmail_connected',
    status: 'success',
    message: `Gmail connected: ${gmailEmail}`,
  });

  logger.info('Gmail OAuth completed', { userId, email: gmailEmail });
}

/**
 * Returns the Gmail connection status for a user.
 * @param {string} userId
 * @returns {Promise<{ isConnected: boolean, email: string|null }>}
 */
async function getGmailStatus(userId) {
  const account = await GmailAccount.findOne({ owner: userId });
  if (!account) return { isConnected: false, email: null };
  return { isConnected: account.isConnected, email: account.email };
}

/**
 * Disconnects Gmail for a user.
 * Revokes the access token with Google (best-effort), clears tokens, marks disconnected.
 *
 * @param {string} userId
 */
async function disconnectGmail(userId) {
  const account = await GmailAccount.findOne({ owner: userId }).select(
    '+encryptedAccessToken +encryptedRefreshToken'
  );

  if (!account) return;

  // Best-effort revocation with Google
  if (account.encryptedAccessToken) {
    try {
      const oauth2Client = createOAuth2Client();
      const accessToken = decrypt(account.encryptedAccessToken);
      await oauth2Client.revokeToken(accessToken);
      logger.info('Gmail token revoked', { userId });
    } catch (err) {
      // Revocation failure is non-fatal — proceed with local disconnect
      logger.warn('Token revocation failed (non-fatal)', { message: err.message });
    }
  }

  // Clear tokens and mark disconnected
  await GmailAccount.findOneAndUpdate(
    { owner: userId },
    {
      isConnected: false,
      encryptedAccessToken: null,
      encryptedRefreshToken: null,
      expiresAt: null,
    }
  );

  await EmailActivity.create({
    owner: userId,
    type: 'gmail_disconnected',
    status: 'success',
    message: 'Gmail disconnected.',
  });

  logger.info('Gmail disconnected', { userId });
}

/**
 * Returns a configured OAuth2 client with valid (possibly refreshed) tokens for a user.
 * Handles automatic token refresh if the access token is expired.
 * Throws GMAIL_AUTH_EXPIRED if refresh fails.
 *
 * @param {string} userId
 * @returns {Promise<import('googleapis').Auth.OAuth2Client>}
 */
async function getAuthenticatedClient(userId) {
  const account = await GmailAccount.findOne({ owner: userId }).select(
    '+encryptedAccessToken +encryptedRefreshToken'
  );

  if (!account || !account.isConnected) {
    throw createError('GMAIL_NOT_CONNECTED', 'Gmail is not connected. Please connect your Gmail account.');
  }

  if (!account.encryptedAccessToken) {
    throw createError('GMAIL_AUTH_EXPIRED', 'Gmail credentials are missing. Please reconnect your Gmail account.');
  }

  const oauth2Client = createOAuth2Client();

  const accessToken  = decrypt(account.encryptedAccessToken);
  const refreshToken = account.encryptedRefreshToken
    ? decrypt(account.encryptedRefreshToken)
    : null;

  oauth2Client.setCredentials({
    access_token:  accessToken,
    refresh_token: refreshToken,
    expiry_date:   account.expiresAt ? account.expiresAt.getTime() : null,
  });

  // Listen for token refresh events and persist updated tokens
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      const updates = {};
      if (newTokens.access_token) {
        updates.encryptedAccessToken = encrypt(newTokens.access_token);
      }
      if (newTokens.refresh_token) {
        updates.encryptedRefreshToken = encrypt(newTokens.refresh_token);
      }
      if (newTokens.expiry_date) {
        updates.expiresAt = new Date(newTokens.expiry_date);
      }
      if (Object.keys(updates).length > 0) {
        await GmailAccount.findOneAndUpdate({ owner: userId }, updates);
        logger.info('Gmail tokens refreshed and persisted', { userId });
      }
    } catch (err) {
      logger.error('Failed to persist refreshed tokens', { message: err.message });
    }
  });

  // If token is expired, trigger refresh now
  const isExpired = account.expiresAt && account.expiresAt.getTime() < Date.now();
  if (isExpired && refreshToken) {
    try {
      await oauth2Client.refreshAccessToken();
    } catch (err) {
      logger.error('Gmail token refresh failed', { message: err.message });
      // Mark as disconnected — BR-017, BR-018
      await GmailAccount.findOneAndUpdate(
        { owner: userId },
        { isConnected: false, encryptedAccessToken: null }
      );
      throw createError(
        'GMAIL_AUTH_EXPIRED',
        'Gmail authorization has expired. Please reconnect your Gmail account.'
      );
    }
  }

  return oauth2Client;
}

module.exports = {
  startOAuthFlow,
  handleOAuthCallback,
  getGmailStatus,
  disconnectGmail,
  getAuthenticatedClient,
};
