# Module 1: Orders Module — `orders-module-v1`

## Purpose

Fully implement the `orders` module that already has skeleton files in the backend. This module
handles the complete order lifecycle: creation, status transitions, real-time notifications via
Socket.IO, and a customer-facing read layer. The skeleton files (`order.entity.ts`,
`order.service.ts`, `order.repository.ts`, `orders.router.ts`, `orders.controller.ts`) all exist
but are partially implemented. This module completes them and wires everything together.

---

## Architecture

```
apps/backend/src/modules/orders/
├── controllers/
│   └── orders.controller.ts       ← REPLACE (extend existing skeleton)
├── dtos/
│   ├── create-order.dto.ts        ← EXISTS (keep)
│   └── update-order-status.dto.ts ← NEW
├── entities/
│   └── order.entity.ts            ← EXISTS (keep)
├── events/
│   └── order.events.ts            ← NEW
├── repositories/
│   └── order.repository.ts        ← REPLACE (extend existing)
├── services/
│   ├── order.service.ts           ← REPLACE (extend existing)
│   └── order-event.service.ts     ← NEW
├── validations/
│   └── order.validators.ts        ← NEW
├── orders.router.ts               ← REPLACE (extend existing)
└── index.ts                       ← NEW
```

---

## Backend — New & Changed Files

### 1. `apps/backend/src/modules/orders/dtos/update-order-status.dto.ts` — NEW

```typescript
import { OrderStatus } from '@restaurant/shared-types';

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  cancelReason?: string;
  riderId?: string;
}
```

---

### 2. `apps/backend/src/modules/orders/events/order.events.ts` — NEW

Domain events the OrderEventService emits into Socket.IO and optionally Redis pub/sub.

```typescript
import { OrderStatus } from '@restaurant/shared-types';

export const ORDER_EVENTS = {
  CREATED: 'order:created',
  STATUS_CHANGED: 'order:status:changed',
  RIDER_ASSIGNED: 'order:rider:assigned',
  CANCELLED: 'order:cancelled',
} as const;

export type OrderEventType = (typeof ORDER_EVENTS)[keyof typeof ORDER_EVENTS];

export interface OrderCreatedPayload {
  orderId: string;
  customerId: string;
  restaurantId: string;
  total: number;
  createdAt: Date;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  restaurantId: string;
  customerId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: Date;
}

export interface RiderAssignedPayload {
  orderId: string;
  riderId: string;
  restaurantId: string;
  customerId: string;
}
```

---

### 3. `apps/backend/src/modules/orders/validations/order.validators.ts` — NEW

Zod schemas used with the existing `validate` middleware pattern.

```typescript
import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@restaurant/shared-types';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
});

const customizationSchema = z.object({
  customizationId: z.string().min(1),
  optionId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().min(0),
});

const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive().max(50),
  customizations: z.array(customizationSchema).default([]),
  subtotal: z.number().positive(),
});

export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.string().min(1),
    items: z.array(orderItemSchema).min(1).max(30),
    deliveryFee: z.number().min(0),
    discount: z.number().min(0).default(0),
    paymentMethod: z.nativeEnum(PaymentMethod),
    deliveryAddress: addressSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
    cancelReason: z.string().max(500).optional(),
    riderId: z.string().optional(),
  }),
});

export const getOrdersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    status: z.nativeEnum(OrderStatus).optional(),
  }),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>['body'];
export type GetOrdersQuerySchema = z.infer<typeof getOrdersQuerySchema>['query'];
```

---

### 4. `apps/backend/src/modules/orders/services/order-event.service.ts` — NEW

Decoupled event emitter that bridges the `OrderService` and `SocketGateway`.

