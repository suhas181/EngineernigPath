import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler } from './middlewares/errorHandler';

// Import Passport config
import './config/passport';

// Import Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import roadmapRoutes from './routes/roadmapRoutes';
import resourceRoutes from './routes/resourceRoutes';
import productivityRoutes from './routes/productivityRoutes';
import resumeRoutes from './routes/resumeRoutes';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

// Base health check
app.get('/health', (req, res) => {
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

// Global Error Handler
app.use(errorHandler);

export default app;
