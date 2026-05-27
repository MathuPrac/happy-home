import 'express-async-errors';

import { config } from '@/config';
import { connectDatabase, disconnectDatabase } from '@/config/database';
import { connectRedis, disconnectRedis } from '@/infrastructure/cache/redis';
import { logger } from '@/shared/utils/logger';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function bootstrap(): Promise<void> {
  logger.info(`Starting ${config.nodeEnv} server…`);

  await connectDatabase();
  await connectRedis();

  // Delay loading the app until after connections are ready
  // Using require() keeps us in the CommonJS world, avoiding ESM issues.
  const { createAppServer } = require('./app');

  const { httpServer } = createAppServer();

  const server = httpServer.listen(config.server.port, () => {
    logger.info(`Server running on port ${config.server.port}`);
    logger.info(`API prefix: ${config.server.apiPrefix}`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received — shutting down gracefully`);

    server.close(() => {
      void (async () => {
        try {
          await disconnectDatabase();
          await disconnectRedis();
          logger.info('Graceful shutdown complete');
          process.exit(0);
        } catch (err) {
          logger.error('Error during shutdown', { error: err });
          process.exit(1);
        }
      })();
    });

    setTimeout(() => {
      logger.error('Shutdown timeout exceeded — forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', { reason, promise });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception — exiting', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});