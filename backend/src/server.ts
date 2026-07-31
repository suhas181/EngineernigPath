import path from 'path';
import dotenv from 'dotenv';
// Load environment variables before importing other modules that depend on them
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import app from './app';
import { connectDB } from './config/db';
import { initializeCronScheduler } from './services/cronScheduler';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize background link-health scheduler
  initializeCronScheduler();

  // Listen
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
