import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@restaurant/shared-types';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

const customizationSchema = z.object({
  customizationId: z.string().min(1),
  optionId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
});

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(50),
  customizations: z.array(customizationSchema).default([]),
  subtotal: z.number().positive(),
});

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().min(1),
    items: z.array(orderItemSchema).min(1).max(30),
    deliveryFee: z.number().min(0),
    discount: z.number().min(0).default(0),
    paymentMethod: z.nativeEnum(PaymentMethod),
    deliveryAddress: addressSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
    cancelReason: z.string().max(500).optional(),
    riderId: z.string().optional(),
  }),
});

export const getOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    status: z.nativeEnum(OrderStatus).optional(),
  }),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>['body'];
export type GetOrdersQuerySchema = z.infer<typeof getOrdersQuerySchema>['query'];
