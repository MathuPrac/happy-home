FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/website/package.json ./apps/website/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN npm install --workspace=website --workspace=@restaurant/shared-types --workspace=@restaurant/tsconfig
COPY packages ./packages
RUN npm run build --workspace=@restaurant/shared-types
COPY apps/website ./apps/website
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=website

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/apps/website/.next/standalone ./
COPY --from=builder /app/apps/website/.next/static ./.next/static
COPY --from=builder /app/apps/website/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
