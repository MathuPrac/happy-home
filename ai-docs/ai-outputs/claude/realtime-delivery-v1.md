# Module 4: Real-time Delivery Tracking — `realtime-delivery-v1`

## Purpose

End-to-end real-time delivery tracking: rider location streaming, ETA calculation, and live
status updates across all clients. Built on the existing `SocketGateway` and extends it with
authenticated rooms, rider location persistence in Redis, and a REST endpoint to fetch last-known
rider location.

---

## Architecture

```
apps/backend/src/
├── infrastructure/messaging/
│   ├── socket.gateway.ts          ← EXTEND (add auth, rider rooms, location emit)
│   └── socket.auth.ts             ← NEW  (JWT auth for Socket.IO connections)
├── modules/riders/
│   ├── controllers/
│   │   └── riders.controller.ts   ← NEW
│   ├── services/
│   │   └── rider.service.ts       ← NEW
│   ├── entities/
│   │   └── rider.entity.ts        ← NEW
│   ├── repositories/
│   │   └── rider.repository.ts    ← NEW
│   ├── validations/
│   │   └── rider.validators.ts    ← NEW
│   ├── riders.router.ts           ← REPLACE (skeleton exists)
│   └── index.ts                   ← NEW

packages/types/src/realtime.ts     ← NEW shared Socket.IO event contracts
```

---

## Backend — New Files

### 1. `packages/types/src/realtime.ts` — NEW

Shared event-type contracts used by server and all clients.

```typescript
export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_ORDER: 'join:order',
  JOIN_RESTAURANT: 'join:restaurant',
  JOIN_RIDER: 'join:rider',
  RIDER_LOCATION_UPDATE: 'rider:location:update',

  // Server → Client
  ORDER_STATUS_CHANGED: 'order:status:changed',
  ORDER_NEW: 'order:new',
  RIDER_LOCATION: 'rider:location',
  RIDER_ASSIGNED: 'order:rider:assigned',
  ERROR: 'error',
} as const;

export type SocketEventType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface RiderLocationPayload {
  riderId: string;
  orderId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;   // m/s
  timestamp: string; // ISO
}

export interface OrderStatusPayload {
  orderId: string;
  status: string;
  previousStatus: string;
  changedAt: string;
  estimatedDeliveryTime?: string;
}
```

Export from `packages/types/src/index.ts`:
```typescript
export * from './realtime';
```

---

### 2. `apps/backend/src/infrastructure/messaging/socket.auth.ts` — NEW

JWT authentication middleware for Socket.IO connections.

```typescript
import type { Socket } from 'socket.io';
import { jwtService } from '@/modules/auth/services/jwt.service';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('SocketAuth');

export async function authenticateSocket(socket: Socket): Promise<boolean> {
  try {
    const token =
      (socket.handshake.auth['token'] as string | undefined) ??
      (socket.handshake.headers.authorization?.split(' ')[1]);

    if (!token) {
      log.warn('Socket connection rejected: no token', { id: socket.id });
      socket.emit('error', { code: 'NO_TOKEN', message: 'Authentication token required' });
      return false;
    }

    const payload = await jwtService.verifyAccessToken(token);
    // Attach to socket data for downstream handlers
    socket.data = { ...socket.data, user: payload };
    return true;
  } catch {
    log.warn('Socket connection rejected: invalid token', { id: socket.id });
    socket.emit('error', { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' });
    return false;
  }
}
```

---

### 3. `apps/backend/src/infrastructure/messaging/socket.gateway.ts` — REPLACE

Extended with: auth, rider rooms, location caching in Redis, ETA broadcasting.

