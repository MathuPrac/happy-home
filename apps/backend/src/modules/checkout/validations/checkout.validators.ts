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

export const checkoutSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryAddress: addressSchema,
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;