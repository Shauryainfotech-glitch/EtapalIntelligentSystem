import winston from 'winston';
import { config } from '../config/index.js';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger instance
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'etapal-system' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to the console
if (config.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Create log directory if it doesn't exist
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';

(async () => {
  const logDir = 'logs';
  if (!existsSync(logDir)) {
    try {
      await mkdir(logDir);
      logger.info('Created logs directory');
    } catch (error) {
      console.error('Error creating logs directory:', error);
    }
  }
})();

// Add request context to logs
export interface RequestContext {
  requestId: string;
  ip: string;
  userAgent: string;
  userId?: string;
}

export const withRequestContext = (context: RequestContext) => {
  return logger.child(context);
};

// Log security events
export const logSecurityEvent = (
  eventType: string, 
  details: Record<string, any>,
  level: 'error' | 'warn' | 'info' = 'info'
) => {
  logger.log(level, 'Security Event', {
    eventType,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Log API requests
export const logApiRequest = (
  req: { method: string; path: string; ip: string },
  res: { statusCode: number },
  duration: number,
  extraDetails?: Record<string, any>
) => {
  const level = res.statusCode >= 400 ? 'error' : 'info';
  logger.log(level, 'API Request', {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    ...extraDetails,
  });
};

// Log errors with context
export const logError = (
  error: Error,
  context?: Record<string, any>
) => {
  logger.error('Application Error', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  });
};

// Export commonly used log levels for convenience
export const logLevels = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
} as const;

// Type for log levels
export type LogLevel = keyof typeof logLevels;

// Helper to check if a string is a valid log level
export const isValidLogLevel = (level: string): level is LogLevel => {
  return level in logLevels;
};
