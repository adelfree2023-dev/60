/**
 * S1: ENVIRONMENT VERIFICATION
 * Zod schema validates ALL env vars at boot
 */

import { z } from 'zod';

// ============================================================================
// CORE ENVIRONMENT SCHEMAS
// ============================================================================

export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('7d'),
});

export const databaseSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),
  DB_HOST: z.string().optional(),
  DB_PORT: z.number().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
});

export const redisSchema = z.object({
  REDIS_URL: z.string().url('REDIS_URL must be a valid connection string'),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.number().optional(),
});

export const minioSchema = z.object({
  MINIO_ENDPOINT: z.string().min(1, 'MINIO_ENDPOINT is required'),
  MINIO_PORT: z.number().default(9000),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required'),
  MINIO_USE_SSL: z.boolean().default(false),
  MINIO_BUCKET: z.string().default('apex-assets'),
});

export const corsSchema = z.object({
  CORS_ORIGINS: z.string().default('*'),
});

export const rateLimitSchema = z.object({
  RATE_LIMIT_TTL: z.number().default(60000),
  RATE_LIMIT_LIMIT: z.number().default(100),
});

// ============================================================================
// MERGED ENVIRONMENT SCHEMA
// ============================================================================

export const environmentSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.number().default(4000),
  
  // JWT
  ...jwtSchema.shape,
  
  // Database
  ...databaseSchema.shape,
  
  // Redis
  ...redisSchema.shape,
  
  // MinIO/S3
  ...minioSchema.shape,
  
  // CORS
  ...corsSchema.shape,
  
  // Rate Limiting
  ...rateLimitSchema.shape,
  
  // Feature Flags
  ENABLE_AI_FEATURES: z.boolean().default(false),
  ENABLE_B2B_PORTAL: z.boolean().default(false),
  ENABLE_AFFILIATES: z.boolean().default(false),
  
  // GlitchTip (Error Reporting)
  GLITCHTIP_DSN: z.string().optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

// ============================================================================
// VALIDATION FUNCTION
// ============================================================================

export function validateEnvironment(env: Record<string, any>): Environment {
  const result = environmentSchema.safeParse(env);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path}: ${e.message}`).join('\n');
    throw new Error(`S1 Violation: Environment validation failed\n${errors}`);
  }
  
  return result.data;
}

export function getEnvironment(): Environment {
  return validateEnvironment(process.env);
}

// ============================================================================
// TENANT TIER CONFIGURATION
// ============================================================================

export const tenantTiers = {
  free: {
    rateLimit: 100,
    maxProducts: 50,
    maxStorageMB: 100,
    features: ['basic_store', 'standard_support'],
  },
  basic: {
    rateLimit: 500,
    maxProducts: 500,
    maxStorageMB: 1000,
    features: ['basic_store', 'standard_support', 'analytics'],
  },
  pro: {
    rateLimit: 1000,
    maxProducts: 5000,
    maxStorageMB: 10000,
    features: ['basic_store', 'priority_support', 'analytics', 'ai_writer', 'bulk_import'],
  },
  enterprise: {
    rateLimit: 5000,
    maxProducts: -1, // Unlimited
    maxStorageMB: -1, // Unlimited
    features: ['basic_store', 'dedicated_support', 'analytics', 'ai_writer', 'bulk_import', 'custom_domain', 'api_access'],
  },
} as const;

export type TenantTier = keyof typeof tenantTiers;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const errorMessages = {
  JWT_MALFORMED: 'S1 Violation: JWT_SECRET malformed',
  MISSING_ENV: (name: string) => `S1 Violation: ${name} is required`,
  INVALID_DB_URL: 'S1 Violation: DATABASE_URL must be a valid connection string',
} as const;
