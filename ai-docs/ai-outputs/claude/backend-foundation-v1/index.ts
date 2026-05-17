import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ── Environment Schema ────────────────────────────────────────────────────────

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  API_PREFIX: z.string().default('/api/v1'),

  // MongoDB
  MONGODB_URI: z.string().url(),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(10),
  MONGODB_SERVER_SELECTION_TIMEOUT: z.coerce.number().int().positive().default(5000),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),
  REDIS_KEY_PREFIX: z.string().default('rde:'),
  REDIS_TTL_DEFAULT: z.coerce.number().int().positive().default(3600),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_DIR: z.string().default('logs'),
  LOG_MAX_SIZE: z.string().default('20m'),
  LOG_MAX_FILES: z.string().default('14d'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  CORS_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim()))
    .default('http://localhost:3000'),
});

// ── Parse & Export ────────────────────────────────────────────────────────────

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌  Invalid environment variables:\n');
  _parsed.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

const env = _parsed.data;

export const config = {
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  nodeEnv: env.NODE_ENV,

  server: {
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
  },

  db: {
    uri: env.MONGODB_URI,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT,
  },

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    keyPrefix: env.REDIS_KEY_PREFIX,
    ttlDefault: env.REDIS_TTL_DEFAULT,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    authMax: env.AUTH_RATE_LIMIT_MAX,
  },

  logging: {
    level: env.LOG_LEVEL,
    dir: env.LOG_DIR,
    maxSize: env.LOG_MAX_SIZE,
    maxFiles: env.LOG_MAX_FILES,
  },

  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    corsOrigins: env.CORS_ORIGINS,
  },
} as const;

export type Config = typeof config;