```typescript
import type { Server, Socket } from 'socket.io';
import { createLogger } from '@/shared/utils/logger';
import { authenticateSocket } from './socket.auth';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { SOCKET_EVENTS, type RiderLocationPayload } from '@restaurant/shared-types';

const log = createLogger('SocketGateway');
const LOCATION_TTL = 60 * 10; // 10 minutes

function riderLocationKey(riderId: string): string {
  return `rider:location:${riderId}`;
}

export class SocketGateway {
  private readonly cache = new CacheService();

  constructor(private readonly io: Server) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Auth middleware for every connection
    this.io.use(async (socket, next) => {
      const ok = await authenticateSocket(socket);
      if (ok) {
        next();
      } else {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user as { sub: string; role: string };
      log.info('Client connected', { socketId: socket.id, userId: user?.sub, role: user?.role });

      // Join order tracking room (any authenticated user)
      socket.on(SOCKET_EVENTS.JOIN_ORDER, (orderId: string) => {
        void socket.join(`order:${orderId}`);
        log.debug('Joined order room', { socketId: socket.id, orderId });
      });

      // Join restaurant dashboard room (restaurant owners / admins)
      socket.on(SOCKET_EVENTS.JOIN_RESTAURANT, (restaurantId: string) => {
        if (!['restaurant_owner', 'admin'].includes(user?.role ?? '')) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Unauthorized for restaurant room' });
          return;
        }
        void socket.join(`restaurant:${restaurantId}`);
        log.debug('Joined restaurant room', { socketId: socket.id, restaurantId });
      });

      // Rider-specific room
      socket.on(SOCKET_EVENTS.JOIN_RIDER, (riderId: string) => {
        if (user?.role !== 'rider' && user?.role !== 'admin') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Unauthorized for rider room' });
          return;
        }
        void socket.join(`rider:${riderId}`);
        log.debug('Joined rider room', { socketId: socket.id, riderId });
      });

      // Rider location update (riders only)
      socket.on(
        SOCKET_EVENTS.RIDER_LOCATION_UPDATE,
        (payload: Omit<RiderLocationPayload, 'timestamp'>) => {
          if (user?.role !== 'rider') {
            socket.emit(SOCKET_EVENTS.ERROR, { message: 'Only riders can emit location' });
            return;
          }

          const fullPayload: RiderLocationPayload = {
            ...payload,
            riderId: user.sub, // enforce server-side riderId — never trust client
            timestamp: new Date().toISOString(),
          };

          // Persist last location in Redis
          void this.cache.set(
            riderLocationKey(user.sub),
            { lat: fullPayload.lat, lng: fullPayload.lng, heading: fullPayload.heading },
            LOCATION_TTL,
          );

          // Broadcast to order tracking room
          if (fullPayload.orderId) {
            this.io
              .to(`order:${fullPayload.orderId}`)
              .emit(SOCKET_EVENTS.RIDER_LOCATION, fullPayload);
          }

          log.debug('Rider location updated', {
            riderId: user.sub,
            lat: fullPayload.lat,
            lng: fullPayload.lng,
          });
        },
      );

      socket.on('disconnect', (reason) => {
        log.info('Client disconnected', { socketId: socket.id, reason });
      });
    });
  }

  // ── Emit helpers used by OrderEventService ──

  emitOrderUpdate(orderId: string, data: unknown): void {
    this.io.to(`order:${orderId}`).emit(SOCKET_EVENTS.ORDER_STATUS_CHANGED, data);
  }

  emitNewOrder(restaurantId: string, data: unknown): void {
    this.io.to(`restaurant:${restaurantId}`).emit(SOCKET_EVENTS.ORDER_NEW, data);
  }

  emitRiderAssigned(orderId: string, data: unknown): void {
    this.io.to(`order:${orderId}`).emit(SOCKET_EVENTS.RIDER_ASSIGNED, data);
  }

  // REST-usable: get last known rider location from Redis
  async getLastRiderLocation(
    riderId: string,
  ): Promise<{ lat: number; lng: number; heading?: number } | null> {
    return this.cache.get(riderLocationKey(riderId));
  }
}
```

---

### 4. `apps/backend/src/modules/riders/entities/rider.entity.ts` — NEW

```typescript
import { Schema, model, type Document } from 'mongoose';
import { RiderStatus } from '@restaurant/shared-types';

export interface IRider extends Document {
  userId: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  status: RiderStatus;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
  isVerified: boolean;
  isActive: boolean;
}

const riderSchema = new Schema<IRider>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    vehicleType: { type: String, required: true },
    vehicleNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(RiderStatus),
      default: RiderStatus.OFFLINE,
      index: true,
    },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const RiderModel = model<IRider>('Rider', riderSchema);
```

---

### 5. `apps/backend/src/modules/riders/repositories/rider.repository.ts` — NEW

```typescript
import { BaseRepository } from '@/infrastructure/database/mongodb/base.repository';
import { RiderModel, type IRider } from '../entities/rider.entity';
import { RiderStatus } from '@restaurant/shared-types';

export class RiderRepository extends BaseRepository<IRider> {
  constructor() {
    super(RiderModel);
  }

  async findAvailableRiders() {
    return this.model.find({ status: RiderStatus.AVAILABLE, isVerified: true, isActive: true }).exec();
  }

  async findByUserId(userId: string): Promise<IRider | null> {
    return this.model.findOne({ userId }).exec();
  }

  async setStatus(userId: string, status: RiderStatus): Promise<IRider | null> {
    return this.model
      .findOneAndUpdate({ userId }, { status }, { new: true })
      .exec();
  }

  async incrementDeliveries(userId: string, earnings: number): Promise<void> {
    await this.model
      .updateOne({ userId }, { $inc: { totalDeliveries: 1, totalEarnings: earnings } })
      .exec();
  }
}
```

