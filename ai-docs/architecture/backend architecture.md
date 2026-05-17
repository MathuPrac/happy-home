# BACKEND ARCHITECTURE + REALTIME SYSTEM BLUEPRINT

## Happy Home Restaurant Ecosystem

---

# 1. SYSTEM ARCHITECTURE OVERVIEW

The backend will follow:

# MODULAR MONOLITH ARCHITECTURE

Reason:

* easier development
* easier AI-assisted coding
* lower infrastructure cost
* easier debugging
* suitable for 20+ daily orders
* scalable enough for future growth

---

# 2. BACKEND CORE PRINCIPLES

## MUST FOLLOW

* TypeScript only
* Modular architecture
* Service-oriented structure
* RESTful APIs
* Realtime event-driven communication
* JWT authentication
* Role-based authorization
* Centralized error handling
* Validation-first development
* Scalable folder structure

---

# 3. BACKEND TECHNOLOGY STACK

## Core Stack

* Node.js
* Express.js
* TypeScript
* MongoDB Atlas
* Mongoose
* Socket.io
* Redis
* JWT
* bcrypt
* Zod
* Winston Logger
* Cloudinary
* Firebase Cloud Messaging
* PayHere

---

# 4. BACKEND FOLDER STRUCTURE

backend/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   ├── redis.ts
│   │   ├── cloudinary.ts
│   │   ├── socket.ts
│   │   └── payhere.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── foods/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── riders/
│   │   ├── reservations/
│   │   ├── notifications/
│   │   ├── payments/
│   │   ├── loyalty/
│   │   ├── analytics/
│   │   └── inventory/
│   │
│   ├── common/
│   │   ├── middleware/
│   │   ├── exceptions/
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── types/
│   │   └── helpers/
│   │
│   ├── sockets/
│   │   ├── handlers/
│   │   ├── emitters/
│   │   └── listeners/
│   │
│   ├── jobs/
│   │   ├── cleanup/
│   │   ├── notifications/
│   │   └── analytics/
│   │
│   └── tests/
│
├── package.json
├── tsconfig.json
├── .env
└── docker-compose.yml

---

# 5. MODULE STRUCTURE STANDARD

Every module must follow the SAME structure.

Example:

modules/orders/
│
├── controllers/
├── services/
├── repositories/
├── models/
├── routes/
├── validations/
├── interfaces/
├── dtos/
├── events/
└── index.ts

---

# 6. CONTROLLER-SERVICE-REPOSITORY PATTERN

## Architecture Flow

Request
→ Route
→ Controller
→ Service
→ Repository
→ Database

---

# WHY?

Benefits:

* cleaner code
* scalable architecture
* easier testing
* reusable business logic
* AI-generated code consistency

---

# 7. AUTHENTICATION ARCHITECTURE

## Authentication Flow

### Customer Registration

1. Register user
2. Hash password
3. Generate OTP
4. Send OTP email/SMS
5. Verify OTP
6. Generate JWT
7. Generate Refresh Token

---

## JWT STRATEGY

### Access Token

Expiration:

* 15 minutes

---

### Refresh Token

Expiration:

* 30 days

Stored:

* HTTP-only cookies

---

# 8. ROLE-BASED ACCESS CONTROL (RBAC)

## Roles

CUSTOMER
RIDER
COOK
RECEPTIONIST
ADMIN

---

## Middleware Example

Middleware checks:

* authentication
* token validity
* permissions

---

## Example Rules

### CUSTOMER

Can:

* order food
* track orders

Cannot:

* access admin dashboard

---

### COOK

Can:

* update kitchen statuses

Cannot:

* manage finances

---

### ADMIN

Full access.

---

# 9. VALIDATION ARCHITECTURE

## Use

* Zod

---

## Validate:

* request body
* params
* query
* headers

---

## Example

Order validation:

* quantity > 0
* address exists
* delivery radius valid
* payment method valid

---

# 10. ERROR HANDLING SYSTEM

## Centralized Error Handling

Create:

* AppError class
* ValidationError
* AuthenticationError
* AuthorizationError
* NotFoundError

