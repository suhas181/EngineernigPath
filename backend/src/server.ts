import path from 'path';
import dotenv from 'dotenv';
// Load environment variables before importing other modules that depend on them
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import app from './app';
import { connectDB } from './config/db';
import { initializeCronScheduler } from './services/cronScheduler';
import { validateJwtEnvironment } from './utils/jwt';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Validate critical security environment variables
  validateJwtEnvironment();

  // Connect to Database
  await connectDB();

  // Initialize background link-health scheduler
  initializeCronScheduler();

  // Listen on 0.0.0.0 to accept requests from both IPv4 and IPv6 localhost
  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });

  // Graceful shutdown handling for container termination (Render / Docker / Kubernetes)
  const shutdown = async (signal: string) => {
    console.log(`[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('[SHUTDOWN] HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('[SHUTDOWN] MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('[SHUTDOWN] Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

    // Force exit if shutdown hangs after 10s
    setTimeout(() => {
      console.error('[SHUTDOWN] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Global uncaught exception handler
  process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err.message || err);
    shutdown('uncaughtException');
  });

  // Global unhandled promise rejection handler
  process.on('unhandledRejection', (reason: any) => {
    console.error('[FATAL] Unhandled Rejection:', reason?.message || reason);
  });
};

startServer();