---

### 6. `apps/backend/src/modules/riders/services/rider.service.ts` — NEW

```typescript
import { createLogger } from '@/shared/utils/logger';
import { NotFoundError, BadRequestError } from '@/core/errors';
import { RiderRepository } from '../repositories/rider.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { RiderStatus } from '@restaurant/shared-types';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

const log = createLogger('RiderService');

export class RiderService {
  constructor(
    private readonly riderRepo: RiderRepository,
    private readonly cache: CacheService,
    private readonly gateway: SocketGateway,
  ) {}

  async getRiderProfile(userId: string) {
    const rider = await this.riderRepo.findByUserId(userId);
    if (!rider) throw new NotFoundError('Rider profile');
    return rider;
  }

  async updateStatus(userId: string, status: RiderStatus) {
    const rider = await this.riderRepo.setStatus(userId, status);
    if (!rider) throw new NotFoundError('Rider profile');
    log.info('Rider status updated', { userId, status });
    return rider;
  }

  async getLastLocation(riderId: string) {
    const location = await this.gateway.getLastRiderLocation(riderId);
    if (!location) throw new NotFoundError('Rider location');
    return location;
  }

  async getAvailableRiders() {
    const cacheKey = 'riders:available';
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const riders = await this.riderRepo.findAvailableRiders();
    await this.cache.set(cacheKey, riders, 15); // 15s TTL — availability is volatile
    return riders;
  }
}
```

---

### 7. `apps/backend/src/modules/riders/validations/rider.validators.ts` — NEW

```typescript
import { z } from 'zod';
import { RiderStatus } from '@restaurant/shared-types';

export const updateRiderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(RiderStatus),
  }),
});
```

---

### 8. `apps/backend/src/modules/riders/controllers/riders.controller.ts` — NEW

```typescript
import type { Response } from 'express';
import { RiderService } from '../services/rider.service';
import { RiderRepository } from '../repositories/rider.repository';
import { CacheService } from '@/infrastructure/cache/redis/cache.service';
import { ok } from '@/shared/http/response';
import type { AuthenticatedRequest } from '@/types';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export class RidersController {
  private readonly service: RiderService;

  constructor(gateway: SocketGateway) {
    this.service = new RiderService(new RiderRepository(), new CacheService(), gateway);
  }

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const rider = await this.service.getRiderProfile(req.user.sub);
    ok(res, rider);
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const rider = await this.service.updateStatus(req.user.sub, req.body.status);
    ok(res, rider);
  };

  getLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const location = await this.service.getLastLocation(req.params.riderId);
    ok(res, location);
  };

  getAvailable = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const riders = await this.service.getAvailableRiders();
    ok(res, riders);
  };
}
```

---

### 9. `apps/backend/src/modules/riders/riders.router.ts` — REPLACE

```typescript
import { Router } from 'express';
import { RidersController } from './controllers/riders.controller';
import {
  authenticate,
  requireRider,
  requireRestaurantOwner,
  requireAdmin,
} from '@/core/middleware/auth.middleware';
import { validate } from '@/core/middleware/validate.middleware';
import { updateRiderStatusSchema } from './validations/rider.validators';
import type { SocketGateway } from '@/infrastructure/messaging/socket.gateway';

export function createRidersRouter(gateway: SocketGateway): Router {
  const router = Router();
  const controller = new RidersController(gateway);

  // Rider self
  router.get('/me', authenticate, requireRider, controller.getProfile);
  router.patch(
    '/me/status',
    authenticate,
    requireRider,
    validate(updateRiderStatusSchema),
    controller.updateStatus,
  );

  // Available riders — restaurant owner / admin
  router.get('/available', authenticate, requireRestaurantOwner, controller.getAvailable);

  // Last known location — restaurant owner, customer tracking
  router.get('/:riderId/location', authenticate, controller.getLocation);

  return router;
}
```

---

### 10. `apps/backend/src/modules/riders/index.ts` — NEW

```typescript
export { createRidersRouter } from './riders.router';
export { RiderService } from './services/rider.service';
export { RiderRepository } from './repositories/rider.repository';
```

---

## Existing File Changes

### `apps/backend/src/app.ts`

```typescript
import { createRidersRouter } from '@/modules/riders';
// ...
app.use(`${apiPrefix}/riders`, createRidersRouter(gateway));
```

---

