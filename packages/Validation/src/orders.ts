import { PaymentMethod } from '@restaurant/shared-types';
import { z } from 'zod';

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive(),
  notes: z.string().max(200).optional(),
});

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryAddress: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().optional(),
      notes: z.string().max(200).optional(),
    })
    .optional(),
  notes: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
