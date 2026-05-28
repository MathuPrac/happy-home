import { z } from 'zod';
import { MenuCategory } from '../entities/menu-item.entity';
import { createMenuItemSchema, updateMenuItemSchema } from '../dtos/menu-item.dto';

// ── Body validators (mirror DTOs, exposed for reuse) ──────────────────────────
export { createMenuItemSchema, updateMenuItemSchema };

// ── Query validators ──────────────────────────────────────────────────────────
export const listMenuItemsQuerySchema = z.object({
  page:        z.coerce.number().int().positive().default(1),
  limit:       z.coerce.number().int().positive().max(100).default(20),
  sortBy:      z.string().optional(),
  sortOrder:   z.enum(['asc', 'desc']).optional(),
  category:    z.nativeEnum(MenuCategory).optional(),
  isAvailable: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      return v === 'true';
    }),
  search:      z.string().max(100).optional(),
});

// ── Param validators ──────────────────────────────────────────────────────────
export const menuItemParamsSchema = z.object({
  restaurantId: z.string().min(1, 'restaurantId is required'),
  itemId:       z.string().min(1, 'itemId is required'),
});

export const restaurantParamsSchema = z.object({
  restaurantId: z.string().min(1, 'restaurantId is required'),
});

// ── Inferred types ────────────────────────────────────────────────────────────
export type ListMenuItemsQuery  = z.infer<typeof listMenuItemsQuerySchema>;
export type MenuItemParams      = z.infer<typeof menuItemParamsSchema>;
export type RestaurantParams    = z.infer<typeof restaurantParamsSchema>;
