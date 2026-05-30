import { z } from 'zod';
import { UserRole, UserStatus } from '@restaurant/shared-types';

// ── Update own profile ────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName:  z.string().min(1).max(100).trim().optional(),
  phone:     z
    .string()
    .regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number')
    .optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional(),
});

// ── Change own password ───────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
  });

// ── Admin: update any user ────────────────────────────────────────────────────

export const adminUpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName:  z.string().min(1).max(100).trim().optional(),
  phone:     z.string().regex(/^\+?[\d\s\-()]{7,20}$/).optional(),
  avatarUrl: z.string().url().optional(),
  role:      z.nativeEnum(UserRole).optional(),
  status:    z.nativeEnum(UserStatus).optional(),
});

// ── Admin: list users query ───────────────────────────────────────────────────

export const listUsersQuerySchema = z.object({
  page:    z.coerce.number().int().positive().default(1),
  limit:   z.coerce.number().int().positive().max(100).default(20),
  role:    z.nativeEnum(UserRole).optional(),
  status:  z.nativeEnum(UserStatus).optional(),
  search:  z.string().max(100).optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type UpdateProfileDto    = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto   = z.infer<typeof changePasswordSchema>;
export type AdminUpdateUserDto  = z.infer<typeof adminUpdateUserSchema>;
export type ListUsersQuery      = z.infer<typeof listUsersQuerySchema>;
