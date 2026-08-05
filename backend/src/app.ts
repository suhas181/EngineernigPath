import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
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

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Base health checks
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    name: 'EngineerPath Backend API',
    status: 'online',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    healthCheck: '/health',
    endpoints: [
      '/api/auth',
      '/api/users',
      '/api/dashboard',
      '/api/roadmaps',
      '/api/resources',
      '/api/productivity',
      '/api/resume',
      '/api/admin',
    ]
  });
});

app.get(['/health', '/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/productivity', productivityRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
