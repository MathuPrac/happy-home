import { z } from 'zod';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '@/types';
import { ValidationError } from '@/core/errors/app-error';
import { ok, paginated, buildPaginationMeta } from '@/shared/http/response';
import type { PaymentService } from '../services/payment.service';
import {
  paymentParamsSchema,
  orderPaymentParamsSchema,
  refundPaymentSchema,
  listPaymentsQuerySchema,
} from '../validations/payment.validators';

function parseOrThrow<S extends z.ZodSchema>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'root',
        message: issue.message,
        code: 'VALIDATION_ERROR',
      })),
    );
  }
  return result.data as z.output<S>;
}

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  // GET /payments/my
  async listMyPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    const query = parseOrThrow(listPaymentsQuerySchema, req.query);
    const result = await this.paymentService.listMyPayments(req.user.sub, query);
    const { data, meta } = result as { data: unknown[]; meta: { page: number; limit: number; total: number } };
    paginated(res, data, buildPaginationMeta(meta.page, meta.limit, meta.total));
  }

  // GET /payments/:paymentId
  async getPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { paymentId } = parseOrThrow(paymentParamsSchema, req.params);
    const payment = await this.paymentService.getPaymentById(
      paymentId, req.user.sub, req.user.role,
    );
    ok(res, payment);
  }

  // GET /payments/order/:orderId
  async getPaymentByOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = parseOrThrow(orderPaymentParamsSchema, req.params);
    const payment = await this.paymentService.getPaymentByOrder(
      orderId, req.user.sub, req.user.role,
    );
    ok(res, payment);
  }

  // POST /payments/:paymentId/refund   — ADMIN only
  async refundPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { paymentId } = parseOrThrow(paymentParamsSchema, req.params);
    parseOrThrow(refundPaymentSchema, req.body); // validate but don't use reason

    const updated = await this.paymentService.refundPayment(
      paymentId, req.user.sub, req.user.role,
    );
    ok(res, updated);
  }
}
