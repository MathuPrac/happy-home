import type { PaymentMethod } from '@restaurant/shared-types';

export interface CheckoutDto {
  paymentMethod: PaymentMethod;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  notes?: string;
  promoCode?: string;
}

export interface CheckoutResult {
  order: unknown;
  paymentClientSecret?: string;
  paymentStatus: string;
  message: string;
}