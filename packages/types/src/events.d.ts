import type { Order, Rider } from './entities';
import type { OrderStatus } from './enums';
export interface DomainEvent<T = unknown> {
    eventId: string;
    eventType: string;
    aggregateId: string;
    timestamp: Date;
    payload: T;
}
export type OrderCreatedEvent = DomainEvent<{
    order: Order;
}>;
export type OrderStatusChangedEvent = DomainEvent<{
    orderId: string;
    previousStatus: OrderStatus;
    newStatus: OrderStatus;
}>;
export type RiderAssignedEvent = DomainEvent<{
    orderId: string;
    rider: Rider;
}>;
export type RiderLocationUpdatedEvent = DomainEvent<{
    riderId: string;
    location: {
        lat: number;
        lng: number;
    };
}>;
//# sourceMappingURL=events.d.ts.map