# DATABASE SCHEMA + API ARCHITECTURE

## Happy Home Restaurant Ecosystem

---

# 1. DATABASE ARCHITECTURE OVERVIEW

The backend database system is designed for:

* single restaurant branch
* food delivery management
* realtime order tracking
* rider management
* reservations
* loyalty system
* analytics
* future scalability

---

# DATABASE TECHNOLOGY

Database:

* MongoDB Atlas

ODM:

* Mongoose

Caching:

* Redis

---

# DATABASE DESIGN PRINCIPLES

The database must be:

* scalable
* normalized where necessary
* optimized for MongoDB
* realtime-friendly
* analytics-friendly
* secure
* future-proof

---

# COLLECTION OVERVIEW

1. users
2. addresses
3. foodCategories
4. foods
5. foodVariants
6. carts
7. orders
8. payments
9. riders
10. riderLocations
11. reservations
12. loyaltyTransactions
13. coupons
14. notifications
15. reviews
16. inventory
17. settings
18. auditLogs
19. sessions
20. analyticsSnapshots

---

# 2. USERS COLLECTION

# PURPOSE

Stores:

* customers
* admins
* receptionists
* cooks
* riders

---

# SCHEMA

```ts
User {
  _id: ObjectId

  fullName: string

  email: string

  phone: string

  passwordHash: string

  role:
    'CUSTOMER'
    'ADMIN'
    'RECEPTIONIST'
    'COOK'
    'RIDER'

  profileImage?: string

  loyaltyPoints: number

  preferredLanguage: 'EN'

  isVerified: boolean

  isActive: boolean

  lastLoginAt?: Date

  createdAt: Date

  updatedAt: Date
}
```

---

# INDEXES

```txt
email -> unique
phone -> unique
role
createdAt
```

---

# 3. ADDRESSES COLLECTION

# PURPOSE

Stores customer delivery addresses.

Supports:

* multiple addresses
* geolocation
* delivery radius checking

---

# SCHEMA

```ts
Address {
  _id: ObjectId

  userId: ObjectId

  label: string

  addressLine: string

  city: string

  landmark?: string

  latitude: number

  longitude: number

  isDefault: boolean

  createdAt: Date
}
```

---

# GEO INDEX

```txt
2dsphere index
```

Required for:

* distance calculation
* rider tracking
* delivery validation

---

# 4. FOOD CATEGORIES COLLECTION

# PURPOSE

Organizes foods into categories.

---

# SCHEMA

```ts
FoodCategory {
  _id: ObjectId

  name: string

  slug: string

  image?: string

  displayOrder: number

  isActive: boolean

  createdAt: Date
}
```

---

# EXAMPLES

```txt
Kottu
Fried Rice
Indian Specials
Curries
Desserts
Beverages
```

---

# 5. FOODS COLLECTION

# PURPOSE

Stores all restaurant food items.

---

# SCHEMA

```ts
Food {
  _id: ObjectId

  categoryId: ObjectId

  name: string

  slug: string

  description: string

  images: string[]

  basePrice: number

  tags: string[]

  spiceLevel:
    'MILD'
    'MEDIUM'
    'HOT'

  isVegetarian: boolean

  isPopular: boolean

  preparationTimeMinutes: number

  ratingAverage: number

  ratingCount: number

  isAvailable: boolean

  createdBy: ObjectId

  createdAt: Date

  updatedAt: Date
}
```

---

# INDEXES

```txt
categoryId
slug -> unique
isAvailable
isPopular
```

---

# 6. FOOD VARIANTS COLLECTION

# PURPOSE

Supports:

* Full Kottu
* Half Kottu
* Large/Medium

---

# SCHEMA

```ts
FoodVariant {
  _id: ObjectId

  foodId: ObjectId

  name: string

  price: number

  isAvailable: boolean

  createdAt: Date
}
```

---

# EXAMPLES

```txt
Full
Half
Large
Medium
```

---

# 7. CARTS COLLECTION

# PURPOSE

Temporary customer shopping carts.

---

# SCHEMA

