import { Request, Response, NextFunction } from 'express';

function sanitizeErrorLog(message: string): string {
  if (!message) return '';
  return message
    .replace(/(password|token|secret|authorization|bearer|refresh_token)=["']?[^"'\s&]+["']?/gi, '$1=***REDACTED***')
    .replace(/Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, 'Bearer ***REDACTED***');
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';
  const rawMessage = err.message || String(err);
  console.error('[API Error]:', sanitizeErrorLog(rawMessage));

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const userMessage = isProduction && statusCode === 500 ? 'Internal Server Error' : rawMessage;

  res.status(statusCode).json({
    success: false,
    message: userMessage,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
