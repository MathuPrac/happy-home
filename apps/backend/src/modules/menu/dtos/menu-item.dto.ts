import { z } from 'zod';
import { MenuCategory } from '../entities/menu-item.entity';

export const customizationOptionSchema = z.object({
  optionId:      z.string().min(1, 'optionId is required'),
  name:          z.string().min(1, 'Option name is required').max(100),
  priceModifier: z.number().default(0),
});

export const customizationSchema = z.object({
  customizationId: z.string().min(1, 'customizationId is required'),
  name:            z.string().min(1, 'Customization name is required').max(100),
  required:        z.boolean().default(false),
  multiSelect:     z.boolean().default(false),
  options:         z.array(customizationOptionSchema).min(1, 'At least one option required'),
});

export const createMenuItemSchema = z.object({
  name:                   z.string().min(1, 'Name is required').max(200),
  description:            z.string().min(1, 'Description is required').max(1000),
  category:               z.nativeEnum(MenuCategory),
  basePrice:              z.number().min(0, 'Price must be non-negative'),
  imageUrl:               z.string().url('imageUrl must be a valid URL').optional(),
  customizations:         z.array(customizationSchema).default([]),
  isAvailable:            z.boolean().default(true),
  preparationTimeMinutes: z.number().int().min(0).optional(),
  allergens:              z.array(z.string().min(1)).default([]),
  tags:                   z.array(z.string().min(1)).default([]),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export type CreateMenuItemDto = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemDto = z.infer<typeof updateMenuItemSchema>;
