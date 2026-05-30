import { createLogger } from '@/shared/utils/logger';
import { config } from '@/config';

const log = createLogger('PushProvider');

export interface PushOptions {
  token:   string;
  title:   string;
  body:    string;
  data?:   Record<string, string>;
}

export class PushProvider {
  private readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(
      (config as unknown as Record<string, unknown>)['firebase']
        ? (config as unknown as Record<string, Record<string, unknown>>)['firebase']['projectId']
        : false,
    );
  }

  async send(options: PushOptions): Promise<void> {
    if (!this.isConfigured) {
      log.info(`[PUSH DEV] Token: ${options.token.slice(0, 20)}... | Title: ${options.title}`);
      log.debug(`[PUSH DEV] Body: ${options.body}`);
      return;
    }

    try {
      // Dynamic require — firebase-admin is optional
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const admin = require('firebase-admin') as {
        messaging(): {
          send(message: unknown): Promise<string>;
        };
      };

      await admin.messaging().send({
        token:        options.token,
        notification: { title: options.title, body: options.body },
        ...(options.data !== undefined ? { data: options.data } : {}),
      });

      log.info(`Push sent to token: ${options.token.slice(0, 20)}...`);
    } catch (err) {
      log.error('Failed to send push notification', { error: err });
      // Non-throwing
    }
  }
}
