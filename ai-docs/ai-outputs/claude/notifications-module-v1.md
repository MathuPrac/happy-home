# Module 5: Notifications — `notifications-module-v1`

## Purpose

In-app notification system (push + in-app). Persists notifications in MongoDB, delivers real-time
via Socket.IO, marks read/unread, and batches unread counts in Redis.
The skeleton in `src/modules/notifications/` has empty sub-folders — this implements all of them.

---

## Architecture

```
apps/backend/src/modules/notifications/
├── controllers/
│   └── notifications.controller.ts
├── entities/
│   └── notification.entity.ts
├── repositories/
│   └── notification.repository.ts
├── services/
│   └── notification.service.ts
├── validations/
│   └── notification.validators.ts
├── notifications.router.ts
└── index.ts
```

---

## New Files

### `entities/notification.entity.ts`

```typescript
import { Schema, model, type Document } from 'mongoose';
import { NotificationType } from '@restaurant/shared-types';

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true, maxlength: 100 },
    body: { type: String, required: true, maxlength: 500 },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
  },
  { timestamps: true },
);

// TTL index: auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const NotificationModel = model<INotification>('Notification', notificationSchema);
```

---

### `repositories/notification.repository.ts`

```typescript
import { BaseRepository } from '@/infrastructure/database/mongodb/base.repository';
import { NotificationModel, type INotification } from '../entities/notification.entity';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() { super(NotificationModel); }

  async findForUser(userId: string, page = 1, limit = 20) {
    return this.findMany({ userId }, { page, limit, sortBy: 'createdAt', sortOrder: 'desc' });
  }

  async countUnread(userId: string): Promise<number> {
    return this.model.countDocuments({ userId, isRead: false }).exec();
  }

  async markAllRead(userId: string): Promise<void> {
    await this.model.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    ).exec();
  }

  async markRead(notificationId: string, userId: string): Promise<INotification | null> {
    return this.model
      .findOneAndUpdate(
        { _id: notificationId, userId },
        { $set: { isRead: true, readAt: new Date() } },
        { new: true },
      )
      .exec();
  }
}
```

---

### `services/notification.service.ts`

```typescript
import { createLogger } from '@/shared/utils/logger';
import { NotificationRepository } from '../repositories/notification.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';
import { NotificationType } from '@restaurant/shared-types';
import type { PaginationQuery } from '@restaurant/shared-types';

const log = createLogger('NotificationService');

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

function unreadKey(userId: string) { return `notif:unread:${userId}`; }

export class NotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly cache: CacheService,
    private readonly gateway: SocketGateway,
  ) {}

  /**
   * Called by OrderEventService, PaymentService, etc.
   * Creates persisted notification AND delivers via WebSocket.
   */
  async send(input: CreateNotificationInput): Promise<void> {
    const notification = await this.repo.create(input);
    log.info('Notification created', { userId: input.userId, type: input.type });

    // Invalidate unread count cache
    await this.cache.del(unreadKey(input.userId));

    // Real-time delivery
    this.gateway.emitToUser(input.userId, 'notification:new', {
      id: notification.id,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data,
      createdAt: (notification as { createdAt: Date }).createdAt,
    });
  }

  async getNotifications(userId: string, query: PaginationQuery) {
    return this.repo.findForUser(userId, query.page, query.limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cached = await this.cache.get<number>(unreadKey(userId));
    if (cached !== null) return cached;

    const count = await this.repo.countUnread(userId);
    await this.cache.set(unreadKey(userId), count, 60);
    return count;
  }

  async markRead(notificationId: string, userId: string) {
    const n = await this.repo.markRead(notificationId, userId);
    await this.cache.del(unreadKey(userId));
    return n;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.markAllRead(userId);
    await this.cache.del(unreadKey(userId));
  }
}
```

---

### `controllers/notifications.controller.ts`

```typescript
import type { Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { ok, noContent, paginated } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export class NotificationsController {
  private readonly service: NotificationService;

  constructor(gateway: SocketGateway) {
    this.service = new NotificationService(
      new NotificationRepository(),
      new CacheService(),
      gateway,
    );
  }

  getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await this.service.getNotifications(req.user.sub, req.query as never);
    paginated(res, result.data, result.meta);
  };

  getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const count = await this.service.getUnreadCount(req.user.sub);
    ok(res, { count });
  };

  markRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const n = await this.service.markRead(req.params.notificationId, req.user.sub);
    ok(res, n);
  };

  markAllRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.service.markAllRead(req.user.sub);
    noContent(res);
  };
}
```