---

## Standard Error Response

{
"success": false,
"message": "Validation failed",
"errors": []
}

---

# 11. STANDARD API RESPONSE FORMAT

## Success Response

{
"success": true,
"message": "Order created successfully",
"data": {}
}

---

## Error Response

{
"success": false,
"message": "Unauthorized",
"errors": []
}

---

# 12. ORDER MANAGEMENT ARCHITECTURE

## Order Lifecycle

PENDING
→ CONFIRMED
→ PREPARING
→ READY
→ PICKED_UP
→ ON_THE_WAY
→ DELIVERED

---

## Order Creation Flow

1. Validate cart
2. Validate delivery radius
3. Calculate totals
4. Apply coupon
5. Create payment intent
6. Create order
7. Emit realtime events
8. Notify kitchen
9. Notify admin

---

# 13. DELIVERY RADIUS SYSTEM

## Restaurant Coordinates

Stored in:

* Settings collection

---

## Delivery Validation

Use:

* Haversine formula
* Google Maps Distance Matrix API

---

## Delivery Rules

0-2KM:

* Rs. 150

2-5KM:

* Rs. 300

Beyond 5KM:

* rejected

---

# 14. PAYMENT ARCHITECTURE

# PAYMENT ABSTRACTION LAYER

payments/
│
├── providers/
│   ├── payhere.provider.ts
│   ├── cod.provider.ts
│   └── stripe.provider.ts
│
├── services/
└── interfaces/

---

# WHY?

Allows:

* changing gateways later
* easier scaling
* cleaner architecture

---

# PAYHERE FLOW

1. Customer selects card payment
2. Backend creates PayHere payment request
3. Customer redirected to PayHere
4. PayHere webhook returns payment result
5. Backend verifies signature
6. Payment marked successful
7. Order confirmed

---

# COD FLOW

1. Customer selects COD
2. Order immediately created
3. Payment status = PENDING
4. Rider collects cash
5. Admin marks payment received

---

# 15. REALTIME ARCHITECTURE

# SOCKET.IO

---

# SOCKET ROOMS

## Customer Room

customer:{customerId}

---

## Rider Room

rider:{riderId}

---

## Kitchen Room

kitchen

---

## Admin Room

admins

---

# 16. REALTIME EVENTS

## CUSTOMER EVENTS

order_status_updated
rider_location_updated
payment_completed
notification_received

---

## ADMIN EVENTS

new_order
payment_received
new_reservation

---

## KITCHEN EVENTS

new_kitchen_order
order_preparing
order_ready

---

## RIDER EVENTS

new_delivery_available
order_assigned

---

# 17. LIVE RIDER TRACKING SYSTEM

## Tracking Flow

1. Rider app sends GPS every 5-10 seconds
2. Backend updates RiderLocation collection
3. Backend emits location updates
4. Customer app updates map live

---

# Optimization

Only track:

* active deliveries

---

# 18. NOTIFICATION SYSTEM

## Push Notifications

Use:

* Firebase Cloud Messaging

---

## Notification Types

Customer:

* order placed
* order ready
* rider nearby
* order delivered

---

Admin:

* new order
* failed payment

---

Rider:

* delivery assigned

---

# 19. KITCHEN MANAGEMENT SYSTEM

## Kitchen Dashboard Flow

### Incoming Order

Kitchen receives:

* food items
* quantities
* customer notes

---

## Status Updates

Kitchen can update:

* PREPARING
* READY

---

## Priority System

Sort by:

* order time
* scheduled orders
* delivery urgency

---

# 20. INVENTORY MANAGEMENT SYSTEM

## Features

Track:

* ingredients
* stock quantity
* threshold alerts

---

## Alerts

If inventory low:

* admin notification

---

# 21. ANALYTICS SYSTEM

## Metrics

Track:

* daily revenue
* monthly revenue
* popular foods
* repeat customers
* delivery times
* rider efficiency

---

## Dashboard Charts

* sales graph
* orders graph
* customer retention graph

---

