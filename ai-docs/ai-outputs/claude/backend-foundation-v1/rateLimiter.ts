import rateLimit, { Options } from 'express-rate-limit';
import { config } from '../config';
import { HttpStatus } from '../shared/errors';
import { Request, Response } from 'express';

const rateLimitHandler = (_req: Request, res: Response): void => {
  res.status(HttpStatus.TOO_MANY_REQUESTS).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
    },
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
