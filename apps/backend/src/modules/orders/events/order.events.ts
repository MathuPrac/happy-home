import { randomUUID } from 'crypto';
import type { OrderStatus } from '@restaurant/shared-types';
import type { IOrder } from '../entities/order.entity';

export const ORDER_EVENTS = {
  CREATED: 'order:created',
  STATUS_CHANGED: 'order:status:changed',
  RIDER_ASSIGNED: 'order:rider:assigned',
  CANCELLED: 'order:cancelled',
} as const;

export type OrderEventName = (typeof ORDER_EVENTS)[keyof typeof ORDER_EVENTS];

export interface DomainEvent<TName extends OrderEventName, TPayload> {
  readonly eventId: string;
  readonly eventName: TName;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly payload: TPayload;
}

export interface OrderCreatedPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly restaurantId: string;
  readonly total: number;
  readonly itemCount: number;
  readonly paymentMethod: string;
}

export interface OrderStatusChangedPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly restaurantId: string;
  readonly riderId: string | undefined;
  readonly previousStatus: OrderStatus;
  readonly newStatus: OrderStatus;
}

export interface OrderRiderAssignedPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly restaurantId: string;
  readonly riderId: string;
}

export interface OrderCancelledPayload {
  readonly orderId: string;
  readonly customerId: string;
  readonly restaurantId: string;
  readonly riderId: string | undefined;
  readonly reason: string | undefined;
  readonly cancelledAt: Date;
}

export type OrderCreatedEvent = DomainEvent<typeof ORDER_EVENTS.CREATED, OrderCreatedPayload>;
export type OrderStatusChangedEvent = DomainEvent<typeof ORDER_EVENTS.STATUS_CHANGED, OrderStatusChangedPayload>;
export type OrderRiderAssignedEvent = DomainEvent<typeof ORDER_EVENTS.RIDER_ASSIGNED, OrderRiderAssignedPayload>;
export type OrderCancelledEvent = DomainEvent<typeof ORDER_EVENTS.CANCELLED, OrderCancelledPayload>;

export type AnyOrderEvent =
  | OrderCreatedEvent
  | OrderStatusChangedEvent
  | OrderRiderAssignedEvent
  | OrderCancelledEvent;

export const OrderEventFactory = {
  orderCreated(order: IOrder): OrderCreatedEvent {
    return {
      eventId: randomUUID(),
      eventName: ORDER_EVENTS.CREATED,
      aggregateId: String(order._id),
      occurredAt: new Date(),
      payload: {
        orderId: String(order._id),
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        total: order.total,
        itemCount: order.items.length,
        paymentMethod: order.paymentMethod,
      },
    };
  },

  orderStatusChanged(order: IOrder, previousStatus: OrderStatus): OrderStatusChangedEvent {
    return {
      eventId: randomUUID(),
      eventName: ORDER_EVENTS.STATUS_CHANGED,
      aggregateId: String(order._id),
      occurredAt: new Date(),
      payload: {
        orderId: String(order._id),
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        riderId: order.riderId,
        previousStatus,
        newStatus: order.status,
      },
    };
  },

  orderRiderAssigned(order: IOrder, riderId: string): OrderRiderAssignedEvent {
    return {
      eventId: randomUUID(),
      eventName: ORDER_EVENTS.RIDER_ASSIGNED,
      aggregateId: String(order._id),
      occurredAt: new Date(),
      payload: {
        orderId: String(order._id),
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        riderId,
      },
    };
  },

  orderCancelled(order: IOrder, reason?: string): OrderCancelledEvent {
    return {
      eventId: randomUUID(),
      eventName: ORDER_EVENTS.CANCELLED,
      aggregateId: String(order._id),
      occurredAt: new Date(),
      payload: {
        orderId: String(order._id),
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        riderId: order.riderId,
        reason,
        cancelledAt: order.cancelledAt ?? new Date(),
      },
    };
  },
} as const;