# 22. LOGGING SYSTEM

## Use

* Winston logger

---

## Log Types

* errors
* requests
* payments
* admin actions

---

# 23. AUDIT LOGGING

Track:

* food updates
* price changes
* order status changes
* admin actions

---

# 24. SECURITY ARCHITECTURE

## Backend Security

Use:

* Helmet.js
* Rate limiting
* CORS
* XSS protection
* Mongo sanitization
* CSRF protection

---

## Password Security

Use:

* bcrypt with salt rounds 12

---

## Sensitive Data

Never store:

* raw card details
* plaintext passwords

---

# 25. REDIS USAGE

Use Redis for:

* caching
* OTP storage
* rate limiting
* temporary sessions
* socket scaling later

---

# 26. IMAGE STORAGE SYSTEM

## Use Cloudinary

Store:

* food images
* profile images
* promotional banners

---

# Image Optimization

* auto compression
* CDN delivery

---

# 27. BACKGROUND JOBS

Use:

* node-cron

---

# Scheduled Jobs

* cleanup expired tokens
* cleanup carts
* send promotions
* analytics aggregation

---

# 28. API VERSIONING STRATEGY

Use:

/api/v1

Future:

/api/v2

---

# 29. PERFORMANCE OPTIMIZATION

## Backend Optimization

* DB indexing
* query optimization
* Redis caching
* pagination
* lean Mongo queries

---

## Frontend Optimization

* lazy loading
* image optimization
* code splitting

---

# 30. AWS DEPLOYMENT ARCHITECTURE

## Services

Frontend:

* Vercel

Backend:

* AWS EC2

Database:

* MongoDB Atlas

Media:

* Cloudinary

DNS:

* Cloudflare

SSL:

* Cloudflare SSL

---

# 31. ENVIRONMENT VARIABLES

## Required

PORT=
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
REDIS_URL=
CLOUDINARY_API_KEY=
PAYHERE_MERCHANT_ID=
GOOGLE_MAPS_API_KEY=
FIREBASE_SERVER_KEY=

---

# 32. TESTING ARCHITECTURE

## Unit Testing

Use:

* Jest

---

## API Testing

Use:

* Supertest

---

## Frontend Testing

Use:

* Playwright

---

# 33. DEVELOPMENT PHASES

# PHASE 1

Core backend setup

---

# PHASE 2

Authentication module

---

# PHASE 3

Food management system

---

# PHASE 4

Cart + order system

---

# PHASE 5

Realtime system

---

# PHASE 6

Payments integration

---

# PHASE 7

Rider system

---

# PHASE 8

Analytics + optimization

---

# 34. PROFESSIONAL AI WORKFLOW

## ChatGPT

Use for:

* debugging
* architecture reviews
* optimization
* security reviews

---

## Claude

Use for:

* backend modules
* services
* APIs
* folder structures

---

## Lovable AI

Use for:

* frontend UI
* landing pages
* dashboard UIs

---

## Gemini

Use for:

* UI/UX reviews
* workflow ideas

---

# 35. IMPORTANT DEVELOPMENT RULES

## NEVER ALLOW AI TO:

* generate huge unmanaged codebases
* use inconsistent architecture
* mix business logic in controllers
* store card data
* skip validations
* skip TypeScript

---

# ALWAYS ENFORCE

* modular code
* reusable services
* typed APIs
* standardized responses
* centralized errors

---

# 36. MVP FEATURES

Initial launch features:

* authentication
* food ordering
* realtime orders
* rider assignment
* PayHere integration
* delivery tracking
* admin dashboard
* reservations
* loyalty points

---

# 37. POST-MVP FEATURES

Future upgrades:

* AI recommendations
* multiple branches
* multilingual support
* advanced analytics
* franchise management
* subscription plans

---

# 38. FINAL ENGINEERING GOAL

The system must be:

* enterprise-grade
* scalable
* modular
* secure
* realtime-enabled
* maintainable
* production-ready
* AI-assisted-development friendly

---

# END OF BACKEND ARCHITECTURE BLUEPRINT
