import { z } from 'zod';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Authentication
  SESSION_SECRET: z.string().min(32),
  REPLIT_DOMAINS: z.string(),
  REPL_ID: z.string(),
  ISSUER_URL: z.string().url().default('https://replit.com/oidc'),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ALLOWED_ORIGINS: z.string().transform((str: string) => str.split(',')),

  // File Upload
  MAX_FILE_SIZE: z.string().transform((str: string) => parseInt(str, 10)).default('10485760'),
  UPLOAD_DIR: z.string().default('uploads'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform((str: string) => parseInt(str, 10)).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((str: string) => parseInt(str, 10)).default('100'),
});

function validateEnv(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((err: z.ZodIssue) => err.code === 'invalid_type' && err.received === 'undefined')
        .map((err: z.ZodIssue) => err.path.join('.'));

      if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach((variable: string) => {
          console.error(`   - ${variable}`);
        });
      }

      const invalidVars = error.errors
        .filter((err: z.ZodIssue) => err.code !== 'invalid_type' || err.received !== 'undefined')
        .map((err: z.ZodIssue) => ({
          variable: err.path.join('.'),
          message: err.message,
        }));

      if (invalidVars.length > 0) {
        console.error('❌ Invalid environment variables:');
        invalidVars.forEach(({ variable, message }: { variable: string; message: string }) => {
          console.error(`   - ${variable}: ${message}`);
        });
      }
    } else {
      console.error('❌ Error validating environment variables:', error);
    }
    process.exit(1);
  }
}

export const config = validateEnv();

// Type inference
export type Config = z.infer<typeof envSchema>;

// Helper function to check if we're in production
export const isProduction = config.NODE_ENV === 'production';

// Helper function to check if we're in development
export const isDevelopment = config.NODE_ENV === 'development';

// Helper function to check if we're in test
export const isTest = config.NODE_ENV === 'test';

// Export commonly used config groups
export const dbConfig = {
  url: config.DATABASE_URL,
};

export const authConfig = {
  sessionSecret: config.SESSION_SECRET,
  replitDomains: config.REPLIT_DOMAINS,
  replId: config.REPL_ID,
  issuerUrl: config.ISSUER_URL,
};

export const aiConfig = {
  openaiApiKey: config.OPENAI_API_KEY,
  googleApiKey: config.GOOGLE_API_KEY,
};

export const uploadConfig = {
  maxFileSize: config.MAX_FILE_SIZE,
  uploadDir: config.UPLOAD_DIR,
};

export const rateLimitConfig = {
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
};
