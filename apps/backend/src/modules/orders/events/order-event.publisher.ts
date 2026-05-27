import type { AnyOrderEvent } from './order.events';

export interface IOrderEventPublisher {
  publish(event: AnyOrderEvent): void;
}