import type { Response } from 'express';
import { HttpStatus } from '@/core/errors';
import type { PaginationMeta } from '@/types';

export function ok<T>(res: Response, data: T, statusCode = HttpStatus.OK): void {
  res.status(statusCode).json({
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() },
  });
}

export function created<T>(res: Response, data: T): void {
  ok(res, data, HttpStatus.CREATED);
}

export function noContent(res: Response): void {
  res.status(HttpStatus.NO_CONTENT).send();
}

export function paginated<T>(res: Response, data: T[], pagination: PaginationMeta): void {
  res.status(HttpStatus.OK).json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNextPage,
      hasPrev: pagination.hasPrevPage,
    },
  });
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
