export class Logger {
  constructor(private readonly context: string) {}

  private format(level: string, message: string, data?: unknown): string {
    const ts = new Date().toISOString();
    const base = `[${ts}] [${level.toUpperCase()}] [${this.context}] ${message}`;
    return data ? `${base}\n${JSON.stringify(data, null, 2)}` : base;
  }

  info(message: string, data?: unknown): void {
    console.log(this.format('info', message, data));
  }

  warn(message: string, data?: unknown): void {
    console.warn(this.format('warn', message, data));
  }

  error(message: string, data?: unknown): void {
    console.error(this.format('error', message, data));
  }

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, data));
    }
  }
}
