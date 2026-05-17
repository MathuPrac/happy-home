FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/
RUN npm install --workspace=admin-dashboard
COPY apps/admin-dashboard ./apps/admin-dashboard
COPY packages ./packages
RUN npm run build --workspace=admin-dashboard

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/admin-dashboard/.next/standalone ./
COPY --from=builder /app/apps/admin-dashboard/.next/static ./.next/static
COPY --from=builder /app/apps/admin-dashboard/public ./public
USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