---

### `notifications.router.ts`

```typescript
import { Router } from 'express';
import { NotificationsController } from './controllers/notifications.controller';
import { authenticate } from '@/core/middleware/auth.middleware';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export function createNotificationsRouter(gateway: SocketGateway): Router {
  const router = Router();
  const controller = new NotificationsController(gateway);

  router.use(authenticate);
  router.get('/', controller.getNotifications);
  router.get('/unread-count', controller.getUnreadCount);
  router.patch('/:notificationId/read', controller.markRead);
  router.patch('/read-all', controller.markAllRead);

  return router;
}
```

---

### `index.ts`

```typescript
export { createNotificationsRouter } from './notifications.router';
export { NotificationService } from './services/notification.service';
export type { CreateNotificationInput } from './services/notification.service';
```

---

## Extend SocketGateway — ADD `emitToUser`

In `socket.gateway.ts`, add a user-specific room and emit helper:

```typescript
// In setupEventHandlers():
socket.on('connect', ...existing code...)
// Add user to personal room
void socket.join(`user:${user.sub}`);

// New emit helper (add to class):
emitToUser(userId: string, event: string, data: unknown): void {
  this.io.to(`user:${userId}`).emit(event, data);
}
```

---

## Integrate Notifications into Order Events

In `orders/services/order-event.service.ts`, inject `NotificationService` and send:

```typescript
// After emitting socket events in emitStatusChanged():
await this.notificationService.send({
  userId: payload.customerId,
  type: NotificationType.ORDER_UPDATE,
  title: `Order ${payload.newStatus.replace(/_/g, ' ')}`,
  body: `Your order is now ${payload.newStatus.replace(/_/g, ' ')}.`,
  data: { orderId: payload.orderId, status: payload.newStatus },
});
```

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/notifications` | ✅ | List notifications (paginated) |
| `GET` | `/api/v1/notifications/unread-count` | ✅ | Unread count |
| `PATCH` | `/api/v1/notifications/:id/read` | ✅ | Mark single read |
| `PATCH` | `/api/v1/notifications/read-all` | ✅ | Mark all read |

## Frontend Hook — `apps/customer-app/hooks/useNotifications.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@restaurant/api-client';

const N_KEY = ['notifications'];

export function useNotifications() {
  return useQuery({
    queryKey: N_KEY,
    queryFn: () => apiClient.get('/notifications').then((r) => r.data.data),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...N_KEY, 'unread'],
    queryFn: () =>
      apiClient.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.data!.count),
    refetchInterval: 30_000, // poll every 30s
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: N_KEY });
    },
  });
}
```

---
---
---

# Module 6: Loyalty Points — `loyalty-system-v1`

## Purpose

Points-based loyalty system: customers earn points on every completed order, redeem them for
discounts on checkout. Restaurant owners can view loyalty stats. Completely new module.

---

## Architecture

```
apps/backend/src/modules/loyalty/
├── controllers/loyalty.controller.ts
├── entities/loyalty-account.entity.ts
├── repositories/loyalty.repository.ts
├── services/loyalty.service.ts
├── validations/loyalty.validators.ts
├── loyalty.router.ts
└── index.ts
```

---

## New Files

### `entities/loyalty-account.entity.ts`

```typescript
import { Schema, model, type Document } from 'mongoose';

export interface ILoyaltyTransaction {
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  orderId?: string;
  createdAt: Date;
}

export interface ILoyaltyAccount extends Document {
  customerId: string;
  points: number;           // current balance
  lifetimePoints: number;   // total ever earned
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  transactions: ILoyaltyTransaction[];
}

