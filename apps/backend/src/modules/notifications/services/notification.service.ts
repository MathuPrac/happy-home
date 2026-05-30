import { createLogger } from '@/shared/utils/logger';
import { EmailProvider } from '../providers/email.provider';
import { PushProvider } from '../providers/push.provider';
import {
  NotificationType,
  NotificationChannel,
  type NotificationPayload,
} from '../dtos/notification.dto';

const log = createLogger('NotificationService');

// ── Email templates (inline HTML — replace with template engine later) ────────

function renderEmailTemplate(
  type:  NotificationType,
  data:  Record<string, unknown>,
): { subject: string; html: string } {
  switch (type) {
    case NotificationType.ORDER_PLACED:
      return {
        subject: `Order #${String(data['orderId'])} Received`,
        html:    `<h2>Your order has been placed!</h2><p>Order ID: <strong>${String(data['orderId'])}</strong></p><p>Total: <strong>LKR ${String(data['total'])}</strong></p><p>We'll notify you when the restaurant confirms it.</p>`,
      };
    case NotificationType.ORDER_CONFIRMED:
      return {
        subject: `Order #${String(data['orderId'])} Confirmed`,
        html:    `<h2>Your order is confirmed!</h2><p>The restaurant has accepted your order and will start preparing it shortly.</p>`,
      };
    case NotificationType.ORDER_DELIVERED:
      return {
        subject: `Order #${String(data['orderId'])} Delivered`,
        html:    `<h2>Your order has been delivered!</h2><p>Enjoy your meal. Thank you for ordering with Happy Home!</p>`,
      };
    case NotificationType.ORDER_CANCELLED:
      return {
        subject: `Order #${String(data['orderId'])} Cancelled`,
        html:    `<h2>Your order has been cancelled.</h2><p>Reason: ${String(data['reason'] ?? 'Not specified')}</p>`,
      };
    case NotificationType.PAYMENT_SUCCESS:
      return {
        subject: 'Payment Successful',
        html:    `<h2>Payment confirmed!</h2><p>Amount: <strong>LKR ${String(data['amount'])}</strong></p>`,
      };
    case NotificationType.PAYMENT_FAILED:
      return {
        subject: 'Payment Failed',
        html:    `<h2>Your payment could not be processed.</h2><p>Please try again or use a different payment method.</p>`,
      };
    case NotificationType.ACCOUNT_WELCOME:
      return {
        subject: 'Welcome to Happy Home!',
        html:    `<h2>Welcome, ${String(data['firstName'])}!</h2><p>Your account has been created. Start exploring restaurants near you.</p>`,
      };
    case NotificationType.PASSWORD_CHANGED:
      return {
        subject: 'Your password was changed',
        html:    `<h2>Password Changed</h2><p>Your Happy Home password was recently changed. If this wasn't you, please contact support immediately.</p>`,
      };
    default:
      return {
        subject: 'Happy Home Notification',
        html:    `<p>${JSON.stringify(data)}</p>`,
      };
  }
}

// ── Push notification templates ───────────────────────────────────────────────