## API Routes

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/api/v1/riders/me` | ✅ | RIDER | Get own rider profile |
| `PATCH` | `/api/v1/riders/me/status` | ✅ | RIDER | Go online/offline |
| `GET` | `/api/v1/riders/available` | ✅ | RESTAURANT_OWNER | List available riders |
| `GET` | `/api/v1/riders/:riderId/location` | ✅ | any | Get last-known location |

---

## Real-time Flow

```
Rider opens app → connects WebSocket with JWT token
  → Socket.IO auth middleware verifies token
  → socket.data.user set with { sub, role }

Rider joins own rider room:
  socket.emit('join:rider', riderId)

Rider updates location every ~3 seconds:
  socket.emit('rider:location:update', { orderId, lat, lng, heading, speed })
  → Server validates user.role === 'rider'
  → Caches in Redis: rider:location:{riderId} (TTL 10min)
  → Broadcasts to order:{orderId} room:
      socket.emit('rider:location', { riderId, orderId, lat, lng, heading, timestamp })

Customer opens order tracking screen:
  socket.emit('join:order', orderId)
  → Receives 'rider:location' events in real time
  → Receives 'order:status:changed' events
```

---

## Frontend Integration

### Customer App — `apps/customer-app/hooks/useRiderTracking.ts` — NEW

```typescript
import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import io, { type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/config';
import type { RiderLocationPayload } from '@restaurant/shared-types';

interface UseRiderTrackingResult {
  riderLocation: { lat: number; lng: number; heading?: number } | null;
  isConnected: boolean;
}

export function useRiderTracking(orderId: string, token: string): UseRiderTrackingResult {
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (!orderId || !token) return;

    const socket = io(API_BASE_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:order', orderId);
    });

    socket.on('rider:location', (payload: RiderLocationPayload) => {
      setRiderLocation({ lat: payload.lat, lng: payload.lng, heading: payload.heading });
    });

    socket.on('order:status:changed', () => {
      void qc.invalidateQueries({ queryKey: ['orders', orderId] });
    });

    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [orderId, token, qc]);

  return { riderLocation, isConnected };
}
```

### Rider App — `apps/rider-app/hooks/useLocationStream.ts` — NEW

```typescript
import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import io, { type Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/config';

const LOCATION_INTERVAL_MS = 3000;

export function useLocationStream(activeOrderId: string | null, token: string) {
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io(API_BASE_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[LocationStream] Connected');
    });

    return () => {
      socket.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token]);

  useEffect(() => {
    if (!activeOrderId || !socketRef.current) return;

    const socket = socketRef.current;

    // Start streaming location
    const startStreaming = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      intervalRef.current = setInterval(async () => {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        socket.emit('rider:location:update', {
          orderId: activeOrderId,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          heading: loc.coords.heading ?? undefined,
          speed: loc.coords.speed ?? undefined,
        });
      }, LOCATION_INTERVAL_MS);
    };

    void startStreaming();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeOrderId]);
}
```

---

## Environment Variables

No new env vars. The socket authentication uses existing `JWT_ACCESS_SECRET`.

---

## Dependencies

**Rider app only:**
```
expo-location  # already in customer-app; add to rider-app package.json
```

```json
// apps/rider-app/package.json — ADD to dependencies
"expo-location": "~17.0.1",
"socket.io-client": "^4.7.5"
```

---

## Integration Steps

1. Create `packages/types/src/realtime.ts` and export from index
2. Create `socket.auth.ts`
3. Replace `socket.gateway.ts` (note: this changes the API — `emitOrderUpdate` signature unchanged)
4. Create rider entity, repository, service, validators, controller
5. Replace `riders.router.ts` (now a factory function like orders)
6. Update `app.ts` to pass gateway to riders router
7. Add `useRiderTracking` to customer-app
8. Add `useLocationStream` to rider-app
9. Add `expo-location` to rider-app package.json

---

## Testing Flow

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: WebSocket client (wscat or Postman WS)
wscat -c ws://localhost:4000 -H "Authorization: Bearer <rider_token>"

# Emit from rider (after connection)
{ "event": "join:rider", "data": "rider_id" }
{ "event": "rider:location:update", "data": { "orderId": "xxx", "lat": 6.9271, "lng": 79.8612, "heading": 270 } }

# Terminal 3: Customer WebSocket client
wscat -c ws://localhost:4000 -H "Authorization: Bearer <customer_token>"
{ "event": "join:order", "data": "xxx" }
# Should receive: { event: "rider:location", data: { riderId, orderId, lat, lng, ... } }

# REST location fetch
GET /api/v1/riders/<riderId>/location
# → { lat: 6.9271, lng: 79.8612 }
```