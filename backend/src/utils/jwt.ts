import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Validates and retrieves a required environment variable.
 * Fails loudly if missing or empty, preventing silent insecure fallback secrets in production.
 */
function getRequiredSecret(key: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const value = process.env[key];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `[Security Error] Missing required environment variable: ${key}. Please configure ${key} in your environment variables.`
    );
  }
  return value.trim();
}

export const getJwtSecret = (): string => getRequiredSecret('JWT_SECRET');
export const getJwtRefreshSecret = (): string => getRequiredSecret('JWT_REFRESH_SECRET');

/**
 * Validates that all required JWT secrets are present in the environment on application boot.
 */
export const validateJwtEnvironment = (): void => {
  getJwtSecret();
  getJwtRefreshSecret();
};

export const generateAccessToken = (userId: string): string => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRATION || '15m';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (userId: string): string => {
  const secret = getJwtRefreshSecret();
  const expiresIn = process.env.JWT_REFRESH_EXPIRATION || '7d';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): any => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token: string): any => {
  const secret = getJwtRefreshSecret();
  return jwt.verify(token, secret);
};