```typescript
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';
import { createLogger } from '@/shared/utils/logger';
import type {
  OrderCreatedPayload,
  OrderStatusChangedPayload,
  RiderAssignedPayload,
} from '../events/order.events';
import { ORDER_EVENTS } from '../events/order.events';

const log = createLogger('OrderEventService');

export class OrderEventService {
  constructor(private readonly gateway: SocketGateway) {}

  emitOrderCreated(payload: OrderCreatedPayload): void {
    log.info('Emitting order:created', { orderId: payload.orderId });
    // Notify restaurant room
    this.gateway.emitNewOrder(payload.restaurantId, {
      event: ORDER_EVENTS.CREATED,
      data: payload,
    });
    // Notify the order room (customer listening)
    this.gateway.emitOrderUpdate(payload.orderId, {
      event: ORDER_EVENTS.CREATED,
      data: payload,
    });
  }

  emitStatusChanged(payload: OrderStatusChangedPayload): void {
    log.info('Emitting order:status:changed', {
      orderId: payload.orderId,
      from: payload.previousStatus,
      to: payload.newStatus,
    });
    this.gateway.emitOrderUpdate(payload.orderId, {
      event: ORDER_EVENTS.STATUS_CHANGED,
      data: payload,
    });
    this.gateway.emitNewOrder(payload.restaurantId, {
      event: ORDER_EVENTS.STATUS_CHANGED,
      data: payload,
    });
  }

  emitRiderAssigned(payload: RiderAssignedPayload): void {
    log.info('Emitting order:rider:assigned', {
      orderId: payload.orderId,
      riderId: payload.riderId,
    });
    this.gateway.emitOrderUpdate(payload.orderId, {
      event: ORDER_EVENTS.RIDER_ASSIGNED,
      data: payload,
    });
  }
}
```

---

### 5. `apps/backend/src/modules/orders/services/order.service.ts` — REPLACE

Extended with event emission, rider assignment, restaurant query, and pagination.

