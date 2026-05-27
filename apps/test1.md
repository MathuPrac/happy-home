# Backend QA Verification Report
**Project:** Happy Home Ecosystem — Restaurant Backend  
**Stack:** Node.js + TypeScript + Express + MongoDB + Redis + Socket.IO  
**Date:** 2026-05-27  
**Auditor:** Senior Backend QA Engineer (Static Code Analysis)

---

## A. SUMMARY REPORT

### Overall Backend Health Score: **52 / 100**

| Category | Score | Verdict |
|---|---|---|
| Architecture & Structure | 78/100 | Good foundation |
| Auth & JWT | 72/100 | Solid, has flaws |
| Validation | 60/100 | Partial |
| Order System | 55/100 | Critical gaps |
| FSM | 80/100 | Mostly correct |
| RBAC | 65/100 | Works, has holes |
| Data Consistency | 50/100 | Schema issues |
| Security | 40/100 | Multiple risks |
| API Consistency | 55/100 | Inconsistent |
| Test Coverage | 0/100 | None |

**Verdict: NOT production-ready.** The backend has a well-designed core but suffers from 5 unimplemented modules (stub routers), critical security vulnerabilities in the Socket.IO layer, unsafe client-trust in order pricing, missing ownership checks, zero test coverage, and a committed `.env` file with plaintext secrets.

---

### Critical Issues (must fix before any frontend integration)

1. **5 modules are stub-only** — `users`, `restaurants`, `menu`, `riders`, `payments` routers are empty `// TODO` files. All routes under these paths return 404.
2. **Order pricing trusts the client** — `deliveryFee` and `discount` are accepted directly from `req.body` with no server-side verification. A client can send `deliveryFee: 0` and `discount: 9999` to get orders for free.
3. **No restaurant or menu item validation on order creation** — `restaurantId` and `menuItemId` values are saved without checking they exist in the DB.
4. **Socket.IO has zero authentication** — Any anonymous client can call `join:order` or `join:restaurant` with any ID and receive real-time order updates including customer and payment data.
5. **Socket.IO rider location spoofing** — Any unauthenticated client can emit `rider:location` with any `orderId` and broadcast fake GPS coordinates to customers.
6. **`GET /orders/:id` has no ownership check** — Any authenticated user of any role can retrieve any order by guessing its ID.
7. **`.env` with real-looking secrets is committed to the repository** (confirmed in the zip).
8. **Zero automated tests** — No `.test.ts` or `.spec.ts` files exist anywhere in the codebase.

### Medium Issues

1. New users are created with `status: UserStatus.ACTIVE` instead of `UserStatus.PENDING_VERIFICATION`, bypassing the email verification gate that is coded into the login flow.
2. `RESTAURANT_OWNER` and `RIDER` roles can self-register via `POST /auth/register` — only `ADMIN` is blocked.
3. `OrdersController` has no `try/catch` blocks and no `next(err)` calls. It relies entirely on `express-async-errors` from `main.ts` — this is fragile; if the import order ever changes, errors will silently crash the process.
4. Pagination `sortBy` field is passed unsanitized directly into a MongoDB sort object. Any field name (including internal `__v`, `passwordHash`) can be used to sort queries.
5. Incomplete cache invalidation on `updateOrderStatus` — the cache key `orders:customer:{id}:{page}` is never cleared when an order's status changes, so customers see stale order states.
6. `PaginationMeta` field naming is inconsistent across the codebase (`hasNext`/`hasPrev` in `BaseRepository`, `hasNextPage`/`hasPrevPage` in `types/index.ts`, mixing both in `response.ts`).
7. `restaurantId` ownership is not verified in `GET /orders/restaurant/:restaurantId` — any `RESTAURANT_OWNER` can query any restaurant's orders.

### Minor Issues