```ts
Cart {
  _id: ObjectId

  userId: ObjectId

  items: [
    {
      foodId: ObjectId

      variantId?: ObjectId

      quantity: number

      notes?: string
    }
  ]

  couponCode?: string

  createdAt: Date

  updatedAt: Date
}
```

---

# IMPORTANT

Cart is temporary.

Orders become permanent records.

---

# 8. ORDERS COLLECTION

# PURPOSE

Central order management system.

---

# ORDER FLOW

PENDING
→ CONFIRMED
→ PREPARING
→ READY
→ PICKED_UP
→ ON_THE_WAY
→ DELIVERED

---

# SCHEMA

```ts
Order {
  _id: ObjectId

  orderNumber: string

  customerId: ObjectId

  riderId?: ObjectId

  addressId: ObjectId

  paymentId?: ObjectId

  items: OrderItem[]

  subtotal: number

  deliveryFee: number

  discountAmount: number

  totalAmount: number

  paymentMethod:
    'COD'
    'PAYHERE'

  paymentStatus:
    'PENDING'
    'PAID'
    'FAILED'
    'REFUNDED'

  orderStatus:
    'PENDING'
    'CONFIRMED'
    'PREPARING'
    'READY'
    'PICKED_UP'
    'ON_THE_WAY'
    'DELIVERED'
    'CANCELLED'

  estimatedDeliveryMinutes?: number

  customerNotes?: string

  placedAt: Date

  deliveredAt?: Date

  createdAt: Date

  updatedAt: Date
}
```

---

# ORDER ITEM STRUCTURE

```ts
OrderItem {
  foodId: ObjectId

  variantId?: ObjectId

  foodName: string

  variantName?: string

  quantity: number

  unitPrice: number

  totalPrice: number
}
```

---

# IMPORTANT DESIGN DECISION

Order items are EMBEDDED.

Reason:

* historical accuracy
* immutable records
* faster queries

---

# INDEXES

```txt
customerId
riderId
orderStatus
paymentStatus
placedAt
```

---

# 9. PAYMENTS COLLECTION

# PURPOSE

Stores payment transactions.

Supports:

* PayHere
* COD
* future gateways

---

# SCHEMA

```ts
Payment {
  _id: ObjectId

  orderId: ObjectId

  provider:
    'PAYHERE'
    'COD'

  transactionId?: string

  amount: number

  currency: 'LKR'

  status:
    'PENDING'
    'SUCCESS'
    'FAILED'
    'REFUNDED'

  providerResponse?: object

  createdAt: Date
}
```

---

# IMPORTANT

NEVER STORE:

* raw card data
* CVV
* card numbers

Only payment provider tokens.

---

# 10. RIDERS COLLECTION

# PURPOSE

Stores rider-specific data.

---

# SCHEMA

```ts
Rider {
  _id: ObjectId

  userId: ObjectId

  vehicleType:
    'BIKE'

  isOnline: boolean

  currentOrderId?: ObjectId

  averageRating: number

  totalDeliveries: number

  createdAt: Date
}
```

---

# 11. RIDER LOCATIONS COLLECTION

# PURPOSE

Realtime rider tracking.

---

# SCHEMA

```ts
RiderLocation {
  _id: ObjectId

  riderId: ObjectId

  coordinates: {
    type: 'Point'

    coordinates: [longitude, latitude]
  }

  updatedAt: Date
}
```

---

# GEO INDEX

```txt
2dsphere
```

---

# 12. RESERVATIONS COLLECTION

# PURPOSE

Website table reservations.

---

# SCHEMA

```ts
Reservation {
  _id: ObjectId

  customerName: string

  phone: string

  email?: string

  reservationDate: Date

  numberOfGuests: number

  specialNotes?: string

  status:
    'PENDING'
    'CONFIRMED'
    'CANCELLED'

  createdAt: Date
}
```

---

# 13. LOYALTY TRANSACTIONS COLLECTION

# PURPOSE

Tracks loyalty point activities.

---

# SCHEMA

