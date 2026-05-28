Now I have a complete, precise picture. Here is the report.

---

## Smoke Test Report

### ✅ Fixes Confirmed

**Stripe synchronous init + fail-fast** — `checkout.service.ts` now uses `require('stripe')` inside a `try/catch` at module load time. The `if (input.paymentMethod === CARD && !stripe)` guard at the top of `checkout()` throws a clear `BadRequestError` before the order is even created. Correct.

**`CheckoutResult.order` typed as `IOrder`** — `checkout.dto.ts` imports `IOrder` from the order entity and types the field properly. No more `unknown`. ✅

**`promoCode` removed from DTO** — `CheckoutDto` no longer has `promoCode`. ✅

**Single shared `OrderEventService`** — `app.ts` creates one `eventService`, calls `registerPublisher` once, and passes it into both `createOrdersRouter(gateway, eventService)` and `createCheckoutRouter(gateway, eventService)`. Both routers correctly guard with `if (!sharedEventService && gateway)` to skip re-registration. The dual-instance problem is resolved. ✅

**Static `ordersRouter` export deleted** — Confirmed absent from `orders.router.ts`. ✅

**`checkout.router.ts` `req as any` cast fixed** — Now cast to `req as AuthenticatedRequest`. ✅

**Stripe now uses `order.total` for payment amount** — The PaymentIntent is created after `orderService.createOrder` returns, and uses `order.total` as the single source of truth. Double-computation eliminated. ✅

---

### ⚠️ Remaining Risks

**1. `promoCode` removed from DTO but still in the Zod validator**
`checkout.dto.ts` no longer has `promoCode`. But `checkout.validators.ts` line 17 still declares it:
```ts
promoCode: z.string().max(50).optional(),
```
`CheckoutInput` is inferred from this schema, so `promoCode` is still accepted by the validator, still passed into `CheckoutService.checkout(customerId, input)`, and silently ignored. The fix landed in the wrong file. The validator is the source of the type — the DTO was the downstream artifact. The schema is what needs the field removed.

**2. `updateOrderStatus` does not invalidate the customer order cache**
`cancelOrder` correctly calls `cache.del(orders:customer:${order.customerId})`. `updateOrderStatus` does not. A customer calling `GET /orders/my` will receive a cached response with the stale order status for up to 60 seconds after any status change (CONFIRMED, PREPARING, DELIVERED, etc). `cancelOrder` avoiding this inconsistency by accident makes the gap more confusing.

**3. `CheckoutController` constructor still wires infrastructure**
`CheckoutController` still creates `new CacheService()`, `new CartService(cache)`, `new OrderRepository()`, and `new OrderService(...)` inside its own constructor. This is the same infrastructure-wiring-in-controller violation flagged previously. It also means the `CheckoutController`'s internal `OrderService` instance uses a **different** `CacheService` instance from the one potentially used elsewhere, and — critically — the `CheckoutController`'s internal `OrderService` uses the correct `eventService` passed in, but the internal `CacheService` is a fresh allocation on every call to `createCheckoutRouter`. This works at runtime today but is fragile and untestable.

**4. Stripe `apiVersion: '2024-04-10'` is not a real Stripe API version**
Valid Stripe API versions follow the pattern `YYYY-MM-DD` and must be one from Stripe's published version list. `2024-04-10` does not correspond to any published Stripe API date. The correct current version is `2025-05-28` (or whichever is in the Stripe package's types). Depending on how the Stripe SDK handles an unrecognised version string, this may either silently fall back to the library default, or throw at runtime. It will at minimum generate a TypeScript type error since `apiVersion` is a string literal union in the SDK types.

**5. `cart.subtotal` is computed client-side in Redis, not re-verified against DB prices**
`CartService.getCart` reads the cart from Redis (set when items are added) and returns `cart.subtotal` computed at add-time. `CheckoutService` uses this value directly as the pricing basis. If menu item prices have changed since the cart was populated, the order will be created and charged at the old price. There is no re-fetch of current prices from the menu DB at checkout time.

---

### ❌ Bugs Found

