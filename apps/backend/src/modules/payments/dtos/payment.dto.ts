import { z } from 'zod';

// ── Request to manually trigger a refund (ADMIN) ──────────────────────────────
export const refundPaymentSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ── Query payments list ───────────────────────────────────────────────────────
export const listPaymentsQuerySchema = z.object({
  page:   z.coerce.number().int().positive().default(1),
  limit:  z.coerce.number().int().positive().max(100).default(20),
});

// ── Inferred types ────────────────────────────────────────────────────────────
export type RefundPaymentDto    = z.infer<typeof refundPaymentSchema>;
export type ListPaymentsQuery   = z.infer<typeof listPaymentsQuerySchema>;
