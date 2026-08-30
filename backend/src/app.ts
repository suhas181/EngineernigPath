import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { errorHandler } from './middlewares/errorHandler';

// Import Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import roadmapRoutes from './routes/roadmapRoutes';
import resourceRoutes from './routes/resourceRoutes';
import productivityRoutes from './routes/productivityRoutes';
import resumeRoutes from './routes/resumeRoutes';
import adminRoutes from './routes/adminRoutes';
import internshipRoutes from './routes/internshipRoutes';

const app = express();

// ── 1. Security Headers ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// ── 2. CORS Configuration ───────────────────────────────────────────────────
const isAllowedOrigin = (origin: string): boolean => {
  const customOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const frontendUrl = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
  const configured = [...customOrigins];
  if (frontendUrl) {
    configured.push(frontendUrl);
  }

  const cleanOrigin = origin.trim().replace(/\/+$/, '');

  // 1. Direct configured origin match (from FRONTEND_URL or ALLOWED_ORIGINS)
  if (configured.includes(cleanOrigin)) {
    return true;
  }

  // 2. Localhost match (in non-production or for local development/testing)
  const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);
  if (process.env.NODE_ENV !== 'production' && isLocalhost) {
    return true;
  }

  // 3. Vercel deployment domains (*.vercel.app for EngineerPath production & preview branches)
  const isVercelDomain =
    /^https:\/\/([a-zA-Z0-9_-]+\.)?vercel\.app$/.test(cleanOrigin) ||
    /^https:\/\/engineernig-path.*\.vercel\.app$/.test(cleanOrigin) ||
    /^https:\/\/engineerpath.*\.vercel\.app$/.test(cleanOrigin);
  if (isVercelDomain) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);

      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Rejected request from unauthorized origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-cron-secret',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
  })
);

// ── 3. Request Parsers ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static uploads directory (used in local development)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── 4. Rate Limiting ────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per window
  message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // 600 requests per 15 minutes
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

// ── 5. Health, Liveness & Readiness Probes ───────────────────────────────────
app.get(['/', '/api'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    name: 'EngineerPath Backend API',
    status: isDbConnected ? 'online' : 'degraded',
    environment: process.env.NODE_ENV || 'development',
    database: isDbConnected ? 'connected' : 'disconnected',
    livenessProbe: '/health/live',
    readinessProbe: '/health/ready',
    healthCheck: '/health',
  });
});

// Liveness Probe (process is alive and accepting traffic)
app.get(['/health/live', '/api/health/live'], (req, res) => {
  res.status(200).json({
    status: 'live',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Readiness Probe (all critical dependencies like MongoDB are connected)
app.get(['/health/ready', '/api/health/ready'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isReady = isDbConnected;
  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Full Health Check (Liveness + Dependency Health)
app.get(['/health', '/api/health'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const status = isDbConnected ? 'healthy' : 'unhealthy';
  const statusCode = isDbConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    checks: {
      liveness: 'ok',
      database: isDbConnected ? 'connected' : 'disconnected',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// ── 6. API Routes ───────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/productivity', productivityRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/internships', internshipRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
