import { Schema, model, type Document } from 'mongoose';
import { PaymentStatus, PaymentMethod } from '@restaurant/shared-types';

export enum PaymentProvider {
  STRIPE = 'stripe',
  CASH   = 'cash',
}

export interface IPayment extends Document {
  orderId:           string;
  customerId:        string;
  amount:            number;          // in currency units (e.g. LKR / USD)
  currency:          string;          // ISO 4217, e.g. 'lkr'
  status:            PaymentStatus;
  method:            PaymentMethod;
  provider:          PaymentProvider;

  // Stripe-specific — only present when method === CARD / ONLINE
  stripePaymentIntentId?: string;
  stripeClientSecret?:    string;

  // Populated on webhook receipt
  paidAt?:     Date;
  failedAt?:   Date;
  refundedAt?: Date;
  failureMessage?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId:     { type: String, required: true, index: true },
    customerId:  { type: String, required: true, index: true },
    amount:      { type: Number, required: true, min: 0 },
    currency:    { type: String, required: true, default: 'lkr' },
    status:      {
      type:     String,
      enum:     Object.values(PaymentStatus),
      default:  PaymentStatus.PENDING,
      required: true,
      index:    true,
    },
    method:   { type: String, enum: Object.values(PaymentMethod), required: true },
    provider: { type: String, enum: Object.values(PaymentProvider), required: true },

    stripePaymentIntentId: { type: String, sparse: true, index: true },
    stripeClientSecret:    { type: String },

    paidAt:         { type: Date },
    failedAt:       { type: Date },
    refundedAt:     { type: Date },
    failureMessage: { type: String },
  },
  { timestamps: true },
);

// Fast lookup from Stripe webhook — intentId → payment
paymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });

export const PaymentModel = model<IPayment>('Payment', paymentSchema);
