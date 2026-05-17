# 🍽️ Restaurant Ecosystem — Production Monorepo

A production-grade, TypeScript-first monorepo powering a complete restaurant delivery ecosystem.

## 📦 Apps

| App | Stack | Port | Description |
|-----|-------|------|-------------|
| `backend` | Express.js + MongoDB + Redis | 4000 | REST API + WebSocket server |
| `website` | Next.js 14 | 3000 | Customer-facing marketing & ordering site |
| `customer-app` | React Native + Expo | — | iOS/Android customer app |
| `rider-app` | React Native + Expo | — | iOS/Android rider delivery app |
| `admin-dashboard` | Next.js 14 | 3001 | Internal operations dashboard |

## 📚 Packages

| Package | Description |
|---------|-------------|
| `@restaurant/shared-types` | Shared TypeScript types, interfaces, enums |
| `@restaurant/shared-utils` | Shared utility functions |
| `@restaurant/shared-ui` | Shared React components |
| `@restaurant/eslint-config` | Shared ESLint configurations |
| `@restaurant/tsconfig` | Shared TypeScript configurations |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10
- Docker + Docker Compose

### 1. Install dependencies
```bash
npm install
```

### 2. Start infrastructure (MongoDB + Redis)
```bash
npm run docker:up
# Optional: start admin UI tools
docker-compose --profile tools up -d
```

### 3. Configure environment
```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/website/.env.example apps/website/.env
cp apps/admin-dashboard/.env.example apps/admin-dashboard/.env
# Edit each .env file with your values
```

### 4. Start all apps in development
```bash
npm run dev
```

### Or start individually
```bash
npm run dev:backend      # API server on :4000
npm run dev:website      # Customer website on :3000
npm run dev:admin        # Admin dashboard on :3001
npm run dev:customer-app # Expo customer app
npm run dev:rider-app    # Expo rider app
```

## 🏗️ Architecture

### Backend — Modular Monolith (Clean Architecture)

```
src/
├── modules/           # Domain modules (bounded contexts)
│   ├── auth/         # Authentication & JWT
│   ├── users/        # User management
│   ├── restaurants/  # Restaurant CRUD & search
│   ├── menu/         # Menu items & categories
│   ├── orders/       # Order lifecycle management
│   ├── riders/       # Rider management & dispatch
│   ├── payments/     # Stripe payment processing
│   └── notifications/# Push & in-app notifications
├── core/             # Cross-cutting concerns
│   ├── errors/       # Custom error classes (AppError)
│   ├── middleware/   # Auth, rate limiting, validation
│   └── guards/       # Role-based access control
├── infrastructure/   # External systems adapters
│   ├── database/     # MongoDB + base repository
│   ├── cache/        # Redis cache service
│   ├── messaging/    # Socket.IO gateway
│   └── storage/      # AWS S3 adapter
├── shared/           # Internal shared utilities
└── config/           # Zod-validated env config
```

Each module follows **Clean Architecture** layers:
- `entities/` — Mongoose schemas & domain models
- `repositories/` — Data access (extends BaseRepository)
- `services/` — Business logic
- `controllers/` — HTTP request handlers
- `dtos/` — Zod-validated input schemas
- `events/` — Domain events for cross-module communication

### Frontend Architecture

All Next.js apps use:
- **TanStack Query** for server state (queries, mutations, cache invalidation)
- **Redux Toolkit** for client state (auth, cart, UI)
- **Zod** for form validation
- **Axios** with auto token refresh interceptor

### Real-time (WebSocket)
Socket.IO powers:
- Live order status updates → customers
- New order alerts → restaurant dashboards
- Rider location streaming → customers & operations

## 🔧 Developer Tooling

| Tool | Purpose |
|------|---------|
| Turborepo | Parallel task execution, build caching |
| ESLint | Linting (TypeScript-strict, import ordering) |
| Prettier | Code formatting |
| Husky | Git hooks |
| lint-staged | Pre-commit lint & format |
| Conventional Commits | Enforced via commit-msg hook |

### Commit format
```
type(scope): description

feat(orders): add real-time order tracking
fix(auth): handle token refresh race condition
docs(readme): update environment setup guide
```

## 🐳 Docker

### Development infrastructure only
```bash
docker-compose up -d           # MongoDB + Redis
docker-compose --profile tools up -d  # + Mongo Express + Redis Commander
```

### Full production stack
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Service URLs (development)
| Service | URL |
|---------|-----|
| Backend API | http://localhost:4000 |
| Website | http://localhost:3000 |
| Admin | http://localhost:3001 |
| Mongo Express | http://localhost:8081 |
| Redis Commander | http://localhost:8082 |

## 📐 Key Design Decisions

1. **Modular Monolith** over microservices — easier to develop, test, and deploy initially. Modules have clear boundaries and can be extracted to services if needed.

2. **Repository Pattern** — `BaseRepository<T>` provides generic CRUD. Each module's repository extends it with domain-specific queries.

3. **Zod everywhere** — Environment variables, DTOs, and API responses all validated at runtime. Config validation at startup prevents mysterious runtime failures.

4. **Shared types package** — Single source of truth for all TypeScript interfaces. Eliminates drift between backend and frontend types.

5. **TanStack Query + Redux** separation — Server state (API data) via TanStack Query. Client state (auth, cart) via Redux Toolkit. Never mix the two.
