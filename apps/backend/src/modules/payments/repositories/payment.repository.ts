import { BaseRepository } from '../../../infrastructure/database/mongodb/base.repository';
import { PaymentModel, type IPayment } from '../entities/payment.entity';
import type { PaginationQuery } from '@restaurant/shared-types';

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(PaymentModel);
  }

  async findByOrderId(orderId: string): Promise<IPayment | null> {
    return this.findOne({ orderId });
  }

  async findByStripeIntentId(intentId: string): Promise<IPayment | null> {
    return this.findOne({ stripePaymentIntentId: intentId });
  }

  async findByCustomer(customerId: string, query: PaginationQuery) {
    return this.findMany({ customerId }, query);
  }
}