1. Duplicate Zod schema: `create-order.dto.ts` and `order.validators.ts` both define `createOrderSchema` with differing validation rules. The router uses the validators version; the DTO version is dead code.
2. Empty files: `src/modules/orders/order.service.ts` and `src/server.ts` are 0 bytes — dead files that should be removed.
3. `express-validator` is listed as a dependency but is never used (Zod is used instead). Adds unnecessary bundle weight.
4. `multer` is listed as a dependency but has no implementation.
5. Request body limit is `10mb` — unnecessarily large for a JSON REST API; raises DoS risk.
6. `isPrivateMethod` `isValidTransition` in `OrderService` is defined but never called (dead code).
7. Log files are committed to the repository.
8. Dev `.env` has JWT secrets with placeholder text (`change-me`) rather than real random values even for development.

---

## B. BROKEN / NON-FUNCTIONAL ENDPOINTS LIST

All routes below are registered in `app.ts` but return a 404 or empty response because the router is a stub:

| Method | Path | Status | Reason |
|---|---|---|---|
| ALL | `/api/v1/users/*` | ❌ BROKEN | `usersRouter` is empty stub |
| ALL | `/api/v1/restaurants/*` | ❌ BROKEN | `restaurantsRouter` is empty stub |
| ALL | `/api/v1/menu/*` | ❌ BROKEN | `menuRouter` is empty stub |
| ALL | `/api/v1/riders/*` | ❌ BROKEN | `ridersRouter` is empty stub |
| ALL | `/api/v1/payments/*` | ❌ BROKEN | `paymentsRouter` is empty stub |
| GET | `/api/v1/orders/:id` | ⚠️ INSECURE | No ownership check — exposes any order to any user |
| PATCH | `/api/v1/orders/:orderId/status` | ⚠️ PARTIAL | riderId can be set by anyone without verification |

**Working endpoints (code-verified):**

| Method | Path | Auth | Role |
|---|---|---|---|
| POST | `/api/v1/auth/register` | None | Public |
| POST | `/api/v1/auth/login` | None | Public |
| POST | `/api/v1/auth/refresh` | None | Public |
| POST | `/api/v1/auth/logout` | Bearer JWT | Any authenticated |
| GET | `/api/v1/auth/me` | Bearer JWT | Any authenticated |
| POST | `/api/v1/orders` | Bearer JWT | CUSTOMER / ADMIN |
| GET | `/api/v1/orders/my` | Bearer JWT | CUSTOMER / ADMIN |
| GET | `/api/v1/orders/restaurant/:restaurantId` | Bearer JWT | RESTAURANT_OWNER / ADMIN |
| GET | `/api/v1/orders/restaurant/:restaurantId/pending` | Bearer JWT | RESTAURANT_OWNER / ADMIN |
| GET | `/api/v1/orders/rider/me/active` | Bearer JWT | RIDER / ADMIN |
| PATCH | `/api/v1/orders/:orderId/status` | Bearer JWT | CUSTOMER / RIDER / RESTAURANT_OWNER / ADMIN |
| GET | `/api/v1/orders/:id` | Bearer JWT | Any authenticated |
| GET | `/health` | None | Public |

---

## C. SECURITY RISKS

### CRITICAL

**C-1: Socket.IO — No Authentication**  
`socket.gateway.ts` binds `join:order` and `join:restaurant` events without any token validation. Any anonymous WebSocket client can subscribe to any order or restaurant room and receive real-time data including order totals, addresses, and customer info.  
*Risk: Full order data leak to unauthenticated clients.*

**C-2: Socket.IO — Rider Location Spoofing**  
The `rider:location` handler accepts `{ orderId, lat, lng }` from any socket connection without checking if the sender is the assigned rider or even authenticated. Any client can send fake GPS coordinates for any order.  
*Risk: Customer tracking fraud / misleading delivery status.*

**C-3: Client-Trusted Order Pricing**  
`deliveryFee` and `discount` are read from `req.body` and stored directly. The server computes `subtotal` from `item.subtotal` values (also client-provided) without verifying prices against the menu.  
*Risk: Fraudulent orders at zero or negative cost.*

**C-4: No Restaurant / Menu Validation on Order Creation**  
`restaurantId` and all `menuItemId` values are saved without any DB existence check. Orders can be created against non-existent restaurants or menu items.  
*Risk: Data integrity corruption; orphaned orders.*

