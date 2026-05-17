import mongoose from 'mongoose';
import { config } from '@/config';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('MongoDB');

export class DatabaseConnection {
  private static connected = false;

  static async connect(): Promise<typeof mongoose> {
    if (this.connected && mongoose.connection.readyState === 1) {
      return mongoose;
    }

    mongoose.connection.on('connected', () => log.info('MongoDB connected'));
    mongoose.connection.on('disconnected', () => log.warn('MongoDB disconnected'));
    mongoose.connection.on('error', (err) => log.error('MongoDB error', { error: err.message }));

    await mongoose.connect(config.db.uri, {
      dbName: config.db.dbName,
      maxPoolSize: config.db.maxPoolSize,
      serverSelectionTimeoutMS: config.db.serverSelectionTimeoutMS,
    });

    this.connected = true;
    return mongoose;
  }

  static async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.connected = false;
    log.info('MongoDB disconnected');
  }
}

export async function connectDatabase(): Promise<void> {
  await DatabaseConnection.connect();
}

export async function disconnectDatabase(): Promise<void> {
  await DatabaseConnection.disconnect();
}
