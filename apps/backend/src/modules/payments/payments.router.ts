import { Router, raw } from 'express';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentRepository } from './repositories/payment.repository';
import { StripeWebhookHandler } from './webhooks/stripe-webhook.handler';
import { authenticate, authorize } from '@/core/middleware/auth.middleware';
import { UserRole } from '@restaurant/shared-types';
import type { AuthenticatedRequest } from '@/types';
import type { OrderService } from '@/modules/orders/services/order.service';

/**
 * createPaymentsRouter requires the shared OrderService instance so the
 * webhook handler can update order paymentStatus without a circular import.
 * Pass the same instance used by createOrdersRouter / createCheckoutRouter.
 */
export function createPaymentsRouter(orderService: OrderService): Router {
  const router = Router();

  // ── Dependency injection ──────────────────────────────────────────────────
  const paymentRepo      = new PaymentRepository();
  const paymentService   = new PaymentService(paymentRepo);
  const controller       = new PaymentController(paymentService);
  const webhookHandler   = new StripeWebhookHandler(paymentService, orderService);

  // ── Stripe webhook — MUST use raw body, registered FIRST ─────────────────
  /**
   * POST /payments/webhook/stripe
   *
   * express.raw() is applied per-route so the rest of the app
   * continues to use express.json() unaffected.
   * No authenticate middleware — Stripe signs the payload instead.
   */
  router.post(
    '/webhook/stripe',
    raw({ type: 'application/json' }),
    (req, res) => webhookHandler.handleWebhook(req, res),
  );

  // ── Authenticated routes ──────────────────────────────────────────────────

  // GET /payments/my — customer sees their own payment history
  router.get(
    '/my',
    authenticate,
    (req, res) => controller.listMyPayments(req as AuthenticatedRequest, res),
  );

  // GET /payments/order/:orderId — get payment record for a specific order
  router.get(
    '/order/:orderId',
    authenticate,
    (req, res) => controller.getPaymentByOrder(req as AuthenticatedRequest, res),
  );

  // GET /payments/:paymentId — get payment by its own ID
  router.get(
    '/:paymentId',
    authenticate,
    (req, res) => controller.getPayment(req as AuthenticatedRequest, res),
  );

  // POST /payments/:paymentId/refund — ADMIN only
  router.post(
    '/:paymentId/refund',
    authenticate,
    authorize(UserRole.ADMIN),
    (req, res) => controller.refundPayment(req as AuthenticatedRequest, res),
  );

  return router;
}
