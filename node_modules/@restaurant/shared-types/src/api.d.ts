export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: ApiError[];
    meta?: PaginationMeta;
}
export interface ApiError {
    field?: string;
    message: string;
    code: string;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}
//# sourceMappingURL=api.d.ts.map