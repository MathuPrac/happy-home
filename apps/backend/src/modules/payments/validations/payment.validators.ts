import { z } from 'zod';
export { refundPaymentSchema, listPaymentsQuerySchema } from '../dtos/payment.dto';

export const paymentParamsSchema = z.object({
  paymentId: z.string().min(1, 'paymentId is required'),
});

export const orderPaymentParamsSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
});

export type PaymentParams      = z.infer<typeof paymentParamsSchema>;
export type OrderPaymentParams = z.infer<typeof orderPaymentParamsSchema>;
