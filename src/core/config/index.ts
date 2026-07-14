import { z } from 'zod';
import { AppError } from '../errors/AppError';
import { ErrorCategory } from '../errors/ErrorCategory';

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL is required and must be a valid URL'),
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'Supabase publishable key is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnvironment() {
  const parsedEnv = envSchema.safeParse({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsedEnv.success) {
    throw new AppError(
      ErrorCategory.Permanent,
      'INVALID_ENVIRONMENT',
      'Environment configuration validation failed.',
      { issues: parsedEnv.error.format() }
    );
  }

  return parsedEnv.data;
}

const env = validateEnvironment();

export const appConfig = {
  supabase: {
    url: env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
  env: {
    isDev: env.NODE_ENV === 'development',
    isProd: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  }
} as const;
