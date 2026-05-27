import type { CreateOrderDto } from '../dtos/create-order.dto';
import type { PaginationQuery } from '@restaurant/shared-types';
import { OrderStatus } from '@restaurant/shared-types';
import { OrderRepository } from '../repositories/order.repository';
import { CacheService } from '../../../infrastructure/cache/redis/cache.service';
import { NotFoundError, ValidationError } from '../../../core/errors/app-error';
import { Logger } from '../../../shared/utils/logger';

export class OrderService {
  private readonly logger = new Logger('OrderService');

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly cache: CacheService,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    const subtotal = dto.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + dto.deliveryFee + tax - (dto.discount ?? 0);

    const order = await this.orderRepo.create({
      customerId,
      restaurantId: dto.restaurantId,
      items: dto.items,
      deliveryFee: dto.deliveryFee,
      discount: dto.discount ?? 0,
      subtotal,
      tax,
      total,
      paymentMethod: dto.paymentMethod,
      deliveryAddress: dto.deliveryAddress,
      notes: dto.notes,
    });

    this.logger.info(`Order created: ${order.id}`);
    await this.cache.del(`orders:customer:${customerId}`);

    return order;
  }

  async getOrderById(orderId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');
    return order;
  }

  async getCustomerOrders(customerId: string, query: PaginationQuery) {
    const cacheKey = `orders:customer:${customerId}:${query.page}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.orderRepo.findByCustomer(customerId, query);
    await this.cache.set(cacheKey, result, 60);
    return result;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, actorId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (!this.isValidTransition(order.status, status)) {
      throw new ValidationError(`Cannot transition from ${order.status} to ${status}`);
    }

    const updates: Record<string, unknown> = { status };
    if (status === OrderStatus.DELIVERED) updates.deliveredAt = new Date();
    if (status === OrderStatus.CANCELLED) updates.cancelledAt = new Date();

    const updated = await this.orderRepo.update(orderId, updates);
    this.logger.info(`Order ${orderId} status: ${order.status} -> ${status} by ${actorId}`);

    return updated;
  }

  private isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
      [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };
    return transitions[from]?.includes(to) ?? false;
  }
}
