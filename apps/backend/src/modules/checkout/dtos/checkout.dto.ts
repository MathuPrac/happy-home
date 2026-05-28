import type { PaymentMethod } from '@restaurant/shared-types';
import type { IOrder } from '@/modules/orders/entities/order.entity';

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
}

export interface CheckoutResult {
  order: IOrder;
  paymentClientSecret?: string;
  paymentStatus: string;
  message: string;
  warnings: string[];
}
