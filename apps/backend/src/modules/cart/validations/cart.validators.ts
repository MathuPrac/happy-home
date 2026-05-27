import { z } from 'zod';

const cartCustomizationSchema = z.object({
  customizationId: z.string().min(1),
  optionId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
});

export const addToCartSchema = z.object({
  body: z.object({
    menuItemId: z.string().min(1),
    restaurantId: z.string().min(1),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive().max(20),
    customizations: z.array(cartCustomizationSchema).default([]),
    imageUrl: z.string().url().optional(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({ menuItemId: z.string().min(1) }),
  body: z.object({
    quantity: z.number().int().min(0).max(20),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>['body'];