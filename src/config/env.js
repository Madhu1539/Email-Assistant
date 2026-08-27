'use strict';

const dotenv = require('dotenv');

dotenv.config();

const REQUIRED_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL',
  'TOKEN_ENCRYPTION_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
];

// Optional — app starts without these; AI features degrade gracefully
const OPTIONAL_VARS = ['OPENROUTER_API_KEY', 'GEMINI_API_KEY'];

const OPTIONAL_VARS_WITH_DEFAULTS = {
  PORT:     '5000',
  NODE_ENV: 'development',
  GOOGLE_OAUTH_SCOPES: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
  ].join(' '),
};

function validateEnv() {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[CONFIG ERROR] Missing required environment variables:\n  ${missing.join('\n  ')}\n\nCopy .env.example to .env and fill in your values.`
    );
    process.exit(1);
  }

  // Validate TOKEN_ENCRYPTION_KEY format (must be exactly 64 hex chars = 32 bytes for AES-256)
  const tokenKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (!/^[0-9a-fA-F]{64}$/.test(tokenKey)) {
    console.error(
      '[CONFIG ERROR] TOKEN_ENCRYPTION_KEY must be exactly 64 hexadecimal characters (32 bytes).\n' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
    process.exit(1);
  }

  // Apply defaults for optional vars
  Object.entries(OPTIONAL_VARS_WITH_DEFAULTS).forEach(([key, defaultVal]) => {
    if (!process.env[key]) process.env[key] = defaultVal;
  });

  // Warn about missing optional AI keys (non-fatal)
  const missingOptional = OPTIONAL_VARS.filter(
    (k) => !process.env[k] || process.env[k].startsWith('REPLACE_WITH')
  );
  if (missingOptional.length > 0) {
    console.warn(
      `[CONFIG WARN] Optional AI keys not set: ${missingOptional.join(', ')}. AI features will be unavailable.`
    );
  }
}

validateEnv();

module.exports = {
  PORT:                  process.env.PORT,
  NODE_ENV:              process.env.NODE_ENV,
  MONGODB_URI:           process.env.MONGODB_URI,
  JWT_SECRET:            process.env.JWT_SECRET,
  CLIENT_URL:            process.env.CLIENT_URL,
  GOOGLE_CLIENT_ID:      process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET:  process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI:   process.env.GOOGLE_REDIRECT_URI,
  GOOGLE_OAUTH_SCOPES:   process.env.GOOGLE_OAUTH_SCOPES,
  TOKEN_ENCRYPTION_KEY:  process.env.TOKEN_ENCRYPTION_KEY,
  OPENROUTER_API_KEY:    process.env.OPENROUTER_API_KEY,
  GEMINI_API_KEY:        process.env.GEMINI_API_KEY,
};

