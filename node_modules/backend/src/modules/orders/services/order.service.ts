import { UserRole } from '@restaurant/shared-types';
import type { CreateOrderDto } from '../dtos/create-order.dto';
import type { PaginationQuery } from '@restaurant/shared-types';
import { OrderStatus } from '@restaurant/shared-types';
import { OrderRepository } from '../repositories/order.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { BadRequestError, NotFoundError } from '@/core/errors';
import { createLogger } from '@/shared/utils/logger';
import { OrderEventService } from '../events/order-event.service';
import { OrderEventFactory } from '../events/order.events';

export class OrderService {
  private readonly logger = createLogger('OrderService');

  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly cache: CacheService,
    private readonly eventService: OrderEventService,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    const subtotal = dto.items.reduce(
      (sum: number, item: { subtotal: number }) => sum + item.subtotal,
      0,
    );
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
      deliveryAddress: {
        street: dto.deliveryAddress.street,
        city: dto.deliveryAddress.city,
        state: dto.deliveryAddress.state,
        postalCode: dto.deliveryAddress.postalCode,
        country: dto.deliveryAddress.country,
        ...(dto.deliveryAddress.coordinates
          ? { coordinates: dto.deliveryAddress.coordinates }
          : {}),
      },
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
    });

    this.logger.info(`Order created: ${String(order._id)}`);
    await this.cache.del(`orders:customer:${customerId}`);
    this.eventService.emit(OrderEventFactory.orderCreated(order));

    return order;
  }

  async getOrderById(orderId: string, requesterId: string, requesterRole: UserRole) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (requesterRole === UserRole.CUSTOMER && order.customerId !== requesterId) {
      throw new NotFoundError('Order');
    }

    if (requesterRole === UserRole.RIDER && order.riderId !== requesterId) {
      throw new NotFoundError('Order');
    }

    // NOTE: For RESTAURANT_OWNER tokens, req.user.sub is assumed to be the restaurant's ID.
    // If the JWT payload uses a different field for restaurant identity, update accordingly.
    if (requesterRole === UserRole.RESTAURANT_OWNER && order.restaurantId !== requesterId) {
      throw new NotFoundError('Order');
    }

    return order;
  }

  async getCustomerOrders(customerId: string, query: PaginationQuery) {
    const cacheKey = `orders:customer:${customerId}:${query.page}:${query.limit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const result = await this.orderRepo.findByCustomer(customerId, query);
    await this.cache.set(cacheKey, result, 60);
    return result;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    actorId: string,
  ) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    const previousStatus = order.status;

    if (!this.isValidTransition(previousStatus, newStatus)) {
      throw new BadRequestError(
        `Cannot transition from ${previousStatus} to ${newStatus}`,
      );
    }

    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === OrderStatus.DELIVERED) updates.deliveredAt = new Date();
    if (newStatus === OrderStatus.CANCELLED) updates.cancelledAt = new Date();

    const updated = await this.orderRepo.update(orderId, updates);
    if (!updated) throw new NotFoundError('Order');

    this.logger.info(
      `Order ${orderId} status: ${previousStatus} → ${newStatus} by ${actorId}`,
    );
    await this.cache.del(`orders:customer:${order.customerId}`);
    this.eventService.emit(
      OrderEventFactory.orderStatusChanged(updated, previousStatus),
    );

    return updated;
  }

  async assignRider(orderId: string, riderId: string, actorId: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (order.riderId) {
      throw new BadRequestError('Order already has an assigned rider');
    }

    const validStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY_FOR_PICKUP,
    ];

    if (!validStatuses.includes(order.status)) {
      throw new BadRequestError(
        `Cannot assign rider to an order with status: ${order.status}`,
      );
    }

    const updated = await this.orderRepo.update(orderId, { riderId });
    if (!updated) throw new NotFoundError('Order');

    this.logger.info(`Rider ${riderId} assigned to order ${orderId} by ${actorId}`);
    this.eventService.emit(
      OrderEventFactory.orderRiderAssigned(updated, riderId),
    );

    return updated;
  }

  async cancelOrder(orderId: string, actorId: string, reason?: string) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (!this.isValidTransition(order.status, OrderStatus.CANCELLED)) {
      throw new BadRequestError(
        `Cannot cancel an order with status: ${order.status}`,
      );
    }

    const updated = await this.orderRepo.update(orderId, {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      ...(reason !== undefined ? { cancelReason: reason } : {}),
    });
    if (!updated) throw new NotFoundError('Order');

    this.logger.info(`Order ${orderId} cancelled by ${actorId}`);
    await this.cache.del(`orders:customer:${order.customerId}`);
    this.eventService.emit(OrderEventFactory.orderCancelled(updated, reason));

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