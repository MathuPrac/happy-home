import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const logLevel = process.env.LOG_LEVEL ?? 'info';
const logDir = process.env.LOG_DIR ?? 'logs';
const logMaxSize = process.env.LOG_MAX_SIZE ?? '20m';
const logMaxFiles = process.env.LOG_MAX_FILES ?? '14d';
const isDev = nodeEnv === 'development';
const isTest = nodeEnv === 'test';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
winston.addColors(colors);

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
);

const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}${stackStr}`;
  }),
);

const jsonFormat = winston.format.combine(baseFormat, winston.format.json());

const transports: winston.transport[] = [
  new winston.transports.Console({ format: isDev ? consoleFormat : jsonFormat }),
];

if (!isTest) {
  const resolvedLogDir = path.resolve(process.cwd(), logDir);
  transports.push(
    new DailyRotateFile({
      dirname: resolvedLogDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: logMaxSize,
      maxFiles: logMaxFiles,
      format: jsonFormat,
      level: 'info',
    }),
    new DailyRotateFile({
      dirname: resolvedLogDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: logMaxSize,
      maxFiles: logMaxFiles,
      format: jsonFormat,
      level: 'error',
    }),
  );
}

export const logger = winston.createLogger({
  level: logLevel,
  levels,
  transports,
  exitOnError: false,
});

export const createLogger = (context: string): winston.Logger => logger.child({ context });

export const httpLogStream = {
  write: (message: string): void => {
    logger.http(message.trimEnd());
  },
};

/** @deprecated Use createLogger instead */
export class Logger {
  constructor(private readonly context: string) {}

  info(message: string, data?: unknown): void {
    createLogger(this.context).info(message, data);
  }

  warn(message: string, data?: unknown): void {
    createLogger(this.context).warn(message, data);
  }

  error(message: string, data?: unknown): void {
    createLogger(this.context).error(message, data);
  }

  debug(message: string, data?: unknown): void {
    createLogger(this.context).debug(message, data);
  }
}
