import compression from 'compression';
import cors from 'cors';
import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer, type Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { errorHandler } from './core/middleware/error-handler.middleware';
import { rateLimiter } from './core/middleware/rate-limiter.middleware';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { restaurantsRouter } from './modules/restaurants/restaurants.router';
import { menuRouter } from './modules/menu/menu.router';
import { ordersRouter } from './modules/orders/orders.router';
import { ridersRouter } from './modules/riders/riders.router';
import { paymentsRouter } from './modules/payments/payments.router';
import { SocketGateway } from './infrastructure/messaging/socket.gateway';

export class App {
  private readonly app: Application;
  private readonly httpServer: Server;
  private readonly io: SocketIOServer;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSockets();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(','), credentials: true }));
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
    this.app.use('/api', rateLimiter);
  }

  private setupRoutes(): void {
    const apiV1 = '/api/v1';

    this.app.use(`${apiV1}/auth`, authRouter);
    this.app.use(`${apiV1}/users`, usersRouter);
    this.app.use(`${apiV1}/restaurants`, restaurantsRouter);
    this.app.use(`${apiV1}/menu`, menuRouter);
    this.app.use(`${apiV1}/orders`, ordersRouter);
    this.app.use(`${apiV1}/riders`, ridersRouter);
    this.app.use(`${apiV1}/payments`, paymentsRouter);

    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private setupWebSockets(): void {
    new SocketGateway(this.io);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(port: string | number, callback: () => void): Server {
    return this.httpServer.listen(port, callback);
  }
}
