import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import {
  signup,
  verifyEmail,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { User } from '../models/User';
import { protect } from '../middlewares/auth';

const router = Router();

// Email/Password Auth routes
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get(
  '/google',
  (req: Request, res: Response, next: NextFunction) => {
    const googleId = process.env.GOOGLE_CLIENT_ID;
    const isMock = !googleId || googleId.startsWith('your-google-client') || googleId === 'mock-google-client-id';

    if (isMock) {
      res.redirect(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/google/mock-callback`);
    } else {
      passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
    }
  }
);

router.get(
  '/google/mock-callback',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mockEmail = 'mockgoogleuser@example.com';
      let user = await User.findOne({ email: mockEmail });

      if (!user) {
        user = await User.create({
          name: 'Mock Google User',
          email: mockEmail,
          googleId: 'mock-google-id-12345',
          isVerified: true,
          profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
        });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      user.refreshToken = refreshToken;
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`, 
    session: false 
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      if (!user) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