**C-5: Committed `.env` File**  
`apps/backend/.env` is inside the zip with JWT secrets and DB credentials. Even if they are placeholders, this trains developers to commit secrets.  
*Risk: Secret leakage when pushed to a shared repository.*

### HIGH

**C-6: Order Ownership Not Enforced on `GET /orders/:id`**  
`getOrderById` fetches any order by ID with no check that `req.user.sub` matches `order.customerId`, `order.restaurantId`, or `order.riderId`.  
*Risk: IDOR (Insecure Direct Object Reference) — any customer can read any other customer's order.*

**C-7: Restaurant Ownership Not Verified on Restaurant Order Queries**  
`GET /orders/restaurant/:restaurantId` checks that the user has the `RESTAURANT_OWNER` role but does not verify that the calling user actually owns `restaurantId`. Any restaurant owner can read any other restaurant's orders.  
*Risk: Cross-restaurant data leak.*

**C-8: RESTAURANT_OWNER and RIDER Can Self-Register**  
The register validator only blocks `UserRole.ADMIN`. Any person can create a `RESTAURANT_OWNER` or `RIDER` account without any vetting.  
*Risk: Unauthorized actors gaining elevated access.*

### MEDIUM

**C-9: SortBy Injection**  
`BaseRepository.findMany` places the `sortBy` query parameter directly into a MongoDB sort object with no allowlist. While Mongoose does not execute arbitrary JS from sort keys, it may expose internal fields or cause unexpected sort behavior.

**C-10: 10MB Request Body Limit**  
The JSON body parser accepts up to 10MB. For this API's use case (orders, auth), 100KB would be sufficient. The current setting opens a DoS vector.

**C-11: New Users Bypass Email Verification**  
`AuthService.register` sets `status: UserStatus.ACTIVE` but the login flow checks for `INACTIVE` status. The `PENDING_VERIFICATION` state is defined in the schema but never used in registration, making email verification dead code.

---

## D. FIX PLAN (Prioritized)

### Priority 1 — CRITICAL (Block all frontend work)

**Fix 1: Implement the 5 stub modules**  
Every stub router (`users`, `restaurants`, `menu`, `riders`, `payments`) needs to be built out with controllers, services, repositories, and validators before any frontend integration can proceed.

**Fix 2: Add Socket.IO authentication middleware**
```typescript
// In socket.gateway.ts constructor, before setupEventHandlers()
this.io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const payload = await jwtService.verifyAccessToken(token);
    socket.data.user = payload;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});
```
Then inside `join:order`, verify `socket.data.user.sub === order.customerId` before allowing the join.

**Fix 3: Validate rider identity on `rider:location`**
```typescript
socket.on('rider:location', (data) => {
  const user = socket.data.user;
  if (user?.role !== UserRole.RIDER) return; // silent drop
  // Optionally verify riderId === assigned rider for that order
  this.io.to(`order:${data.orderId}`).emit('rider:location:update', data);
});
```

**Fix 4: Server-side price calculation**  
Remove `deliveryFee` and `discount` from the request body (or keep them for reference only). Fetch the menu items by ID, verify prices, compute `deliveryFee` from a delivery service or restaurant config, and apply only validated discounts from a promotions system:
```typescript
// In createOrder service method:
const menuItems = await menuRepo.findByIds(dto.items.map(i => i.menuItemId));
// Verify each item price matches DB price
// Compute deliveryFee from restaurant/distance logic
// Only apply discount if a valid promotionCode exists in DB
```

**Fix 5: Add restaurant and menu item existence checks in order creation**
```typescript
const restaurant = await restaurantRepo.findById(dto.restaurantId);
if (!restaurant) throw new NotFoundError('Restaurant');
if (!restaurant.isActive) throw new BadRequestError('Restaurant is not accepting orders');
```

**Fix 6: Add ownership check to `GET /orders/:id`**
```typescript
async getOrderById(orderId: string, actor: JwtAccessPayload) {
  const order = await this.orderRepo.findById(orderId);
  if (!order) throw new NotFoundError('Order');
  const isOwner = order.customerId === actor.sub ||
    order.riderId === actor.sub;
  const isRestaurantActor = order.restaurantId === actor.restaurantId;
  const isAdmin = actor.role === UserRole.ADMIN;
  if (!isOwner && !isRestaurantActor && !isAdmin)
    throw new ForbiddenError('Access denied');
  return order;
}
```