```ts
LoyaltyTransaction {
  _id: ObjectId

  userId: ObjectId

  type:
    'EARNED'
    'REDEEMED'

  points: number

  reason: string

  orderId?: ObjectId

  createdAt: Date
}
```

---

# 14. COUPONS COLLECTION

# PURPOSE

Discount system.

---

# SCHEMA

```ts
Coupon {
  _id: ObjectId

  code: string

  discountType:
    'PERCENTAGE'
    'FIXED'

  discountValue: number

  minimumOrderAmount?: number

  usageLimit?: number

  expiresAt: Date

  isActive: boolean

  createdAt: Date
}
```

---

# 15. NOTIFICATIONS COLLECTION

# PURPOSE

Stores user notifications.

---

# SCHEMA

```ts
Notification {
  _id: ObjectId

  userId: ObjectId

  title: string

  body: string

  type:
    'ORDER'
    'PROMOTION'
    'SYSTEM'

  isRead: boolean

  createdAt: Date
}
```

---

# 16. REVIEWS COLLECTION

# PURPOSE

Food reviews and ratings.

---

# SCHEMA

```ts
Review {
  _id: ObjectId

  customerId: ObjectId

  foodId: ObjectId

  rating: number

  review?: string

  createdAt: Date
}
```

---

# 17. INVENTORY COLLECTION

# PURPOSE

Tracks ingredient stock.

---

# SCHEMA

```ts
Inventory {
  _id: ObjectId

  ingredientName: string

  quantity: number

  unit: string

  thresholdAlert: number

  updatedAt: Date
}
```

---

# 18. SETTINGS COLLECTION

# PURPOSE

Stores global restaurant settings.

---

# SCHEMA

```ts
Setting {
  restaurantName: string

  deliveryRadiusKm: number

  openingHours: object

  deliveryFeeRules: object

  loyaltyPointRules: object

  restaurantCoordinates: {
    latitude: number

    longitude: number
  }
}
```

---

# 19. AUDIT LOGS COLLECTION

# PURPOSE

Tracks admin activities.

---

# SCHEMA

```ts
AuditLog {
  _id: ObjectId

  userId: ObjectId

  action: string

  entity: string

  entityId: ObjectId

  createdAt: Date
}
```

---

# 20. SESSIONS COLLECTION

# PURPOSE

Stores refresh sessions.

---

# SCHEMA

```ts
Session {
  _id: ObjectId

  userId: ObjectId

  refreshToken: string

  ipAddress?: string

  userAgent?: string

  expiresAt: Date

  createdAt: Date
}
```

---

# 21. ANALYTICS SNAPSHOTS COLLECTION

# PURPOSE

Stores aggregated analytics.

---

# SCHEMA

```ts
AnalyticsSnapshot {
  _id: ObjectId

  date: Date

  totalRevenue: number

  totalOrders: number

  totalCustomers: number

  averageOrderValue: number

  topFoods: object[]
}
```

---

# API ARCHITECTURE

---

# 22. API DESIGN PRINCIPLES

The API architecture follows:

* RESTful APIs
* versioned APIs
* modular routing
* centralized error handling
* JWT authentication
* RBAC authorization
* standardized responses

---

# BASE URL

```txt
/api/v1
```

---

# STANDARD RESPONSE FORMAT

# SUCCESS RESPONSE

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

# ERROR RESPONSE

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

# 23. AUTH MODULE APIs

# ROUTES

```txt
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-otp
GET    /auth/me
```

---

# 24. USER MODULE APIs

```txt
GET    /users/profile
PATCH  /users/profile
DELETE /users/profile
```

---

# 25. ADDRESS MODULE APIs

```txt
GET    /addresses
POST   /addresses
PATCH  /addresses/:id
DELETE /addresses/:id
```

---

# 26. FOOD MODULE APIs

# PUBLIC APIs

```txt
GET    /foods
GET    /foods/:slug
GET    /foods/categories
GET    /foods/popular
```

---

# ADMIN APIs

```txt
POST   /admin/foods
PATCH  /admin/foods/:id
DELETE /admin/foods/:id
```

