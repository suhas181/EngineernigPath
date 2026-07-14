import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/mailService';
import { AuthenticatedRequest } from '../types';

// Serializer to normalize user objects returned by auth APIs
const serializeUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  college: user.college,
  branch: user.branch,
  cgpa: user.cgpa,
  graduationYear: user.graduationYear,
  currentSemester: user.currentSemester,
  preferredCareer: user.preferredCareer,
  skills: user.skills,
  interests: user.interests,
  linkedinUrl: user.linkedinUrl,
  githubUrl: user.githubUrl,
  profileImage: user.profileImage,
  dreamCompany: user.dreamCompany,
  dailyStudyHours: user.dailyStudyHours,
  programmingLanguages: user.programmingLanguages,
  frameworks: user.frameworks,
  leetcodeEasyCount: user.leetcodeEasyCount,
  leetcodeMediumCount: user.leetcodeMediumCount,
  leetcodeHardCount: user.leetcodeHardCount,
  dsaLevel: user.dsaLevel,
  frontendLevel: user.frontendLevel,
  backendLevel: user.backendLevel,
  databaseLevel: user.databaseLevel,
  csFundamentalsLevel: user.csFundamentalsLevel,
  aptitudeLevel: user.aptitudeLevel,
  communicationLevel: user.communicationLevel,
  careerGoal: user.careerGoal,
  placementTimeline: user.placementTimeline,
  strongSubjects: user.strongSubjects,
  weakSubjects: user.weakSubjects,
  projects: user.projects,
  createdAt: user.createdAt,
});

// Signup validation schema
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Login validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, password } = parseResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    console.log(`[AUTH] [SIGNUP] User registered: ${email} (ID: ${newUser._id})`);

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      userId: newUser._id,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Verification token is missing or invalid' });
      return;
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log(`[AUTH] [VERIFY-EMAIL] Verification failed: Token "${token}" is invalid or expired.`);
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log(`[AUTH] [VERIFY-EMAIL] Email verified successfully for: ${user.email}`);

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      console.log(`[AUTH] [LOGIN] Login failed: User not found for ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[AUTH] [LOGIN] Login failed: Password mismatch for ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Reject unverified users
    if (!user.isVerified) {
      console.log(`[AUTH] [LOGIN] Login rejected: Email unverified for ${email}`);
      res.status(401).json({ message: 'Please verify your email address before logging in' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`[AUTH] [LOGIN] User logged in: ${email} (ID: ${user._id})`);
    console.log(`[AUTH] [TOKENS] Tokens generated for ${email}`);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
        console.log(`[AUTH] [LOGOUT] User logged out: ${user.email} (ID: ${user._id})`);
      } else {
        console.log(`[AUTH] [LOGOUT] Session not found in DB for provided refresh token`);
      }
    } else {
      console.log(`[AUTH] [LOGOUT] Logout request received without refresh token`);
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log(`[AUTH] [REFRESH] Refresh failed: Missing token in payload`);
      res.status(400).json({ message: 'Refresh token is required' });
      return;
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findOne({ _id: decoded.id, refreshToken });

      if (!user) {
        console.log(`[AUTH] [REFRESH] Refresh failed: User or session matching token not found in DB`);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }

      const newAccessToken = generateAccessToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      user.refreshToken = newRefreshToken;
      await user.save();

      console.log(`[AUTH] [REFRESH] Tokens rotated successfully for user: ${user.email}`);

      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (err) {
      console.log(`[AUTH] [REFRESH] Refresh failed: Token is expired or signatures mismatch`);
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[AUTH] [FORGOT-PASSWORD] Requested email "${email}" not found in database. Silent success response returned.`);
      // Return 200 for security reasons to prevent user enumeration
      res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = resetTokenExpires;
    await user.save();

    console.log(`[AUTH] [FORGOT-PASSWORD] Password reset token generated for ${email}`);

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ message: 'Token and password are required' });
      return;
    }

    // Validate password strength
    const passwordSchema = z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number');

    const parseResult = passwordSchema.safeParse(password);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Password validation failed',
        errors: parseResult.error.flatten().formErrors,
      });
      return;
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log(`[AUTH] [RESET-PASSWORD] Reset failed: Token "${token}" is invalid or has expired.`);
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    // Hash password and clear tokens
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    
    // Clear existing session refresh token
    user.refreshToken = undefined;
    await user.save();

    console.log(`[AUTH] [RESET-PASSWORD] Password reset successfully and active sessions cleared for ${user.email}`);

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};