**Bug 1: Three claimed fixes did not land in `OrdersController`**

The fix notes state: *"All controller methods use `AuthenticatedRequest` (no more `req.user!`)"* and *"`getMyOrders` now uses `paginated()` helper correctly"* and *"`getOrderById` now has ownership check"*.

None of these are true in `orders.controller.ts`. Checking the file directly:

- Every method is still typed `req: Request` — not `AuthenticatedRequest`
- Every user access is still `req.user!.sub` — non-null assertion on an optional field
- `getMyOrders` (line 49) still does `res.json({ success: true, ...result })` — the spread bug is unfixed
- `getOrder` (line 39) calls `this.orderService.getOrderById(req.params.id)` with **no `requesterId` argument** — the ownership check that was added to `OrderService` is never invoked from this controller

The `OrderService.getOrderById` signature was correctly updated to accept an optional `requesterId`, and the check is implemented correctly in the service. But the controller never passes `req.user.sub` to it. The IDOR vulnerability from the previous audit is **still exploitable** despite being listed as fixed.

**Bug 2: `GET /orders/my` returns broken response shape (unfixed)**

`getMyOrders` line 49:
```ts
res.json({ success: true, ...result });
```
`result` is `{ data: IOrder[], meta: PaginationMeta }`. Spreading produces `{ success: true, data: [...], meta: {...} }`.

Every other endpoint wraps under `data:`, producing `{ success: true, data: <value> }`. `paginated()` from `response.ts` produces `{ success: true, data: [...], meta: {...} }` — which happens to match structurally, but `paginated()` is still not being called. The listed fix did not land.

**Bug 3: `POST /orders` bypasses `created()` helper — inconsistent status code semantics**

`createOrder` in the controller (line 35):
```ts
res.status(201).json({ success: true, data: order, message: 'Order created successfully' });
```
`POST /checkout` uses `created(res, result)` from `response.ts`. Both create orders. The raw `.json()` call also includes a `message:` field that `created()` / `ok()` do not include, and `created()` wraps inside a `meta: { timestamp }` envelope that the raw call omits. The frontend receives two different shapes from two different order-creation paths.

---

### 📋 Recommended Actions

**P1 — Fix `OrdersController` — three fixes that were reported but did not land**

This is the highest priority because one item (the IDOR) is a security bug reported as resolved.

- Change all method signatures from `req: Request` to `req: AuthenticatedRequest`
- Remove all `req.user!` assertions
- Pass `req.user.sub` to `getOrderById`: `getOrderById(req.params.id, req.user.sub)`
- Replace the `getMyOrders` spread with either `paginated(res, result.data, result.meta)` or at minimum `res.json({ success: true, data: result.data, meta: result.meta })`

**P2 — Remove `promoCode` from `checkout.validators.ts` (not just the DTO)**

Line 17 of `checkout.validators.ts` needs to be deleted. The Zod schema is the source of `CheckoutInput` — that is where the field must be removed. The DTO change alone was a no-op.

**P3 — Fix `POST /orders` response to use `created()` helper**

Replace:
```ts
res.status(201).json({ success: true, data: order, message: '...' });
```
With:
```ts
created(res, order);
```
This aligns the shape with `POST /checkout` and the rest of the codebase.

**P4 — Invalidate cache in `updateOrderStatus`**

Add `await this.cache.del(`orders:customer:${order.customerId}`)` after the repo update in `updateOrderStatus`, mirroring what `cancelOrder` already does.

**P5 — Fix Stripe `apiVersion` string**

Replace `'2024-04-10'` with the version exported by the installed Stripe package types (check `node_modules/stripe/types/index.d.ts` for `LatestApiVersion`), or pin to the latest published version. This will eliminate the TypeScript type error and ensure predictable SDK behaviour.

**P6 — Move infrastructure wiring out of `CheckoutController` constructor**

`CheckoutController` should receive a fully constructed `CheckoutService` as a constructor argument, not build its own dependency tree. This is a refactor for the next session — not a runtime blocker today, but it makes the checkout module untestable in isolation.