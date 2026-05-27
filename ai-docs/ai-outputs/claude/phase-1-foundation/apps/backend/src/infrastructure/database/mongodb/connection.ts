import mongoose from 'mongoose';
import { config } from '../../../config';
import { Logger } from '../../../shared/utils/logger';

const logger = new Logger('MongoDB');

export class DatabaseConnection {
  private static instance: typeof mongoose | null = null;

  static async connect(): Promise<typeof mongoose> {
    if (this.instance) return this.instance;

    mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('error', (err) => logger.error('MongoDB error', err));

    this.instance = await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DB_NAME,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    return this.instance;
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.instance = null;
  }
}
