import type { PaginationQuery } from '@restaurant/shared-types';
import { BaseRepository } from '../../../infrastructure/database/mongodb/base.repository';
import { OrderModel, type IOrder } from '../entities/order.entity';
import { OrderStatus } from '@restaurant/shared-types';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }

  async findByCustomer(customerId: string, query: PaginationQuery) {
    return this.findMany({ customerId }, query);
  }

  async findByRestaurant(restaurantId: string, query: PaginationQuery) {
    return this.findMany({ restaurantId }, query);
  }

  async findActiveOrdersForRider(riderId: string) {
    return this.model.find({
      riderId,
      status: { $in: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CONFIRMED] },
    }).exec();
  }

  async findPendingOrders(restaurantId: string) {
    return this.model.find({ restaurantId, status: OrderStatus.PENDING })
      .sort({ createdAt: 1 }).exec();
  }
}
