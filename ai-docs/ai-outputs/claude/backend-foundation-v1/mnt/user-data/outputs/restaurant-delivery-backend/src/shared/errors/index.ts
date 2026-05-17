import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { createLogger } from '../logger';

const log = createLogger('ErrorHandler');

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;
  public readonly meta: Record<string, unknown> | undefined;

  constructor(
    message: string,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    code = 'INTERNAL_ERROR',
    isOperational = true,
    meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', meta?: Record<string, unknown>) {
    super(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', true, meta);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT, 'CONFLICT');
  }
}

export interface ValidationFieldError {
  field: string;
  message: string;
  received?: unknown;
}

export class ValidationError extends AppError {
  public readonly errors: ValidationFieldError[];
  constructor(errors: ValidationFieldError[]) {
    super('Validation failed', HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service = 'Service') {
    super(`${service} is unavailable`, HttpStatus.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE', false);
  }
}

function normalizeZodError(err: ZodError): ValidationError {
  return new ValidationError(
    err.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
      received: 'received' in issue ? (issue as { received?: unknown }).received : undefined,
    })),
  );
}

function normalizeMongoError(err: MongoServerError): AppError {
  if (err.code === 11000) {
    const field = Object.keys((err.keyPattern ?? {}) as Record<string,unknown>)[0] ?? 'field';
    return new ConflictError(`Duplicate value for field: ${field}`);
  }
  return new AppError('Database operation failed', HttpStatus.INTERNAL_SERVER_ERROR, 'DB_ERROR', false);
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    errors?: ValidationFieldError[];
    stack?: string;
    requestId?: string;
  };
}

export function globalErrorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = normalizeZodError(err);
  } else if (err instanceof MongoServerError) {
    appError = normalizeMongoError(err);
  } else if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    appError = err instanceof TokenExpiredError
      ? new UnauthorizedError('Token has expired')
      : new UnauthorizedError('Invalid token');
  } else if (err instanceof SyntaxError && 'body' in err) {
    appError = new BadRequestError('Malformed JSON in request body');
  } else {
    appError = new AppError('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', false);
  }

  if (!appError.isOperational) {
    log.error('Non-operational error', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      url: req.originalUrl,
      method: req.method,
    });
  }

  const isDev = process.env['NODE_ENV'] === 'development';
  const requestId = req.headers['x-request-id'] as string | undefined;

  const body: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      ...(requestId !== undefined ? { requestId } : {}),
      ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
    },
  };

  if (appError instanceof ValidationError) {
    body.error.errors = appError.errors;
  }

  res.status(appError.statusCode).json(body);
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
}
