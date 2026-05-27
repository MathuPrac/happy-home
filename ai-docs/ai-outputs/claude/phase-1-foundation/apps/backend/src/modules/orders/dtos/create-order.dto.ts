import { z } from 'zod';
import { PaymentMethod } from '@restaurant/shared-types';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
});

const orderItemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().min(1),
  customizations: z.array(z.object({
    customizationId: z.string(),
    optionId: z.string(),
    name: z.string(),
    price: z.number(),
  })).default([]),
  subtotal: z.number().positive(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string(),
  items: z.array(orderItemSchema).min(1),
  deliveryFee: z.number().min(0),
  discount: z.number().min(0).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryAddress: addressSchema,
  notes: z.string().max(500).optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
