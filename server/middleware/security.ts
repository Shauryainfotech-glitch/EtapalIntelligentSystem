import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Express, Request, Response, NextFunction } from 'express';
import { config, rateLimitConfig, isProduction } from '../config/index.js';
import { logger } from '../utils/logger.js';

export function setupSecurity(app: Express): void {
  // Basic security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.openai.com", "https://vision.googleapis.com"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: isProduction ? config.ALLOWED_ORIGINS : 'http://localhost:5000',
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.max,
    message: 'Too many requests from this IP, please try again later.',
  });

  // Apply rate limiting to all routes
  app.use('/api/', limiter);
}

// Error handling middleware
export const errorHandler = (
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errorDetails = {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  logger.error('Error occurred:', errorDetails);

  res.status(err.status || 500).json({
    error: {
      message: isProduction ? 'Internal Server Error' : err.message,
      status: err.status || 500,
    }
  });
};