function renderPushTemplate(
  type: NotificationType,
  data: Record<string, unknown>,
): { title: string; body: string } {
  switch (type) {
    case NotificationType.ORDER_PLACED:
      return { title: 'Order Placed', body: `Your order #${String(data['orderId'])} has been received.` };
    case NotificationType.ORDER_CONFIRMED:
      return { title: 'Order Confirmed', body: 'The restaurant has confirmed your order!' };
    case NotificationType.ORDER_PREPARING:
      return { title: 'Being Prepared', body: 'Your order is now being prepared.' };
    case NotificationType.ORDER_READY:
      return { title: 'Ready for Pickup', body: 'Your order is ready and a rider will collect it soon.' };
    case NotificationType.ORDER_PICKED_UP:
      return { title: 'On the Way!', body: 'Your rider has picked up your order.' };
    case NotificationType.ORDER_DELIVERED:
      return { title: 'Delivered!', body: 'Your order has been delivered. Enjoy!' };
    case NotificationType.ORDER_CANCELLED:
      return { title: 'Order Cancelled', body: `Your order #${String(data['orderId'])} was cancelled.` };
    case NotificationType.PAYMENT_SUCCESS:
      return { title: 'Payment Successful', body: `LKR ${String(data['amount'])} payment confirmed.` };
    case NotificationType.PAYMENT_FAILED:
      return { title: 'Payment Failed', body: 'Your payment could not be processed. Please retry.' };
    case NotificationType.RIDER_ASSIGNED:
      return { title: 'Rider Assigned', body: `${String(data['riderName'])} is on the way to collect your order.` };
    default:
      return { title: 'Happy Home', body: 'You have a new notification.' };
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export class NotificationService {
  private readonly email: EmailProvider;
  private readonly push:  PushProvider;

  constructor() {
    this.email = new EmailProvider();
    this.push  = new PushProvider();
  }

  /**
   * Central dispatch method.
   * Fire-and-forget — never throws, so callers don't need try/catch.
   */
  async send(payload: NotificationPayload): Promise<void> {
    const sends: Promise<void>[] = [];

    for (const channel of payload.channels) {
      if (channel === NotificationChannel.EMAIL) {
        if (payload.recipientEmail !== undefined) {
          const { subject, html } = renderEmailTemplate(payload.type, payload.data);
          sends.push(
            this.email.send({ to: payload.recipientEmail, subject, html }),
          );
        } else {
          log.warn(`Email notification skipped — no recipientEmail for type=${payload.type}`);
        }
      }

      if (channel === NotificationChannel.PUSH) {
        if (payload.recipientPushToken !== undefined) {
          const { title, body } = renderPushTemplate(payload.type, payload.data);
          sends.push(
            this.push.send({ token: payload.recipientPushToken, title, body }),
          );
        } else {
          log.warn(`Push notification skipped — no recipientPushToken for type=${payload.type}`);
        }
      }
    }

    await Promise.allSettled(sends);
  }

  // ── Convenience methods (used by other services) ──────────────────────────

  async notifyOrderPlaced(params: {
    recipientId:    string;
    recipientEmail: string;
    orderId:        string;
    total:          number;
    pushToken?:     string;
  }): Promise<void> {
    await this.send({
      type:     NotificationType.ORDER_PLACED,
      channels: [
        NotificationChannel.EMAIL,
        ...(params.pushToken !== undefined ? [NotificationChannel.PUSH] : []),
      ],
      recipientId:         params.recipientId,
      recipientEmail:      params.recipientEmail,
      ...(params.pushToken !== undefined ? { recipientPushToken: params.pushToken } : {}),
      data: { orderId: params.orderId, total: params.total },
    });
  }

  async notifyOrderStatusChanged(params: {
    type:        NotificationType;
    recipientId: string;
    orderId:     string;
    pushToken?:  string;
    extra?:      Record<string, unknown>;
  }): Promise<void> {
    await this.send({
      type:     params.type,
      channels: params.pushToken !== undefined
        ? [NotificationChannel.PUSH]
        : [],
      recipientId: params.recipientId,
      ...(params.pushToken !== undefined ? { recipientPushToken: params.pushToken } : {}),
      data: { orderId: params.orderId, ...(params.extra ?? {}) },
    });
  }

  async notifyWelcome(params: {
    recipientId:    string;
    recipientEmail: string;
    firstName:      string;
  }): Promise<void> {
    await this.send({
      type:          NotificationType.ACCOUNT_WELCOME,
      channels:      [NotificationChannel.EMAIL],
      recipientId:   params.recipientId,
      recipientEmail: params.recipientEmail,
      data:          { firstName: params.firstName },
    });
  }

  async notifyPasswordChanged(params: {
    recipientId:    string;
    recipientEmail: string;
  }): Promise<void> {
    await this.send({
      type:          NotificationType.PASSWORD_CHANGED,
      channels:      [NotificationChannel.EMAIL],
      recipientId:   params.recipientId,
      recipientEmail: params.recipientEmail,
      data:          {},
    });
  }
}

// Singleton — shared across the app
export const notificationService = new NotificationService();
