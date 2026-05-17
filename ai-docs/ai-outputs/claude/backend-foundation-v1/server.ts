import { createApp } from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './shared/redis';
import { logger } from './shared/logger';

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  logger.info(`🚀 Starting ${config.nodeEnv} server…`);

  // Connect infrastructure
  await connectDatabase();
  await connectRedis();

  // Create and start Express app
  const app = createApp();

  const server = app.listen(config.server.port, () => {
    logger.info(`✅ Server running on port ${config.server.port}`);
    logger.info(`📍 API prefix: ${config.server.apiPrefix}`);
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────────────

  const SHUTDOWN_TIMEOUT = 10_000; // 10 seconds

  async function shutdown(signal: string): Promise<void> {
    logger.info(`⚠️  ${signal} received — shutting down gracefully`);

    server.close(async () => {
      try {
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('✅ Graceful shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error('❌ Error during shutdown', { error: err });
        process.exit(1);
      }
    });

    // Force exit if shutdown takes too long
    setTimeout(() => {
      logger.error('⏱️  Shutdown timeout exceeded — forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // ── Unhandled Rejections & Exceptions ──────────────────────────────────────

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', { reason, promise });
    // Do not exit — let operational errors surface through normal flow
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception — exiting', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error('❌ Failed to start server', { error: err });
  process.exit(1);
});
