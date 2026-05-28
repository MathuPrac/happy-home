import type { Server } from 'socket.io';
import { createLogger } from '@/shared/utils/logger';
import type { IOrderEventPublisher } from '@/modules/orders/events/order-event.publisher';
import type { AnyOrderEvent } from '@/modules/orders/events/order.events';
import { ORDER_EVENTS } from '@/modules/orders/events/order.events';

export class SocketOrderEventPublisher implements IOrderEventPublisher {
  private readonly logger = createLogger('SocketOrderEventPublisher');

  constructor(private readonly io: Server) {}

  publish(event: AnyOrderEvent): void {
    this.logger.info(`Publishing ${event.eventName} [${event.eventId}]`);

    switch (event.eventName) {
      case ORDER_EVENTS.CREATED: {
        const { orderId, customerId, restaurantId } = event.payload;
        this.io.to(`customer:${customerId}`).emit('order:created', event.payload);
        this.io.to(`restaurant:${restaurantId}`).emit('order:new', event.payload);
        this.io.to(`order:${orderId}`).emit('order:created', event.payload);
        break;
      }

      case ORDER_EVENTS.STATUS_CHANGED: {
        const { orderId, customerId, restaurantId, riderId } = event.payload;
        this.io.to(`customer:${customerId}`).emit('order:status:update', event.payload);
        this.io.to(`restaurant:${restaurantId}`).emit('order:status:update', event.payload);
        this.io.to(`order:${orderId}`).emit('order:status:update', event.payload);
        if (riderId) {
          this.io.to(`rider:${riderId}`).emit('order:status:update', event.payload);
        }
        break;
      }

      case ORDER_EVENTS.RIDER_ASSIGNED: {
        const { orderId, customerId, restaurantId, riderId } = event.payload;
        this.io.to(`customer:${customerId}`).emit('order:assigned', event.payload);
        this.io.to(`restaurant:${restaurantId}`).emit('order:assigned', event.payload);
        this.io.to(`rider:${riderId}`).emit('order:assigned', event.payload);
        this.io.to(`order:${orderId}`).emit('order:assigned', event.payload);
        break;
      }

      case ORDER_EVENTS.CANCELLED: {
        const { orderId, customerId, restaurantId, riderId } = event.payload;
        this.io.to(`customer:${customerId}`).emit('order:cancelled', event.payload);
        this.io.to(`restaurant:${restaurantId}`).emit('order:cancelled', event.payload);
        this.io.to(`order:${orderId}`).emit('order:cancelled', event.payload);
        if (riderId) {
          this.io.to(`rider:${riderId}`).emit('order:cancelled', event.payload);
        }
        break;
      }

      default: {
        const _exhaustive: never = event;
        this.logger.warn(`Unhandled event type: ${JSON.stringify(_exhaustive)}`);
      }
    }
  }
}