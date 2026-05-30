import { createLogger } from '@/shared/utils/logger';
import { config } from '@/config';

const log = createLogger('EmailProvider');

export interface EmailOptions {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
}

export class EmailProvider {
  private readonly isConfigured: boolean;

  constructor() {
    // SendGrid is optional — falls back to console logging in dev
    this.isConfigured = Boolean(
      (config as unknown as Record<string, unknown>)['sendgrid']
        ? (config as unknown as Record<string, Record<string, unknown>>)['sendgrid']['apiKey']
        : false,
    );
  }

  async send(options: EmailOptions): Promise<void> {
    if (!this.isConfigured) {
      // Dev fallback — log to console instead of sending
      log.info(`[EMAIL DEV] To: ${options.to} | Subject: ${options.subject}`);
      log.debug(`[EMAIL DEV] Body: ${options.html}`);
      return;
    }

    try {
      // Dynamic require so the app doesn't crash if @sendgrid/mail is not installed
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sgMail = require('@sendgrid/mail') as {
        setApiKey(key: string): void;
        send(msg: unknown): Promise<unknown>;
      };
      const apiKey = (config as unknown as Record<string, Record<string, string>>)['sendgrid']['apiKey'];
      sgMail.setApiKey(apiKey);
      await sgMail.send({
        to:      options.to,
        from:    'no-reply@happyhome.lk',
        subject: options.subject,
        html:    options.html,
        ...(options.text !== undefined ? { text: options.text } : {}),
      });
      log.info(`Email sent to ${options.to}: ${options.subject}`);
    } catch (err) {
      log.error('Failed to send email', { error: err, to: options.to });
      // Non-throwing — notification failures should never break the main flow
    }
  }
}
