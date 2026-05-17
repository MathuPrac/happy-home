import { Response } from 'express';
import { HttpStatus } from '../shared/errors';
import { ApiResponse, PaginationMeta } from '../types';

// ── Response Helpers ──────────────────────────────────────────────────────────

export function ok<T>(res: Response, data: T, statusCode = HttpStatus.OK): void {
  const body: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
  res.status(statusCode).json(body);
}

export function created<T>(res: Response, data: T): void {
  ok(res, data, HttpStatus.CREATED);
}

export function noContent(res: Response): void {
  res.status(HttpStatus.NO_CONTENT).send();
}

export function paginated<T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
): void {
  res.status(HttpStatus.OK).json({
    success: true,
    data,
    pagination,
    meta: { timestamp: new Date().toISOString() },
  });
}

// ── Pagination Calculator ─────────────────────────────────────────────────────

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
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
