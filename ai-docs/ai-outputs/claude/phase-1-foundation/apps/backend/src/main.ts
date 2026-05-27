import 'express-async-errors';
import * as dotenv from 'dotenv';

dotenv.config();

import { App } from './app';
import { DatabaseConnection } from './infrastructure/database/mongodb/connection';
import { RedisConnection } from './infrastructure/cache/redis/connection';
import { Logger } from './shared/utils/logger';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  try {
    // Connect to MongoDB
    await DatabaseConnection.connect();
    logger.info('MongoDB connected');

    // Connect to Redis
    await RedisConnection.connect();
    logger.info('Redis connected');

    // Start Express app
    const app = new App();
    const port = process.env.PORT ?? 4000;

    app.listen(port, () => {
      logger.info(`🚀 Backend running on http://localhost:${port}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

void bootstrap();
