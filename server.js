'use strict';

const { connectDB } = require('./src/config/db');
const { PORT } = require('./src/config/env');
const app = require('./app');

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[SERVER] Intelligent Email Assistant API running on port ${PORT}`);
    console.log(`[SERVER] Health: http://localhost:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Failed to start:', err.message);
  process.exit(1);
});
