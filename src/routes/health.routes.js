'use strict';

const { Router } = require('express');
const mongoose   = require('mongoose');

const router = Router();

// GET /api/health
// Used by Cloud Run readiness probes and load-balancer health checks.
router.get('/', (_req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState  = dbStates[mongoose.connection.readyState] || 'unknown';
  const isHealthy = dbState === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      status:    isHealthy ? 'ok' : 'degraded',
      db:        dbState,
      uptime:    Math.floor(process.uptime()),
      node:      process.version,
      env:       process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
