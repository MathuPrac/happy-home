import rateLimit, { type Options } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { config } from '@/config';
import { HttpStatus } from '@/core/errors';

const rateLimitHandler = (_req: Request, res: Response): void => {
  res.status(HttpStatus.TOO_MANY_REQUESTS).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    errors: [{ code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' }],
  });
};

const baseOptions: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
};

export const globalRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
});

export const authRateLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.authMax,
  keyGenerator: (req) => req.ip ?? 'unknown',
});

/** @deprecated Use globalRateLimiter */
export const rateLimiter = globalRateLimiter;

/** @deprecated Use authRateLimiter */
export const strictRateLimiter = authRateLimiter;
