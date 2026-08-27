'use strict';

const dns = require('dns');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

// Set reliable DNS servers for MongoDB Atlas SRV record resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB ERROR] MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected.');
  isConnected = false;
});

mongoose.connection.on('reconnected', () => {
  console.log('[DB] MongoDB reconnected.');
  isConnected = true;
});

module.exports = { connectDB };
