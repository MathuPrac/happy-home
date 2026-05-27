import type { Request } from 'express';
import type { Document, Types } from 'mongoose';
import { UserRole } from '@restaurant/shared-types';

export { UserRole } from '@restaurant/shared-types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 0,
  [UserRole.RIDER]: 1,
  [UserRole.RESTAURANT_OWNER]: 2,
  [UserRole.ADMIN]: 3,
};

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;
  jti: string;
  family: string;
  iat?: number;
  exp?: number;
}

export type AuthenticatedRequest = Request & {
  user: JwtAccessPayload;
};

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export { UserStatus } from '@restaurant/shared-types';
