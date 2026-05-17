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
  code?: string;
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
