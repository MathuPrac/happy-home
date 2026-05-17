import type { PaginationMeta } from '@restaurant/shared-types';

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page, limit, total, totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
