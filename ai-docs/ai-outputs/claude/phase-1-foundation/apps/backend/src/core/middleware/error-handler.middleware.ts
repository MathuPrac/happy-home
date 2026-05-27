import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@restaurant/shared-types';
import { AppError } from '../errors/app-error';
import { Logger } from '../../shared/utils/logger';

const logger = new Logger('ErrorHandler');

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
      errors: [{ message: err.message, code: err.code }],
    };
    res.status(err.statusCode).json(response);
    return;
  }

  logger.error('Unhandled error', err);

  const response: ApiResponse = {
    success: false,
    message: 'Internal server error',
    errors: [{ message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }],
  };

  res.status(500).json(response);
}
