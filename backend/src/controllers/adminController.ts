import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';

// Admin User Creation Schema
const adminCreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['student', 'admin']).default('student'),
  college: z.string().optional().default(''),
  branch: z.string().optional().default(''),
  preferredCareer: z.string().optional().default(''),
});

/**
 * GET /api/admin/users
 * Returns a list of all registered users with filtering and search options.
 */
export const getAllUsers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, role, isVerified } = req.query;

    const filter: any = {};

    if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
        { preferredCareer: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && (role === 'student' || role === 'admin')) {
      filter.role = role;
    }

    if (isVerified !== undefined && isVerified !== '') {
      filter.isVerified = isVerified === 'true';
    }

    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/users
 * Allows an admin to manually create a user or another admin account with pre-set password.
 */
export const createUserByAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = adminCreateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, password, role, college, branch, preferredCareer } = parseResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (automatically verified when created by admin)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      college,
      branch,
      preferredCareer,
      isVerified: true,
    });

    console.log(`[ADMIN] User created by Admin (${req.user?.email}): ${email} (Role: ${role})`);

    res.status(201).json({
      success: true,
      message: `User '${name}' created successfully with role '${role}'`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        college: newUser.college,
        branch: newUser.branch,
        preferredCareer: newUser.preferredCareer,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Provides overview analytics for the Admin Dashboard.
 */
export const getAdminStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const verifiedCount = await User.countDocuments({ isVerified: true });
    const unverifiedCount = await User.countDocuments({ isVerified: false });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        adminCount,
        verifiedCount,
        unverifiedCount,
        recentRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
};