```typescript
import { randomUUID } from 'crypto';
import type { CreateOrderDto } from '../dtos/create-order.dto';
import type { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import type { PaginationQuery } from '@restaurant/shared-types';
import { OrderStatus } from '@restaurant/shared-types';
import { OrderRepository } from '../repositories/order.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/core/errors';
import { createLogger } from '@/shared/utils/logger';
import type { OrderEventService } from './order-event.service';
import type { JwtAccessPayload } from '@/types';
import { UserRole } from '@/types';

const log = createLogger('OrderService');

// Valid FSM transitions
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
  [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

// Who can trigger which transitions
const TRANSITION_PERMISSIONS: Partial<Record<OrderStatus, UserRole[]>> = {
  [OrderStatus.CONFIRMED]: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  [OrderStatus.PREPARING]: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  [OrderStatus.READY_FOR_PICKUP]: [UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
  [OrderStatus.OUT_FOR_DELIVERY]: [UserRole.RIDER, UserRole.ADMIN],
  [OrderStatus.DELIVERED]: [UserRole.RIDER, UserRole.ADMIN],
  [OrderStatus.CANCELLED]: [UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER, UserRole.ADMIN],
};

export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly cache: CacheService,
    private readonly eventService: OrderEventService,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto) {
    // Recompute subtotals server-side to prevent tampering
    const subtotal = dto.items.reduce((sum, item) => {
      const itemBase = item.price * item.quantity;
      const customizationTotal = item.customizations.reduce((c, x) => c + x.price, 0);
      return sum + itemBase + customizationTotal * item.quantity;
    }, 0);

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const discount = dto.discount ?? 0;
    const total = parseFloat((subtotal + dto.deliveryFee + tax - discount).toFixed(2));

    const items = dto.items.map((item) => ({
      ...item,
      subtotal: parseFloat(
        (
          item.price * item.quantity +
          item.customizations.reduce((c, x) => c + x.price, 0) * item.quantity
        ).toFixed(2),
      ),
    }));

    const order = await this.orderRepo.create({
      customerId,
      restaurantId: dto.restaurantId,
      items,
      deliveryFee: dto.deliveryFee,
      discount,
      subtotal,
      tax,
      total,
      paymentMethod: dto.paymentMethod,
      deliveryAddress: dto.deliveryAddress,
      ...(dto.notes ? { notes: dto.notes } : {}),
    });

    log.info('Order created', { orderId: order.id, customerId, total });

    // Invalidate customer order cache
    await this.cache.del(`orders:customer:${customerId}:*`);

    this.eventService.emitOrderCreated({
      orderId: order.id as string,
      customerId,
      restaurantId: dto.restaurantId,
      total,
      createdAt: new Date(),
    });

    return order;
  }

  async getOrderById(orderId: string, actor: JwtAccessPayload) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    // Scoping: customer can only read own orders
    if (actor.role === UserRole.CUSTOMER && order.customerId !== actor.sub) {
      throw new ForbiddenError('You can only view your own orders');
    }

    return order;
  }

  async getCustomerOrders(customerId: string, query: PaginationQuery & { status?: OrderStatus }) {
    const cacheKey = `orders:customer:${customerId}:${query.page ?? 1}:${query.status ?? 'all'}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const filter: Record<string, unknown> = { customerId };
    if (query.status) filter.status = query.status;

    const result = await this.orderRepo.findManyFiltered(filter, query);
    await this.cache.set(cacheKey, result, 30); // 30s TTL — order lists are volatile
    return result;
  }

  async getRestaurantOrders(
    restaurantId: string,
    query: PaginationQuery & { status?: OrderStatus },
  ) {
    const filter: Record<string, unknown> = { restaurantId };
    if (query.status) filter.status = query.status;
    return this.orderRepo.findManyFiltered(filter, query);
  }

  async getPendingOrdersForRestaurant(restaurantId: string) {
    return this.orderRepo.findPendingOrders(restaurantId);
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, actor: JwtAccessPayload) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    const { status } = dto;
    const previousStatus = order.status;

    // FSM guard
    if (!ORDER_TRANSITIONS[previousStatus]?.includes(status)) {
      throw new BadRequestError(
        `Invalid transition: ${previousStatus} → ${status}`,
      );
    }

    // RBAC guard
    const allowedRoles = TRANSITION_PERMISSIONS[status];
    if (allowedRoles && !allowedRoles.includes(actor.role)) {
      throw new ForbiddenError(`Role '${actor.role}' cannot set status to '${status}'`);
    }

    // Customer cancel own order only
    if (
      status === OrderStatus.CANCELLED &&
      actor.role === UserRole.CUSTOMER &&
      order.customerId !== actor.sub
    ) {
      throw new ForbiddenError('You can only cancel your own orders');
    }

    const updates: Record<string, unknown> = { status };
    if (status === OrderStatus.DELIVERED) updates.deliveredAt = new Date();
    if (status === OrderStatus.CANCELLED) {
      updates.cancelledAt = new Date();
      if (dto.cancelReason) updates.cancelReason = dto.cancelReason;
    }
    if (dto.riderId && status === OrderStatus.OUT_FOR_DELIVERY) {
      updates.riderId = dto.riderId;
    }

    const updated = await this.orderRepo.update(orderId, updates);

    log.info('Order status updated', {
      orderId,
      from: previousStatus,
      to: status,
      actor: actor.sub,
    });

    // Invalidate caches
    await Promise.all([
      this.cache.del(`orders:customer:${order.customerId}:*`),
      this.cache.invalidatePattern(`orders:restaurant:${order.restaurantId}:*`),
    ]);

    this.eventService.emitStatusChanged({
      orderId,
      restaurantId: order.restaurantId,
      customerId: order.customerId,
      previousStatus,
      newStatus: status,
      changedAt: new Date(),
    });

    if (dto.riderId && status === OrderStatus.OUT_FOR_DELIVERY) {
      this.eventService.emitRiderAssigned({
        orderId,
        riderId: dto.riderId,
        restaurantId: order.restaurantId,
        customerId: order.customerId,
      });
    }

    return updated;
  }

  async assignRider(orderId: string, riderId: string, actor: JwtAccessPayload) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new NotFoundError('Order');

    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      throw new BadRequestError('Order must be READY_FOR_PICKUP before assigning a rider');
    }

    const updated = await this.orderRepo.update(orderId, { riderId });
    log.info('Rider assigned', { orderId, riderId, actor: actor.sub });

    this.eventService.emitRiderAssigned({
      orderId,
      riderId,
      restaurantId: order.restaurantId,
      customerId: order.customerId,
    });

    return updated;
  }

  async getRiderActiveOrders(riderId: string) {
    return this.orderRepo.findActiveOrdersForRider(riderId);
  }
}
```

---

### 6. `apps/backend/src/modules/orders/repositories/order.repository.ts` — REPLACE

```typescript
import type { FilterQuery } from 'mongoose';
import type { PaginationQuery } from '@restaurant/shared-types';
import { BaseRepository } from '@/infrastructure/database/mongodb/base.repository';
import { OrderModel, type IOrder } from '../entities/order.entity';
import { OrderStatus } from '@restaurant/shared-types';

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }

  async findManyFiltered(filter: FilterQuery<IOrder>, query: PaginationQuery) {
    return this.findMany(filter, query);
  }

  async findByCustomer(customerId: string, query: PaginationQuery) {
    return this.findMany({ customerId }, query);
  }

  async findByRestaurant(restaurantId: string, query: PaginationQuery) {
    return this.findMany({ restaurantId }, query);
  }

  async findActiveOrdersForRider(riderId: string) {
    return this.model
      .find({
        riderId,
        status: {
          $in: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.READY_FOR_PICKUP],
        },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingOrders(restaurantId: string) {
    return this.model
      .find({ restaurantId, status: OrderStatus.PENDING })
      .sort({ createdAt: 1 })
      .exec();
  }

  async countByStatusForRestaurant(restaurantId: string): Promise<Record<string, number>> {
    const agg = await this.model
      .aggregate([
        { $match: { restaurantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .exec();

    return agg.reduce(
      (acc, { _id, count }) => {
        acc[_id as string] = count as number;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
```

---

### 7. `apps/backend/src/modules/orders/controllers/orders.controller.ts` — REPLACE

```typescript
import type { Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderRepository } from '../repositories/order.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { ok, created, paginated } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';
import type { OrderEventService } from '../services/order-event.service';

// Factory — controller instantiated per-module-load (singleton-ish via closure)
function buildOrderService(eventService: OrderEventService): OrderService {
  return new OrderService(new OrderRepository(), new CacheService(), eventService);
}

export class OrdersController {
  private readonly service: OrderService;

  constructor(eventService: OrderEventService) {
    this.service = buildOrderService(eventService);
  }

  createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const order = await this.service.createOrder(req.user.sub, req.body);
    created(res, order);
  };

  getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getCustomerOrders(req.user.sub, req.query as never);
    paginated(res, result.data, result.meta);
  };

  getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const order = await this.service.getOrderById(req.params.orderId, req.user);
    ok(res, order);
  };

  getRestaurantOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getRestaurantOrders(
      req.params.restaurantId,
      req.query as never,
    );
    paginated(res, result.data, result.meta);
  };

  updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const order = await this.service.updateOrderStatus(
      req.params.orderId,
      req.body,
      req.user,
    );
    ok(res, order);
  };

  assignRider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const order = await this.service.assignRider(
      req.params.orderId,
      req.body.riderId as string,
      req.user,
    );
    ok(res, order);
  };

  getRiderActiveOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const orders = await this.service.getRiderActiveOrders(req.user.sub);
    ok(res, orders);
  };

  getPendingOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const orders = await this.service.getPendingOrdersForRestaurant(req.params.restaurantId);
    ok(res, orders);
  };
}
```

---

### 8. `apps/backend/src/modules/orders/orders.router.ts` — REPLACE

```typescript
import { Router } from 'express';
import { OrdersController } from './controllers/orders.controller';
import { authenticate, requireCustomer, requireRider, requireRestaurantOwner } from '@/core/middleware/auth.middleware';
import { validate } from '@/core/middleware/validate.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrdersQuerySchema,
} from './validations/order.validators';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';
import { OrderEventService } from './services/order-event.service';

