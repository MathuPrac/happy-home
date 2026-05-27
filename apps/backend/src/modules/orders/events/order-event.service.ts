import { createLogger } from '@/shared/utils/logger';
import type { IOrderEventPublisher } from './order-event.publisher';
import type {
  AnyOrderEvent,
  OrderEventName,
  OrderCreatedEvent,
  OrderStatusChangedEvent,
  OrderRiderAssignedEvent,
  OrderCancelledEvent,
} from './order.events';
import { ORDER_EVENTS } from './order.events';

type EventHandler<T extends AnyOrderEvent> = (event: T) => void | Promise<void>;

type HandlerMap = {
  [ORDER_EVENTS.CREATED]: Array<EventHandler<OrderCreatedEvent>>;
  [ORDER_EVENTS.STATUS_CHANGED]: Array<EventHandler<OrderStatusChangedEvent>>;
  [ORDER_EVENTS.RIDER_ASSIGNED]: Array<EventHandler<OrderRiderAssignedEvent>>;
  [ORDER_EVENTS.CANCELLED]: Array<EventHandler<OrderCancelledEvent>>;
};

export class OrderEventService {
  private readonly logger = createLogger('OrderEventService');
  private readonly publishers: IOrderEventPublisher[] = [];
  private readonly handlers: HandlerMap = {
    [ORDER_EVENTS.CREATED]: [],
    [ORDER_EVENTS.STATUS_CHANGED]: [],
    [ORDER_EVENTS.RIDER_ASSIGNED]: [],
    [ORDER_EVENTS.CANCELLED]: [],
  };

  registerPublisher(publisher: IOrderEventPublisher): void {
    this.publishers.push(publisher);
    this.logger.info(`Publisher registered: ${publisher.constructor.name}`);
  }

  onOrderCreated(handler: EventHandler<OrderCreatedEvent>): void {
    this.handlers[ORDER_EVENTS.CREATED].push(handler);
  }

  onOrderStatusChanged(handler: EventHandler<OrderStatusChangedEvent>): void {
    this.handlers[ORDER_EVENTS.STATUS_CHANGED].push(handler);
  }

  onOrderRiderAssigned(handler: EventHandler<OrderRiderAssignedEvent>): void {
    this.handlers[ORDER_EVENTS.RIDER_ASSIGNED].push(handler);
  }

  onOrderCancelled(handler: EventHandler<OrderCancelledEvent>): void {
    this.handlers[ORDER_EVENTS.CANCELLED].push(handler);
  }

  emit(event: AnyOrderEvent): void {
    this.logger.debug(`Emitting ${event.eventName}`, {
      eventId: event.eventId,
      aggregateId: event.aggregateId,
    });

    for (const publisher of this.publishers) {
      try {
        publisher.publish(event);
      } catch (err) {
        this.logger.error(`Publisher error for ${event.eventName}`, { error: err });
      }
    }

    this.dispatchToHandlers(event);
  }

  private dispatchToHandlers(event: AnyOrderEvent): void {
    const name = event.eventName as OrderEventName;
    switch (name) {
      case ORDER_EVENTS.CREATED:
        this.runHandlers(this.handlers[ORDER_EVENTS.CREATED], event as OrderCreatedEvent);
        break;
      case ORDER_EVENTS.STATUS_CHANGED:
        this.runHandlers(this.handlers[ORDER_EVENTS.STATUS_CHANGED], event as OrderStatusChangedEvent);
        break;
      case ORDER_EVENTS.RIDER_ASSIGNED:
        this.runHandlers(this.handlers[ORDER_EVENTS.RIDER_ASSIGNED], event as OrderRiderAssignedEvent);
        break;
      case ORDER_EVENTS.CANCELLED:
        this.runHandlers(this.handlers[ORDER_EVENTS.CANCELLED], event as OrderCancelledEvent);
        break;
      default: {
        const _exhaustive: never = name;
        this.logger.warn(`Unhandled event type: ${String(_exhaustive)}`);
      }
    }
  }

  private runHandlers<T extends AnyOrderEvent>(
    handlers: Array<EventHandler<T>>,
    event: T,
  ): void {
    for (const handler of handlers) {
      try {
        const result = handler(event);
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            this.logger.error(`Async handler error for ${event.eventName}`, { error: err });
          });
        }
      } catch (err) {
        this.logger.error(`Handler error for ${event.eventName}`, { error: err });
      }
    }
  }
}
