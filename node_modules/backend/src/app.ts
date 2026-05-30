import { OrderEventService } from '@/modules/orders/events/order-event.service';
import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { createServer, type Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from '@/config';
import {
  globalErrorHandler,
  globalRateLimiter,
  notFoundHandler,
  requestId,
} from '@/core/middleware';
import { httpLogStream } from '@/shared/utils/logger';
import { authRouter } from '@/modules/auth';
import { usersRouter } from '@/modules/users/users.router';
import { createRestaurantsRouter } from '@/modules/restaurants/restaurants.router';
import { createMenuRouter } from '@/modules/menu/menu.router';
import { cartRouter } from '@/modules/cart';
import { ridersRouter } from '@/modules/riders/riders.router';
import { createPaymentsRouter } from '@/modules/payments/payments.router';
import { SocketGateway } from '@/infrastructure/messaging/socket.gateway';
import { createOrdersRouter } from '@/modules/orders/orders.router';
import { createCheckoutRouter } from '@/modules/checkout';
import { OrderRepository } from '@/modules/orders/repositories/order.repository';
import { OrderService }    from '@/modules/orders/services/order.service';
import { CacheService }    from '@/infrastructure/cache/redis';

export interface AppServer {
  app: Application;
  httpServer: HttpServer;
  io: SocketIOServer;
}

export function createAppServer(): AppServer {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-site' },
      contentSecurityPolicy: config.isProd,
    }),
  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || config.security.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin '${origin}' not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestId);

  app.use(
    morgan(
      config.isDev
        ? ':method :url :status :response-time ms'
        : ':remote-addr :method :url :status :res[content-length] :response-time ms',
      { stream: httpLogStream },
    ),
  );

  app.use(globalRateLimiter);

  if (config.isProd) app.set('trust proxy', 1);

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      env: config.nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.security.corsOrigins,
      credentials: true,
    },
  });

  const eventService = new OrderEventService();
  const gateway = new SocketGateway(io);
  eventService.registerPublisher(gateway.orderEventPublisher);

  // Shared OrderService instance — used by both the orders/checkout routers
  // and the payments webhook handler (to sync paymentStatus on order).
  const sharedOrderService = new OrderService(
    new OrderRepository(),
    new CacheService(),
    eventService,
  );

  const { apiPrefix } = config.server;

  app.use(`${apiPrefix}/auth`,        authRouter);
  app.use(`${apiPrefix}/users`,       usersRouter);
  app.use(`${apiPrefix}/restaurants`, createRestaurantsRouter());
  app.use(`${apiPrefix}/menu`,        createMenuRouter());
  app.use(`${apiPrefix}/orders`,      createOrdersRouter(gateway, eventService));
  app.use(`${apiPrefix}/checkout`,    createCheckoutRouter(gateway, eventService));
  app.use(`${apiPrefix}/cart`,        cartRouter);
  app.use(`${apiPrefix}/riders`,      ridersRouter);
  app.use(`${apiPrefix}/payments`,    createPaymentsRouter(sharedOrderService));

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return { app, httpServer, io };
}