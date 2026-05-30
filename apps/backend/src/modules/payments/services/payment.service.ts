import { BadRequestError, NotFoundError, ForbiddenError } from '@/core/errors';
import { createLogger } from '@/shared/utils/logger';
import { config } from '@/config';
import { PaymentStatus, PaymentMethod, UserRole } from '@restaurant/shared-types';
import { PaymentProvider } from '../entities/payment.entity';
import type { IPayment } from '../entities/payment.entity';
import type { PaymentRepository } from '../repositories/payment.repository';
import type { ListPaymentsQuery } from '../dtos/payment.dto';

const log = createLogger('PaymentService');

// Type-safe wrappers for PaymentStatus values not present in this version of the enum.
// Replace the string literals if your shared-types uses different values.
const STATUS_PAID       = 'paid'      as unknown as PaymentStatus;
const STATUS_FAILED     = 'failed'    as unknown as PaymentStatus;
const STATUS_REFUNDED   = 'refunded'  as unknown as PaymentStatus;

export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepository) {}

  async createCashPayment(params: {
    orderId:    string;
    customerId: string;
    amount:     number;
    currency?:  string;
  }): Promise<IPayment> {
    const payment = await this.paymentRepo.create({
      orderId:    params.orderId,
      customerId: params.customerId,
      amount:     params.amount,
      currency:   params.currency ?? 'lkr',
      status:     STATUS_PAID,
      method:     PaymentMethod.CASH,
      provider:   PaymentProvider.CASH,
      paidAt:     new Date(),
    });
    log.info(`Cash payment created: ${String(payment._id)} order=${params.orderId}`);
    return payment;
  }

  async createStripePayment(params: {
    orderId:               string;
    customerId:            string;
    amount:                number;
    currency?:             string;
    stripePaymentIntentId: string;
    stripeClientSecret:    string;
  }): Promise<IPayment> {
    const payment = await this.paymentRepo.create({
      orderId:               params.orderId,
      customerId:            params.customerId,
      amount:                params.amount,
      currency:              params.currency ?? 'lkr',
      status:                PaymentStatus.PROCESSING,
      method:                PaymentMethod.CARD,
      provider:              PaymentProvider.STRIPE,
      stripePaymentIntentId: params.stripePaymentIntentId,
      stripeClientSecret:    params.stripeClientSecret,
    });
    log.info(`Stripe payment created: ${String(payment._id)} intentId=${params.stripePaymentIntentId}`);
    return payment;
  }

  async handlePaymentSucceeded(stripeIntentId: string): Promise<IPayment> {
    const payment = await this.paymentRepo.findByStripeIntentId(stripeIntentId);
    if (!payment) {
      log.warn(`payment_intent.succeeded — not found: intentId=${stripeIntentId}`);
      throw new NotFoundError('Payment');
    }

    if (payment.status === STATUS_PAID) return payment;

    const updated = await this.paymentRepo.update(String(payment._id), {
      status: STATUS_PAID,
      paidAt: new Date(),
    });
    if (!updated) throw new NotFoundError('Payment');

    log.info(`Payment PAID: ${String(payment._id)} order=${payment.orderId}`);
    return updated;
  }

  async handlePaymentFailed(stripeIntentId: string, failureMessage?: string): Promise<IPayment> {
    const payment = await this.paymentRepo.findByStripeIntentId(stripeIntentId);
    if (!payment) {
      log.warn(`payment_intent.payment_failed — not found: intentId=${stripeIntentId}`);
      throw new NotFoundError('Payment');
    }

    if (payment.status === STATUS_FAILED) return payment;

    const updated = await this.paymentRepo.update(String(payment._id), {
      status:   STATUS_FAILED,
      failedAt: new Date(),
      ...(failureMessage !== undefined ? { failureMessage } : {}),
    });
    if (!updated) throw new NotFoundError('Payment');

    log.warn(`Payment FAILED: ${String(payment._id)} order=${payment.orderId}`);
    return updated;
  }

  async refundPayment(
    paymentId: string,
    actorId:   string,
    actorRole: UserRole,
  ): Promise<IPayment> {
    if (actorRole !== UserRole.ADMIN) throw new ForbiddenError('Only admins can issue refunds');

    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment');

    if (payment.status !== STATUS_PAID) {
      throw new BadRequestError(`Cannot refund a payment with status: ${payment.status}`);
    }

    if (payment.provider === PaymentProvider.STRIPE && payment.stripePaymentIntentId) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Stripe = require('stripe') as typeof import('stripe').default;
        if (config.stripe.secretKey) {
          const stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2024-04-10' });
          await stripe.refunds.create({ payment_intent: payment.stripePaymentIntentId });
          log.info(`Stripe refund issued: ${payment.stripePaymentIntentId} by admin ${actorId}`);
        }
      } catch (err) {
        log.error('Stripe refund failed', { error: err, paymentId });
        throw new BadRequestError('Stripe refund failed. Check logs for details.');
      }
    }

    const updated = await this.paymentRepo.update(paymentId, {
      status:     STATUS_REFUNDED,
      refundedAt: new Date(),
    });
    if (!updated) throw new NotFoundError('Payment');

    log.info(`Payment refunded: ${paymentId} by admin ${actorId}`);
    return updated;
  }

  async getPaymentByOrder(orderId: string, actorId: string, actorRole: UserRole) {
    const payment = await this.paymentRepo.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment');
    if (actorRole === UserRole.CUSTOMER && payment.customerId !== actorId) {
      throw new ForbiddenError('Access denied');
    }
    return payment;
  }

  async getPaymentById(paymentId: string, actorId: string, actorRole: UserRole) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment');
    if (actorRole === UserRole.CUSTOMER && payment.customerId !== actorId) {
      throw new ForbiddenError('Access denied');
    }
    return payment;
  }

  async listMyPayments(customerId: string, query: ListPaymentsQuery) {
    return this.paymentRepo.findByCustomer(customerId, query);
  }
}