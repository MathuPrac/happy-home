import { z } from 'zod';
import { CuisineType } from '../entities/restaurant.entity';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  adminPatchRestaurantSchema,
} from '../dtos/restaurant.dto';

// ── Body validators (re-exported for controller use) ─────────────────────────
export { createRestaurantSchema, updateRestaurantSchema, adminPatchRestaurantSchema };

// ── Param validators ──────────────────────────────────────────────────────────

export const restaurantParamsSchema = z.object({
  restaurantId: z.string().min(1, 'restaurantId is required'),
});

// ── Query validators ──────────────────────────────────────────────────────────

export const listRestaurantsQuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().positive().max(100).default(20),
  sortBy:      z.string().optional(),
  sortOrder:   z.enum(['asc', 'desc']).optional(),
  cuisineType: z.nativeEnum(CuisineType).optional(),
  isActive:    z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === 'true';
    }),
  isVerified: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === 'true';
    }),
  search: z.string().max(100).optional(),
  /** Filter to restaurants that are open right now */
  openNow: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === 'true';
    }),
});

// ── Inferred types ────────────────────────────────────────────────────────────

export type RestaurantParams       = z.infer<typeof restaurantParamsSchema>;
export type ListRestaurantsQuery   = z.infer<typeof listRestaurantsQuerySchema>;