export function createOrdersRouter(gateway: SocketGateway): Router {
  const router = Router();
  const eventService = new OrderEventService(gateway);
  const controller = new OrdersController(eventService);

  // Customer routes
  router.post(
    '/',
    authenticate,
    requireCustomer,
    validate(createOrderSchema),
    controller.createOrder,
  );

  router.get(
    '/my',
    authenticate,
    requireCustomer,
    validate(getOrdersQuerySchema),
    controller.getMyOrders,
  );

  // Shared — any authenticated user (RBAC scoping in service)
  router.get('/:orderId', authenticate, controller.getOrderById);

  // Status update — restaurant owner, rider, admin
  router.patch(
    '/:orderId/status',
    authenticate,
    validate(updateOrderStatusSchema),
    controller.updateOrderStatus,
  );

  // Restaurant owner routes
  router.get(
    '/restaurant/:restaurantId',
    authenticate,
    requireRestaurantOwner,
    validate(getOrdersQuerySchema),
    controller.getRestaurantOrders,
  );

  router.get(
    '/restaurant/:restaurantId/pending',
    authenticate,
    requireRestaurantOwner,
    controller.getPendingOrders,
  );

  // Rider routes
  router.get(
    '/rider/active',
    authenticate,
    requireRider,
    controller.getRiderActiveOrders,
  );

  router.patch(
    '/:orderId/assign-rider',
    authenticate,
    requireRestaurantOwner,
    controller.assignRider,
  );

  return router;
}
```

---

### 9. `apps/backend/src/modules/orders/index.ts` — NEW

```typescript
export { createOrdersRouter } from './orders.router';
export { OrderService } from './services/order.service';
export { OrderEventService } from './services/order-event.service';
export { OrderRepository } from './repositories/order.repository';
export type { OrderCreatedPayload, OrderStatusChangedPayload } from './events/order.events';
export { ORDER_EVENTS } from './events/order.events';
```

---

## Existing File Changes

### `apps/backend/src/app.ts` — MODIFY

The existing `ordersRouter` import and usage must change because the router now requires the
`SocketGateway` instance. Replace these two lines:

```typescript
// BEFORE
import { ordersRouter } from '@/modules/orders/orders.router';
// ...
app.use(`${apiPrefix}/orders`, ordersRouter);
```

```typescript
// AFTER — in createApp(), thread the gateway through createAppServer()
// The gateway is created in createAppServer(), so we need to pass it to createApp()
```

The cleanest approach: change `createApp()` to accept the gateway as a parameter (optional, with
undefined allowed for health-check-only boot):

```typescript
// apps/backend/src/app.ts

