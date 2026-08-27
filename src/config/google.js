'use strict';

const { google } = require('googleapis');
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} = require('./env');

/**
 * Creates a new Google OAuth2 client instance.
 * Each request that needs OAuth should get a fresh client
 * so we never share token state across requests.
 */
function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Returns the Google OAuth2 consent URL.
 * @param {string} state - Cryptographically secure state string
 * @returns {string} Authorization URL
 */
function getAuthUrl(state) {
  const scopes = (process.env.GOOGLE_OAUTH_SCOPES || '').split(' ').filter(Boolean);
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',   // Required to get refresh_token
    prompt: 'consent',         // Force consent so refresh_token is always returned
    scope: scopes,
    state,
  });
}

module.exports = { createOAuth2Client, getAuthUrl };
