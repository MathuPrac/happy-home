export enum NotificationType {
  ORDER_PLACED        = 'order_placed',
  ORDER_CONFIRMED     = 'order_confirmed',
  ORDER_PREPARING     = 'order_preparing',
  ORDER_READY         = 'order_ready',
  ORDER_PICKED_UP     = 'order_picked_up',
  ORDER_DELIVERED     = 'order_delivered',
  ORDER_CANCELLED     = 'order_cancelled',
  PAYMENT_SUCCESS     = 'payment_success',
  PAYMENT_FAILED      = 'payment_failed',
  RIDER_ASSIGNED      = 'rider_assigned',
  ACCOUNT_WELCOME     = 'account_welcome',
  PASSWORD_CHANGED    = 'password_changed',
}

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH  = 'push',
  SMS   = 'sms',
}

export interface NotificationPayload {
  type:       NotificationType;
  channels:   NotificationChannel[];
  recipientId: string;         // userId
  recipientEmail?: string;
  recipientPushToken?: string;
  data:       Record<string, unknown>; // template variables
}
