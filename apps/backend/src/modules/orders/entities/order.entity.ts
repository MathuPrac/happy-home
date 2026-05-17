import { Schema, model, type Document } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@restaurant/shared-types';

export interface IOrder extends Document {
  customerId: string;
  restaurantId: string;
  riderId?: string;
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    customizations: Array<{ customizationId: string; optionId: string; name: string; price: number }>;
    subtotal: number;
  }>;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: {
    street: string; city: string; state: string;
    postalCode: string; country: string;
    coordinates?: { lat: number; lng: number };
  };
  notes?: string;
  estimatedDeliveryTime?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

const orderSchema = new Schema<IOrder>(
  {
    customerId: { type: String, required: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    riderId: { type: String, index: true },
    items: [
      {
        menuItemId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        customizations: [
          {
            customizationId: String,
            optionId: String,
            name: String,
            price: Number,
          },
        ],
        subtotal: { type: Number, required: true },
      },
    ],
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING, index: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    deliveryAddress: {
      street: String, city: String, state: String,
      postalCode: String, country: String,
      coordinates: { lat: Number, lng: Number },
    },
    notes: String,
    estimatedDeliveryTime: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: String,
  },
  { timestamps: true },
);

export const OrderModel = model<IOrder>('Order', orderSchema);
