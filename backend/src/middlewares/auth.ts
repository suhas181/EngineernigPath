import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Not authorized, token missing' });
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('+password');

      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token invalid or expired' });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: Array<'student' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: you do not have permission' });
      return;
    }
    next();
  };
};

export const verifiedOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !req.user.isVerified) {
    res.status(403).json({ message: 'Access denied: please verify your email first' });
    return;
  }
  next();
};
