import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ── User Roles ────────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  RESTAURANT_OWNER = 'restaurant_owner',
  DELIVERY_DRIVER = 'delivery_driver',
  CUSTOMER = 'customer',
}

// ── Role Hierarchy (higher index = more privileged) ───────────────────────────

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 0,
  [UserRole.DELIVERY_DRIVER]: 1,
  [UserRole.RESTAURANT_OWNER]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.SUPER_ADMIN]: 4,
};

// ── JWT Payload ───────────────────────────────────────────────────────────────

export interface JwtAccessPayload {
  sub: string;       // User ID
  email: string;
  role: UserRole;
  jti: string;       // JWT ID for revocation
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: string;
  jti: string;
  family: string;    // Refresh token family for rotation detection
  iat?: number;
  exp?: number;
}

// ── Authenticated Request ─────────────────────────────────────────────────────

export interface AuthenticatedRequest extends Request {
  user: JwtAccessPayload;
  requestId: string;
}

// ── API Response Shapes ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

export interface ResponseMeta {
  requestId?: string;
  timestamp?: string;
  version?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ── Query Helpers ─────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ── Base Document ─────────────────────────────────────────────────────────────

export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── User Status ───────────────────────────────────────────────────────────────

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

// ── Order Status ──────────────────────────────────────────────────────────────

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// ── Restaurant Status ─────────────────────────────────────────────────────────

export enum RestaurantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_APPROVAL = 'pending_approval',
  SUSPENDED = 'suspended',
}

// ── Utility Types ─────────────────────────────────────────────────────────────

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncHandler<T = void> = () => Promise<T>;
export type ID = Types.ObjectId | string;