---

# CATEGORY APIs

```txt
POST   /admin/categories
PATCH  /admin/categories/:id
DELETE /admin/categories/:id
```

---

# 27. CART MODULE APIs

```txt
GET    /cart
POST   /cart/items
PATCH  /cart/items/:id
DELETE /cart/items/:id
DELETE /cart/clear
```

---

# 28. ORDER MODULE APIs

# CUSTOMER APIs

```txt
POST   /orders
GET    /orders
GET    /orders/:id
PATCH  /orders/:id/cancel
```

---

# ADMIN APIs

```txt
GET    /admin/orders
PATCH  /admin/orders/:id/status
PATCH  /admin/orders/:id/assign-rider
```

---

# KITCHEN APIs

```txt
GET    /kitchen/orders
PATCH  /kitchen/orders/:id/preparing
PATCH  /kitchen/orders/:id/ready
```

---

# RIDER APIs

```txt
GET    /rider/orders
PATCH  /rider/orders/:id/accept
PATCH  /rider/orders/:id/picked-up
PATCH  /rider/orders/:id/delivered
```

---

# 29. PAYMENT MODULE APIs

```txt
POST   /payments/payhere/initiate
POST   /payments/payhere/webhook
GET    /payments/:id
```

---

# IMPORTANT

Use payment abstraction layer.

This allows:

* changing payment gateways later
* easier scalability

---

# 30. RESERVATION MODULE APIs

```txt
POST   /reservations
GET    /admin/reservations
PATCH  /admin/reservations/:id
```

---

# 31. RIDER LOCATION APIs

```txt
PATCH  /rider/location
GET    /orders/:id/tracking
```

---

# 32. LOYALTY MODULE APIs

```txt
GET    /loyalty/points
GET    /loyalty/history
```

---

# 33. REVIEW MODULE APIs

```txt
POST   /reviews
GET    /foods/:id/reviews
```

---

# 34. NOTIFICATION MODULE APIs

```txt
GET    /notifications
PATCH  /notifications/:id/read
```

---

# 35. ANALYTICS MODULE APIs

```txt
GET /admin/analytics/sales
GET /admin/analytics/orders
GET /admin/analytics/customers
GET /admin/analytics/riders
```

---

# 36. INVENTORY MODULE APIs

```txt
GET    /admin/inventory
POST   /admin/inventory
PATCH  /admin/inventory/:id
DELETE /admin/inventory/:id
```

---

# 37. SOCKET.IO REALTIME EVENTS

# CUSTOMER EVENTS

```txt
order_status_updated
rider_location_updated
notification_received
```

---

# ADMIN EVENTS

```txt
new_order
payment_received
new_reservation
```

---

# KITCHEN EVENTS

```txt
new_kitchen_order
order_preparing
order_ready
```

---

# RIDER EVENTS

```txt
new_delivery_available
delivery_assigned
```

---

# 38. ROLE-BASED ACCESS CONTROL

# CUSTOMER

Can:

* order food
* manage profile
* track deliveries

Cannot:

* access admin routes

---

# COOK

Can:

* update kitchen statuses

Cannot:

* manage finances

---

# RECEPTIONIST

Can:

* confirm orders
* assign riders

Cannot:

* modify analytics

---

# ADMIN

Full access.

---

# 39. API SECURITY RULES

Use:

* JWT authentication
* refresh tokens
* rate limiting
* helmet.js
* CORS
* input validation
* Mongo sanitization

---

# IMPORTANT SECURITY RULES

NEVER:

* expose secrets
* trust frontend validation
* store raw card data

---

# 40. FINAL ENGINEERING GOAL

The database + API architecture must be:

* scalable
* secure
* realtime-ready
* maintainable
* analytics-friendly
* AI-development friendly
* production-ready

The architecture should support future upgrades like:

* multiple branches
* multiple payment gateways
* multilingual support
* franchise systems
* advanced analytics
* AI recommendation systems

---

# END OF DATABASE SCHEMA + API ARCHITECTURE
