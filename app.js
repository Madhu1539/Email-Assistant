'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const { CLIENT_URL, NODE_ENV } = require('./src/config/env');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler } = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const healthRoutes = require('./src/routes/health.routes');
const gmailRoutes = require('./src/routes/gmail.routes');
const activityRoutes = require('./src/routes/activity.routes');
const emailRoutes = require('./src/routes/email.routes');
const aiRoutes = require('./src/routes/ai.routes');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Required for HttpOnly cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
if (NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      // Skip logging sensitive headers; Morgan logs method+url+status+time only
      skip: () => false,
    })
  );
}

// ─── General Rate Limiting ────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'The requested endpoint does not exist.',
      details: {},
    },
  });
});

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;