**Fix 7: Remove `.env` from version control**  
Add `.env` to `.gitignore` and rotate any secrets that have been committed. Use `.env.example` only.

### Priority 2 — HIGH

**Fix 8: Restrict self-registration roles**
```typescript
role: z.nativeEnum(UserRole)
  .refine(
    (r) => r === UserRole.CUSTOMER, // only customers can self-register
    'Only customer accounts can be self-registered'
  )
  .optional()
```
Restaurant owners and riders should be created by an admin.

**Fix 9: Fix registration status to PENDING_VERIFICATION**
```typescript
// auth.service.ts register()
status: UserStatus.PENDING_VERIFICATION,  // was ACTIVE
```
Implement an email verification flow or at minimum stop advertising a verification gate that does nothing.

**Fix 10: Fix restaurant ownership check**
```typescript
// Before querying restaurant orders, verify calling user owns the restaurant
const restaurant = await restaurantRepo.findById(restaurantId);
if (!restaurant) throw new NotFoundError('Restaurant');
if (restaurant.ownerId !== req.user.sub && req.user.role !== UserRole.ADMIN)
  throw new ForbiddenError('You do not own this restaurant');
```

**Fix 11: Whitelist `sortBy` field**
```typescript
const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'status', 'total'] as const;
const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy as any) ? sortBy : 'createdAt';
```

### Priority 3 — MEDIUM

**Fix 12: Add try/catch to OrdersController or rely explicitly on express-async-errors**  
The current approach works but is implicit. Either add try/catch + next(err) in each controller method, or add a comment clearly stating express-async-errors is the error transport. Consider a typed `asyncHandler` wrapper for clarity.

**Fix 13: Fix cache key to include full query params**
```typescript
const cacheKey = `orders:customer:${customerId}:${query.page}:${query.limit}:${query.status ?? 'all'}`;
```
Also invalidate this cache in `updateOrderStatus`.

**Fix 14: Fix PaginationMeta field naming**  
Standardize on one set of names across `BaseRepository`, `types/index.ts`, and `response.ts`. Recommend `hasNextPage`/`hasPrevPage` to match the `PaginationMeta` interface, and update `BaseRepository.findMany` to return `hasNextPage`/`hasPrevPage` consistently.

**Fix 15: Reduce JSON body limit**
```typescript
app.use(express.json({ limit: '100kb' }));
```

### Priority 4 — LOW / CLEANUP

**Fix 16:** Delete empty files: `src/modules/orders/order.service.ts`, `src/server.ts`.  
**Fix 17:** Remove `express-validator` from `package.json` (unused).  
**Fix 18:** Remove `multer` from `package.json` (no implementation).  
**Fix 19:** Remove dead `isValidTransition` private method from `OrderService`.  
**Fix 20:** Delete duplicate `create-order.dto.ts` schema; use only `order.validators.ts`.  
**Fix 21:** Add `logs/` to `.gitignore`.  
**Fix 22:** Write unit tests (auth service, order FSM transitions, RBAC rules) and integration tests for all implemented endpoints.

---

## E. TEST COVERAGE MATRIX

