# Happy Home Ecosystem — Reintegration Guide

This document describes the enterprise reintegration completed across Phase 1–5 source material in `ai-docs/ai-outputs/`.

## Architecture

```
apps/
  backend/          Express modular monolith (preserved)
  website/          Next.js 14 App Router + premium marketing UI
  customer-app/     Expo + expo-router (mobile-first)
  rider-app/        Expo + expo-router (delivery)
  admin-dashboard/  Next.js 14 admin shell

packages/
  types/            @restaurant/shared-types
  utils/            @restaurant/shared-utils
  ui/               @restaurant/shared-ui (single shadcn source)
  validation/       @restaurant/validation (Zod schemas)
  api-client/       @restaurant/api-client (Axios + interceptors)
  eslint-config/
  tsconfig/
```

## Phase Map

| Phase | Source | Integrated Into |
|-------|--------|-----------------|
| 1 | `claude/phase-1-foundation` | Monorepo tooling, backend scaffold (already live) |
| 2 | `claude/backend-foundation-v1` | Auth patterns preserved in `apps/backend` |
| 3 | `lovable/website-ui-v1` | `apps/website` (Next.js pages, sections, assets) |
| 4 | `lovable/customer-app-ui-v1` | `apps/customer-app` (expo-router, RN components) |
| 5 | `lovable/rider-app` | `apps/rider-app` (expo-router scaffold) |

## Rules

- **`ai-docs/ai-outputs/` is reference only** — never import from it in production apps.
- **UI primitives** live only in `packages/ui` — apps import `@restaurant/shared-ui`.
- **Validation** uses `@restaurant/validation` — backend and frontends share Zod schemas.
- **HTTP** uses `@restaurant/api-client` — no duplicated axios setup per app.

## Website Structure

```
apps/website/src/
  app/              Next.js routes
  pages/            Page compositions
  sections/         Reusable page sections
  features/         Domain data + types
  layouts/          Shell, header, footer
  hooks/            React Query hooks
  services/         API layer (uses api-client)
  stores/           Redux slices
  lib/              Providers, fonts, utils
```

## Customer App Structure

```
apps/customer-app/
  app/              expo-router file routes
  src/
    components/     RN UI components
    constants/      Mock data (replace with API)
    features/       Domain modules
    hooks/
    services/
    stores/         Redux (re-exports store/)
```

## Commands

```bash
npm install
npm run build          # Build all packages + apps
npm run dev:website    # http://localhost:3000
npm run dev:backend    # API server
npm run dev:customer-app
npm run dev:rider-app
npm run dev:admin      # http://localhost:3001
```

## Next Steps

1. Wire reservation form to backend API
2. Replace customer-app mock data with menu/orders APIs
3. Implement stub backend routers (menu, payments, riders)
4. Expand admin-dashboard modules with shared-ui data tables
5. Add E2E tests per app