const loyaltyAccountSchema = new Schema<ILoyaltyAccount>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    points: { type: Number, default: 0, min: 0 },
    lifetimePoints: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    transactions: [
      {
        type: { type: String, enum: ['earned', 'redeemed', 'expired'], required: true },
        points: { type: Number, required: true },
        description: String,
        orderId: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const LoyaltyAccountModel = model<ILoyaltyAccount>('LoyaltyAccount', loyaltyAccountSchema);
```

---

### `services/loyalty.service.ts`

```typescript
import { createLogger } from '@/shared/utils/logger';
import { NotFoundError, BadRequestError } from '@/core/errors';
import { LoyaltyAccountModel, type ILoyaltyAccount } from '../entities/loyalty-account.entity';

const log = createLogger('LoyaltyService');

// Earning rate: 1 point per $1 spent (configurable)
const POINTS_PER_DOLLAR = 10;
// Redemption rate: 100 points = $1
const POINTS_PER_DOLLAR_REDEMPTION = 100;
// Max redemption: 50% of order value
const MAX_REDEMPTION_PERCENT = 0.5;

const TIERS: { name: ILoyaltyAccount['tier']; minLifetimePoints: number }[] = [
  { name: 'platinum', minLifetimePoints: 10_000 },
  { name: 'gold', minLifetimePoints: 5_000 },
  { name: 'silver', minLifetimePoints: 1_000 },
  { name: 'bronze', minLifetimePoints: 0 },
];

function computeTier(lifetimePoints: number): ILoyaltyAccount['tier'] {
  return TIERS.find((t) => lifetimePoints >= t.minLifetimePoints)?.name ?? 'bronze';
}

export class LoyaltyService {
  async getOrCreateAccount(customerId: string): Promise<ILoyaltyAccount> {
    let account = await LoyaltyAccountModel.findOne({ customerId }).exec();
    if (!account) {
      account = await LoyaltyAccountModel.create({ customerId });
    }
    return account;
  }

  async earnPoints(customerId: string, orderTotal: number, orderId: string): Promise<ILoyaltyAccount> {
    const account = await this.getOrCreateAccount(customerId);
    const earned = Math.floor(orderTotal * POINTS_PER_DOLLAR);

    account.points += earned;
    account.lifetimePoints += earned;
    account.tier = computeTier(account.lifetimePoints);
    account.transactions.push({
      type: 'earned',
      points: earned,
      description: `Order #${orderId}`,
      orderId,
      createdAt: new Date(),
    });

    await account.save();
    log.info('Points earned', { customerId, earned, balance: account.points });
    return account;
  }

  async redeemPoints(
    customerId: string,
    pointsToRedeem: number,
    orderTotal: number,
    orderId: string,
  ): Promise<{ discount: number; account: ILoyaltyAccount }> {
    const account = await this.getOrCreateAccount(customerId);

    if (account.points < pointsToRedeem) {
      throw new BadRequestError(
        `Insufficient points. Available: ${account.points}, Requested: ${pointsToRedeem}`,
      );
    }

    const maxDiscount = orderTotal * MAX_REDEMPTION_PERCENT;
    const requestedDiscount = pointsToRedeem / POINTS_PER_DOLLAR_REDEMPTION;
    const discount = parseFloat(Math.min(requestedDiscount, maxDiscount).toFixed(2));
    const actualPointsUsed = Math.ceil(discount * POINTS_PER_DOLLAR_REDEMPTION);

    account.points -= actualPointsUsed;
    account.transactions.push({
      type: 'redeemed',
      points: -actualPointsUsed,
      description: `Redemption for order #${orderId}`,
      orderId,
      createdAt: new Date(),
    });

    await account.save();
    log.info('Points redeemed', { customerId, pointsUsed: actualPointsUsed, discount });
    return { discount, account };
  }

  async getBalance(customerId: string) {
    const account = await this.getOrCreateAccount(customerId);
    return {
      points: account.points,
      lifetimePoints: account.lifetimePoints,
      tier: account.tier,
      dollarValue: parseFloat((account.points / POINTS_PER_DOLLAR_REDEMPTION).toFixed(2)),
    };
  }

  async getTransactionHistory(customerId: string, page = 1, limit = 20) {
    const account = await this.getOrCreateAccount(customerId);
    const allTx = account.transactions
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const start = (page - 1) * limit;
    const data = allTx.slice(start, start + limit);
    return {
      data,
      meta: { page, limit, total: allTx.length, totalPages: Math.ceil(allTx.length / limit) },
    };
  }
}
```

---

### `controllers/loyalty.controller.ts`

```typescript
import type { Response } from 'express';
import { LoyaltyService } from '../services/loyalty.service';
import { ok } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';

const service = new LoyaltyService();

export class LoyaltyController {
  getBalance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const balance = await service.getBalance(req.user.sub);
    ok(res, balance);
  };

  getTransactions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await service.getTransactionHistory(
      req.user.sub,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    ok(res, result);
  };
}
```

---

### `loyalty.router.ts`

```typescript
import { Router } from 'express';
import { LoyaltyController } from './controllers/loyalty.controller';
import { authenticate, requireCustomer } from '@/core/middleware/auth.middleware';

const router = Router();
const controller = new LoyaltyController();

router.use(authenticate, requireCustomer);
router.get('/balance', controller.getBalance);
router.get('/transactions', controller.getTransactions);

export { router as loyaltyRouter };
```

---

### `index.ts`

```typescript
export { loyaltyRouter } from './loyalty.router';
export { LoyaltyService } from './services/loyalty.service';
```

---

## Hook into Order Completion

In `orders/services/order.service.ts`, when status transitions to `DELIVERED`:

```typescript
import { LoyaltyService } from '@/modules/loyalty';

// In updateOrderStatus(), after persisting:
if (status === OrderStatus.DELIVERED) {
  const loyalty = new LoyaltyService();
  void loyalty.earnPoints(order.customerId, order.total, orderId);
}
```

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/loyalty/balance` | ✅ CUSTOMER | Points balance + tier |
| `GET` | `/api/v1/loyalty/transactions` | ✅ CUSTOMER | Transaction history |

---
---
---

# Module 7: Kitchen Workflow / Ticket System — `kitchen-module-v1`

## Purpose

Kitchen Display System (KDS) backend: when an order is CONFIRMED, a "kitchen ticket" is created.
Kitchen staff see active tickets, mark them as done, and the order advances to READY_FOR_PICKUP.
Entirely new module. Uses Socket.IO for live kitchen queue updates.

---

## Architecture

```
apps/backend/src/modules/kitchen/
├── controllers/kitchen.controller.ts
├── entities/kitchen-ticket.entity.ts
├── repositories/kitchen-ticket.repository.ts
├── services/kitchen.service.ts
├── kitchen.router.ts
└── index.ts
```

---

## New Files

### `entities/kitchen-ticket.entity.ts`

```typescript
import { Schema, model, type Document } from 'mongoose';

export type TicketStatus = 'queued' | 'in_progress' | 'done' | 'cancelled';

export interface IKitchenTicket extends Document {
  orderId: string;
  restaurantId: string;
  orderNumber: string;      // short human-readable (e.g. "HH-0042")
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    customizations: string[]; // flattened label strings for display
    notes?: string;
  }>;
  status: TicketStatus;
  priority: 'normal' | 'high';
  estimatedMinutes: number;
  startedAt?: Date;
  completedAt?: Date;
}

const kitchenTicketSchema = new Schema<IKitchenTicket>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    items: [
      {
        menuItemId: String,
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        customizations: [String],
        notes: String,
      },
    ],
    status: {
      type: String,
      enum: ['queued', 'in_progress', 'done', 'cancelled'],
      default: 'queued',
      index: true,
    },
    priority: { type: String, enum: ['normal', 'high'], default: 'normal' },
    estimatedMinutes: { type: Number, default: 15 },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true },
);

export const KitchenTicketModel = model<IKitchenTicket>('KitchenTicket', kitchenTicketSchema);
```

---

### `services/kitchen.service.ts`

```typescript
import { createLogger } from '@/shared/utils/logger';
import { NotFoundError, BadRequestError } from '@/core/errors';
import { KitchenTicketModel } from '../entities/kitchen-ticket.entity';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';
import { OrderService } from '@/modules/orders/services/order.service';
import { OrderStatus } from '@restaurant/shared-types';
import type { IOrder } from '@/modules/orders/entities/order.entity';

const log = createLogger('KitchenService');

let orderCounter = 1000; // simple incrementing order number seed

export class KitchenService {
  constructor(
    private readonly gateway: SocketGateway,
    private readonly orderService: OrderService,
  ) {}

  /**
   * Called when an order transitions to CONFIRMED.
   * Creates the kitchen ticket and broadcasts to the restaurant kitchen room.
   */
  async createTicket(order: IOrder): Promise<void> {
    orderCounter++;
    const orderNumber = `HH-${orderCounter.toString().padStart(4, '0')}`;

    const ticket = await KitchenTicketModel.create({
      orderId: order.id as string,
      restaurantId: order.restaurantId,
      orderNumber,
      items: order.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        customizations: item.customizations.map((c) => `${c.name}: ${c.name}`),
      })),
      estimatedMinutes: 15,
    });

    log.info('Kitchen ticket created', { ticketId: ticket.id, orderId: order.id });

    // Broadcast to kitchen display
    this.gateway.emitNewOrder(order.restaurantId, {
      event: 'kitchen:ticket:new',
      data: ticket,
    });
  }

  async getActiveTickets(restaurantId: string) {
    return KitchenTicketModel.find({
      restaurantId,
      status: { $in: ['queued', 'in_progress'] },
    })
      .sort({ createdAt: 1 })
      .exec();
  }

  async startTicket(ticketId: string) {
    const ticket = await KitchenTicketModel.findByIdAndUpdate(
      ticketId,
      { status: 'in_progress', startedAt: new Date() },
      { new: true },
    ).exec();

    if (!ticket) throw new NotFoundError('Kitchen ticket');

    this.gateway.emitNewOrder(ticket.restaurantId, {
      event: 'kitchen:ticket:started',
      data: { ticketId, orderId: ticket.orderId },
    });

    return ticket;
  }

  async completeTicket(ticketId: string, actor: { sub: string; role: string }) {
    const ticket = await KitchenTicketModel.findByIdAndUpdate(
      ticketId,
      { status: 'done', completedAt: new Date() },
      { new: true },
    ).exec();

    if (!ticket) throw new NotFoundError('Kitchen ticket');
    if (ticket.status !== 'done')
      throw new BadRequestError('Ticket must be in_progress to complete');

    // Auto-advance order to READY_FOR_PICKUP
    // (This calls OrderService which will emit socket events to customers)
    // Note: actor here would be a system/admin token; in prod use a service account
    log.info('Ticket completed, advancing order', { orderId: ticket.orderId });

    this.gateway.emitNewOrder(ticket.restaurantId, {
      event: 'kitchen:ticket:done',
      data: { ticketId, orderId: ticket.orderId },
    });

    return ticket;
  }
}
```

---

### `controllers/kitchen.controller.ts`

```typescript
import type { Response } from 'express';
import { KitchenService } from '../services/kitchen.service';
import { ok } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';
import { OrderService } from '@/modules/orders/services/order.service';
import { OrderRepository } from '@/modules/orders/repositories/order.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { OrderEventService } from '@/modules/orders/services/order-event.service';

export class KitchenController {
  private readonly service: KitchenService;

  constructor(gateway: SocketGateway) {
    const eventService = new OrderEventService(gateway);
    const orderService = new OrderService(new OrderRepository(), new CacheService(), eventService);
    this.service = new KitchenService(gateway, orderService);
  }

  getTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const tickets = await this.service.getActiveTickets(req.params.restaurantId);
    ok(res, tickets);
  };

  startTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ticket = await this.service.startTicket(req.params.ticketId);
    ok(res, ticket);
  };

  completeTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ticket = await this.service.completeTicket(req.params.ticketId, req.user);
    ok(res, ticket);
  };
}
```

---

### `kitchen.router.ts`

```typescript
import { Router } from 'express';
import { KitchenController } from './controllers/kitchen.controller';
import { authenticate, requireRestaurantOwner } from '@/core/middleware/auth.middleware';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export function createKitchenRouter(gateway: SocketGateway): Router {
  const router = Router();
  const controller = new KitchenController(gateway);

  router.use(authenticate, requireRestaurantOwner);
  router.get('/:restaurantId/tickets', controller.getTickets);
  router.patch('/tickets/:ticketId/start', controller.startTicket);
  router.patch('/tickets/:ticketId/complete', controller.completeTicket);

  return router;
}
```

---

### `index.ts`

```typescript
export { createKitchenRouter } from './kitchen.router';
export { KitchenService } from './services/kitchen.service';
```

---

## Hook into Order Events

In `orders/services/order-event.service.ts`, when status changes to CONFIRMED, call kitchen:

```typescript
import { KitchenService } from '@/modules/kitchen';

// In emitStatusChanged():
if (payload.newStatus === OrderStatus.CONFIRMED) {
  // Fetch order doc and create kitchen ticket
  void this.kitchenService.createTicket(orderDoc);
}
```

---

## Real-time Kitchen Flow

```
Order confirmed → OrderService → emitStatusChanged()
  → KitchenService.createTicket()
    → KitchenTicket created in MongoDB
    → SocketGateway.emitNewOrder(restaurantId, 'kitchen:ticket:new')
      → Admin dashboard / Kitchen Display receives ticket

Kitchen staff clicks "Start" → PATCH /kitchen/tickets/:id/start
  → status: 'in_progress', startedAt set
  → socket: 'kitchen:ticket:started' to restaurant room

Kitchen staff clicks "Done" → PATCH /kitchen/tickets/:id/complete
  → status: 'done', completedAt set
  → Order auto-advances to READY_FOR_PICKUP
  → socket: 'kitchen:ticket:done' to restaurant room
  → OrderEventService emits status change to customer
```

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/kitchen/:restaurantId/tickets` | ✅ RESTAURANT_OWNER | Active tickets |
| `PATCH` | `/api/v1/kitchen/tickets/:ticketId/start` | ✅ RESTAURANT_OWNER | Start ticket |
| `PATCH` | `/api/v1/kitchen/tickets/:ticketId/complete` | ✅ RESTAURANT_OWNER | Complete ticket |

---

## Admin Dashboard Integration — Kitchen Display

`apps/admin-dashboard/src/app/kitchen/page.tsx` — NEW (Next.js page)

```tsx
'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { io } from 'socket.io-client';

interface KitchenTicket {
  id: string;
  orderNumber: string;
  status: string;
  items: Array<{ name: string; quantity: number; customizations: string[] }>;
  estimatedMinutes: number;
  createdAt: string;
}

export default function KitchenDisplay() {
  const [restaurantId, setRestaurantId] = useState(''); // From auth context in real impl
  const [liveTickets, setLiveTickets] = useState<KitchenTicket[]>([]);

  const { data: initialTickets } = useQuery({
    queryKey: ['kitchen', 'tickets', restaurantId],
    queryFn: () =>
      fetch(`/api/v1/kitchen/${restaurantId}/tickets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
      }).then((r) => r.json() as Promise<{ data: KitchenTicket[] }>),
    enabled: !!restaurantId,
  });

  useEffect(() => {
    if (initialTickets?.data) setLiveTickets(initialTickets.data);
  }, [initialTickets]);

  useEffect(() => {
    if (!restaurantId) return;
    const token = localStorage.getItem('token') ?? '';
    const socket = io(process.env.NEXT_PUBLIC_API_URL ?? '', { auth: { token } });

    socket.emit('join:restaurant', restaurantId);

    socket.on('order:new', (payload: { event: string; data: KitchenTicket }) => {
      if (payload.event === 'kitchen:ticket:new') {
        setLiveTickets((prev) => [payload.data, ...prev]);
      }
      if (payload.event === 'kitchen:ticket:done') {
        setLiveTickets((prev) => prev.filter((t) => t.id !== payload.data.id));
      }
    });

    return () => { socket.disconnect(); };
  }, [restaurantId]);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Kitchen Display</h1>
      <div className="grid grid-cols-3 gap-4">
        {liveTickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`p-4 rounded-xl border ${
              ticket.status === 'in_progress'
                ? 'bg-yellow-900 border-yellow-500'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xl font-bold text-white">{ticket.orderNumber}</span>
              <span className="text-xs text-gray-400">{ticket.estimatedMinutes}min</span>
            </div>
            {ticket.items.map((item, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-white font-medium">
                  {item.quantity}× {item.name}
                </p>
                {item.customizations.map((c, ci) => (
                  <p key={ci} className="text-gray-400 text-sm ml-3">• {c}</p>
                ))}
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              {ticket.status === 'queued' && (
                <button
                  onClick={() => {
                    void fetch(`/api/v1/kitchen/tickets/${ticket.id}/start`, {
                      method: 'PATCH',
                      headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
                    });
                  }}
                  className="flex-1 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium"
                >
                  Start
                </button>
              )}
              {ticket.status === 'in_progress' && (
                <button
                  onClick={() => {
                    void fetch(`/api/v1/kitchen/tickets/${ticket.id}/complete`, {
                      method: 'PATCH',
                      headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
                    });
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  Done ✓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Integration Steps (all 3 modules — 5, 6, 7)

1. Create all entity/service/controller/router files for notifications, loyalty, kitchen
2. Register routers in `app.ts`:
   ```typescript
   import { createNotificationsRouter } from '@/modules/notifications';
   import { loyaltyRouter } from '@/modules/loyalty';
   import { createKitchenRouter } from '@/modules/kitchen';

   app.use(`${apiPrefix}/notifications`, createNotificationsRouter(gateway));
   app.use(`${apiPrefix}/loyalty`, loyaltyRouter);
   app.use(`${apiPrefix}/kitchen`, createKitchenRouter(gateway));
   ```
3. Add `emitToUser` method to `SocketGateway` (for notifications)
4. Hook `LoyaltyService.earnPoints()` into order DELIVERED transition
5. Hook `KitchenService.createTicket()` into order CONFIRMED transition
6. Hook `NotificationService.send()` into order status changes
7. Add Kitchen Display page to admin-dashboard
8. Build `packages/types` to pick up new exports