| Module | Endpoints | Unit Tests | Integration Tests | Validation Tests | RBAC Tests | Status |
|---|---|---|---|---|---|---|
| Auth | POST /register, /login, /refresh, /logout, GET /me | ❌ None | ❌ None | ❌ None | ❌ None | ⚠️ Code exists, untested |
| Users | ALL | ❌ None | ❌ None | ❌ None | ❌ None | ❌ Not implemented |
| Restaurants | ALL | ❌ None | ❌ None | ❌ None | ❌ None | ❌ Not implemented |
| Menu | ALL | ❌ None | ❌ None | ❌ None | ❌ None | ❌ Not implemented |
| Orders | POST /, GET /my, PATCH /:id/status, GET /:id, etc. | ❌ None | ❌ None | ❌ None | ❌ None | ⚠️ Code exists, untested |
| Riders | ALL | ❌ None | ❌ None | ❌ None | ❌ None | ❌ Not implemented |
| Payments | ALL | ❌ None | ❌ None | ❌ None | ❌ None | ❌ Not implemented |
| FSM (Order lifecycle) | PATCH /orders/:id/status | ❌ None | ❌ None | N/A | ❌ None | ⚠️ Logic correct, untested |
| Socket.IO | join:order, join:restaurant, rider:location | ❌ None | ❌ None | N/A | ❌ None | ❌ Security bugs + untested |
| JWT / Token blacklist | verifyAccessToken, revokeToken | ❌ None | ❌ None | N/A | N/A | ⚠️ Code exists, untested |
| Rate limiting | Auth + global limiters | ❌ None | ❌ None | N/A | N/A | ⚠️ Configured, untested |
| Error handler | ZodError, AppError, MongoError | ❌ None | ❌ None | N/A | N/A | ⚠️ Code exists, untested |

**Test coverage: 0%**

---

## F. UPGRADE & IMPROVEMENT RECOMMENDATIONS

### Architecture Upgrades

| Item | Why Needed | Risk if Not Done | Priority |
|---|---|---|---|
| Implement 5 stub modules | Backend is non-functional without them | Frontend integration completely blocked | **HIGH** |
| Socket.IO auth middleware | Real-time data is fully public | Live order data exposed to anonymous users | **HIGH** |
| Server-side price computation | Prevent financial fraud | Orders can be placed at attacker-defined prices | **HIGH** |
| Email verification flow | Schema supports it, code bypasses it | Account integrity claim is false | **MEDIUM** |
| Job queue (BullMQ/Bull) for order events | Socket.IO emissions are fire-and-forget with no retry | Real-time updates silently dropped on Redis hiccup | **MEDIUM** |
| Payment webhook handler | Stripe key is in config, no webhook receiver exists | Payments cannot be confirmed or reconciled | **HIGH** |

### Dependency Upgrades

| Package | Current | Issue | Priority |
|---|---|---|---|
| `express` | `^4.19.2` | Express 5 is stable; `^4.x` has known path-traversal edge cases | **MEDIUM** |
| `multer` | `1.4.5-lts.1` | LTS only; no active development; memory DoS on large uploads | **MEDIUM** |
| `bcryptjs` | `^2.4.3` | Pure JS; consider `argon2` for stronger password hashing | **LOW** |
| `mongoose` | `^8.3.2` | Up to date — acceptable | — |
| `socket.io` | `^4.7.5` | Up to date — acceptable | — |

### Scaling Improvements

| Item | Why Needed | Priority |
|---|---|---|
| MongoDB compound indexes on Orders | `{ customerId, status }`, `{ restaurantId, status }`, `{ riderId, status }` missing — full collection scans at scale | **HIGH** |
| Redis-based rate limiting store | Current `express-rate-limit` uses in-memory store; state is lost on restart and not shared across instances | **MEDIUM** |
| Pagination cache includes only `page`, not `status`/`limit` | Cache collisions return wrong filtered results | **MEDIUM** |
| Connection pooling tuning | `maxPoolSize: 10` is the default; review for production load | **LOW** |

---

## G. PRODUCTION READINESS VERDICT

**The system is NOT production-ready.**

The core infrastructure (JWT with refresh token rotation, token blacklisting, FSM-based order lifecycle, structured error handling, Zod validation pipeline, rate limiting) is well-designed and demonstrates a solid understanding of backend architecture. However, the following blockers must be resolved before any frontend integration or production deployment:

1. Five of seven API modules are empty stubs — the API is ~30% implemented.
2. Real-time infrastructure (Socket.IO) has critical unauthenticated access vulnerabilities.
3. Order pricing trusts the client entirely, opening a financial fraud vector.
4. There are zero automated tests.
5. Secrets are committed to the repository.

With focused effort on the Priority 1 and Priority 2 fixes above, the backend can reach a production-suitable baseline. The underlying patterns are sound — the implementation simply needs to be completed and secured.