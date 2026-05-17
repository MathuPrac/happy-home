# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package.json ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/tsconfig/package.json ./packages/tsconfig/

RUN npm install --workspace=backend --workspace=@restaurant/shared-types --workspace=@restaurant/tsconfig

COPY packages/tsconfig ./packages/tsconfig
COPY packages/shared-types ./packages/shared-types
RUN npm run build --workspace=@restaurant/shared-types

COPY apps/backend ./apps/backend
RUN npm run build --workspace=backend

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodeuser

COPY --from=builder --chown=nodeuser:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/apps/backend/package.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules

USER nodeuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:4000/health || exit 1

CMD ["node", "dist/main.js"]