import { createOrdersRouter } from '@/modules/orders';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export function createApp(gateway?: SocketGateway): Application {
  // ... all existing middleware setup unchanged ...

  app.use(`${apiPrefix}/auth`, authRouter);
  app.use(`${apiPrefix}/users`, usersRouter);
  app.use(`${apiPrefix}/restaurants`, restaurantsRouter);
  app.use(`${apiPrefix}/menu`, menuRouter);
  app.use(
    `${apiPrefix}/orders`,
    gateway ? createOrdersRouter(gateway) : Router(), // no-op until gateway ready
  );
  app.use(`${apiPrefix}/riders`, ridersRouter);
  app.use(`${apiPrefix}/payments`, paymentsRouter);

  // ... error handlers unchanged ...
  return app;
}

export function createAppServer(): AppServer {
  const httpServer = createServer(express()); // temp to get io
  const io = new SocketIOServer(httpServer, {
    cors: { origin: config.security.corsOrigins, credentials: true },
  });
  const gateway = new SocketGateway(io);

  const app = createApp(gateway); // pass gateway in
  httpServer.removeAllListeners(); // reset, attach the real app
  // (simpler: build app THEN server)
  // ...
}
```

**Simpler pattern (recommended):** Restructure `createAppServer` so the gateway is built first,
then `createApp(gateway)` is called:

```typescript
export function createAppServer(): AppServer {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: config.security.corsOrigins, credentials: true },
  });
  const gateway = new SocketGateway(io);

  applyMiddleware(app);          // extract all app.use() calls
  applyRoutes(app, gateway);     // new helper; includes createOrdersRouter(gateway)
  applyErrorHandlers(app);       // error + 404

  return { app, httpServer, io };
}
```

This is an internal refactor of `app.ts` only — no other files change.

---

## API Routes

| Method | Path | Auth | Role |
|--------|------|------|------|
| `POST` | `/api/v1/orders` | ✅ | CUSTOMER |
| `GET` | `/api/v1/orders/my` | ✅ | CUSTOMER |
| `GET` | `/api/v1/orders/rider/active` | ✅ | RIDER |
| `GET` | `/api/v1/orders/:orderId` | ✅ | any (RBAC in service) |
| `PATCH` | `/api/v1/orders/:orderId/status` | ✅ | RESTAURANT_OWNER, RIDER, ADMIN |
| `PATCH` | `/api/v1/orders/:orderId/assign-rider` | ✅ | RESTAURANT_OWNER |
| `GET` | `/api/v1/orders/restaurant/:restaurantId` | ✅ | RESTAURANT_OWNER |
| `GET` | `/api/v1/orders/restaurant/:restaurantId/pending` | ✅ | RESTAURANT_OWNER |

---

## Real-time Flow

```
Customer places order (POST /orders)
  → OrderService.createOrder()
    → OrderRepository.create()
    → OrderEventService.emitOrderCreated()
      → SocketGateway.emitNewOrder(restaurantId)   → restaurant dashboard room
      → SocketGateway.emitOrderUpdate(orderId)     → customer order tracking room

