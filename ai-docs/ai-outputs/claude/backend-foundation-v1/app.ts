import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import { config } from './config';
import { globalRateLimiter } from './middleware/rateLimiter';
import { requestId } from './middleware/requestId';
import { globalErrorHandler, notFoundHandler } from './shared/errors';
import { httpLogStream } from './shared/logger';

// ── Module Routers ────────────────────────────────────────────────────────────

import authRoutes from './modules/auth/auth.routes';

// ── Application Factory ───────────────────────────────────────────────────────

export function createApp(): Application {
  const app = express();

  // ── Security Headers ────────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'same-site' },
    contentSecurityPolicy: config.isProd,
  }));

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.use(cors({
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
  }));

  // ── Compression ─────────────────────────────────────────────────────────────
  app.use(compression());

  // ── Body Parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Request ID ──────────────────────────────────────────────────────────────
  app.use(requestId);

  // ── HTTP Logging ─────────────────────────────────────────────────────────────
  app.use(
    morgan(
      config.isDev
        ? ':method :url :status :response-time ms'
        : ':remote-addr :method :url :status :res[content-length] :response-time ms',
      { stream: httpLogStream },
    ),
  );

  // ── Global Rate Limit ────────────────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ── Trust Proxy (for load balancers) ─────────────────────────────────────────
  if (config.isProd) app.set('trust proxy', 1);

  // ── Health Check ─────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      env: config.nodeEnv,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // ── API Routes ───────────────────────────────────────────────────────────────
  const { apiPrefix } = config.server;

  app.use(`${apiPrefix}/auth`, authRoutes);

  // Placeholder routes for future modules — register as you build them:
  // app.use(`${apiPrefix}/restaurants`, restaurantRoutes);
  // app.use(`${apiPrefix}/orders`,      orderRoutes);
  // app.use(`${apiPrefix}/drivers`,     driverRoutes);
  // app.use(`${apiPrefix}/menu`,        menuRoutes);

  // ── 404 & Error Handling ─────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
