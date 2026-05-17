import { z } from 'zod';
import { UserRole } from '../../types';

// ── Register ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    phone: z.string().regex(/^\+?[\d\s\-()]{7,15}$/).optional(),
    role: z
      .nativeEnum(UserRole)
      .refine(
        (r) => ![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(r),
        'Cannot self-register as admin',
      )
      .optional(),
  }),
});

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// ── Refresh ───────────────────────────────────────────────────────────────────

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// ── Change Password ───────────────────────────────────────────────────────────

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .regex(/[^A-Za-z0-9]/),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type RegisterDto = z.infer<typeof registerSchema>['body'];
export type LoginDto = z.infer<typeof loginSchema>['body'];
export type RefreshDto = z.infer<typeof refreshSchema>['body'];
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>['body'];