Restaurant confirms order (PATCH /orders/:id/status { status: "confirmed" })
  → OrderService.updateOrderStatus()
    → FSM guard passes
    → RBAC guard passes (RESTAURANT_OWNER)
    → OrderEventService.emitStatusChanged()
      → SocketGateway.emitOrderUpdate(orderId)     → customer room
      → SocketGateway.emitNewOrder(restaurantId)   → restaurant room (dashboard refresh)

Customer frontend joins room: socket.emit('join:order', orderId)
  → Receives: 'order:status:update' events in real time
```

---

## Frontend Integration

### Customer App (React Native / Expo)

**File:** `apps/customer-app/hooks/useOrder.ts` — NEW

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@restaurant/api-client';
import type { CreateOrderDto, Order } from '@restaurant/shared-types';

const ORDERS_KEY = ['orders'];

export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'my', page],
    queryFn: () =>
      apiClient.get<{ data: Order[]; meta: unknown }>(`/orders/my?page=${page}`).then((r) => r.data),
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: [...ORDERS_KEY, orderId],
    queryFn: () => apiClient.get<Order>(`/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDto) =>
      apiClient.post<Order>('/orders', dto).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...ORDERS_KEY, 'my'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, cancelReason }: { orderId: string; status: string; cancelReason?: string }) =>
      apiClient.patch(`/orders/${orderId}/status`, { status, cancelReason }),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: [...ORDERS_KEY, vars.orderId] });
      void qc.invalidateQueries({ queryKey: [...ORDERS_KEY, 'my'] });
    },
  });
}
```

**File:** `apps/customer-app/hooks/useOrderSocket.ts` — NEW

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import { API_BASE_URL } from '@/constants/config';

export function useOrderSocket(orderId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!orderId) return;

    const socket = io(API_BASE_URL);

    socket.emit('join:order', orderId);

    socket.on('order:status:update', (payload: { event: string; data: unknown }) => {
      void qc.invalidateQueries({ queryKey: ['orders', orderId] });
      void qc.invalidateQueries({ queryKey: ['orders', 'my'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, qc]);
}
```

---

## Shared Package Changes

### `packages/types/src/entities.ts` — ADD (to existing file)

No structural changes needed — `Order`, `OrderItem`, `OrderStatus`, etc. already exist.

---

## Environment Variables

No new env vars required. The module uses existing:
- `REDIS_*` — for cache invalidation
- `JWT_*` — for authentication
- `MONGODB_URI` — for persistence

---

## Dependencies

No new npm dependencies. Uses existing:
- `mongoose` (already installed)
- `ioredis` via `CacheService` (already installed)
- `zod` via `validate` middleware (already installed)
- `socket.io` via `SocketGateway` (already installed)

---

## Integration Steps

1. Create `orders/validations/order.validators.ts`
2. Create `orders/events/order.events.ts`
3. Create `orders/services/order-event.service.ts`
4. Replace `orders/services/order.service.ts`
5. Replace `orders/repositories/order.repository.ts`
6. Replace `orders/controllers/orders.controller.ts`
7. Replace `orders/orders.router.ts` (now a factory function)
8. Create `orders/index.ts`
9. Refactor `app.ts` to pass `SocketGateway` into route registration
10. Add hooks in `customer-app`

---

## Testing Flow

```bash
# 1. Start services
docker-compose up -d   # MongoDB + Redis

# 2. Boot backend
cd apps/backend && npm run dev

# 3. Register a customer
POST /api/v1/auth/register { email, password, firstName, lastName, phone, role: "customer" }

# 4. Login to get token
POST /api/v1/auth/login { email, password }

# 5. Create order
POST /api/v1/orders
Authorization: Bearer <token>
{
  "restaurantId": "...",
  "items": [{ "menuItemId": "...", "name": "Burger", "price": 12.99, "quantity": 1, "customizations": [], "subtotal": 12.99 }],
  "deliveryFee": 2.50,
  "paymentMethod": "card",
  "deliveryAddress": { "street": "123 Main", "city": "Colombo", "state": "WP", "postalCode": "00300", "country": "LK" }
}

# 6. Connect WebSocket client and join order room
socket.emit('join:order', '<orderId>')
# Should receive 'order:status:update' when restaurant confirms

# 7. Login as restaurant owner and confirm order
PATCH /api/v1/orders/<orderId>/status { "status": "confirmed" }
```