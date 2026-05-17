import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import type { ApiResponse } from '@restaurant/shared-types';
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  type ValidationFieldError,
} from '@/core/errors';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('ErrorHandler');

function normalizeZodError(err: ZodError): ValidationError {
  return new ValidationError(
    err.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
      code: 'VALIDATION_ERROR',
      received: 'received' in issue ? (issue as { received?: unknown }).received : undefined,
    })),
  );
}

function normalizeMongoError(err: MongoServerError): AppError {
  if (err.code === 11000) {
    const field = Object.keys((err.keyPattern ?? {}) as Record<string, unknown>)[0] ?? 'field';
    return new ConflictError(`Duplicate value for field: ${field}`);
  }
  return new AppError('Database operation failed', 500, 'DB_ERROR', false);
}

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = normalizeZodError(err);
  } else if (err instanceof MongoServerError) {
    appError = normalizeMongoError(err);
  } else if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    appError =
      err instanceof TokenExpiredError
        ? new UnauthorizedError('Token has expired')
        : new UnauthorizedError('Invalid token');
  } else if (err instanceof SyntaxError && 'body' in err) {
    appError = new BadRequestError('Malformed JSON in request body');
  } else {
    appError = new AppError('An unexpected error occurred', 500, 'INTERNAL_ERROR', false);
  }

  if (!appError.isOperational) {
    log.error('Non-operational error', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
    });
  }

  const isDev = process.env.NODE_ENV === 'development';

  const errors: ValidationFieldError[] =
    appError instanceof ValidationError
      ? appError.errors
      : [{ field: 'root', message: appError.message, code: appError.code }];

  const body: ApiResponse = {
    success: false,
    message: appError.message,
    errors: errors.map((e) => ({
      field: e.field,
      message: e.message,
      code: e.code ?? appError.code,
    })),
  };

  if (isDev && err instanceof Error && err.stack) {
    res.status(appError.statusCode).json({ ...body, stack: err.stack });
    return;
  }

  res.status(appError.statusCode).json(body);
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
}

export const errorHandler = globalErrorHandler;
