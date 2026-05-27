import { cn } from "@/lib/utils";
import type { DeliveryStatus } from "@/types";

const META: Record<DeliveryStatus, { label: string; classes: string; dot: string }> = {
  pending:          { label: "New",            classes: "bg-warning/15 text-warning-foreground dark:text-warning border-warning/30",  dot: "bg-warning" },
  accepted:         { label: "Accepted",       classes: "bg-info/15 text-info border-info/30",        dot: "bg-info" },
  preparing:        { label: "Preparing",      classes: "bg-info/15 text-info border-info/30",        dot: "bg-info" },
  ready_for_pickup: { label: "Ready for pickup", classes: "bg-brand/15 text-brand border-brand/30",   dot: "bg-brand" },
  picked_up:        { label: "Picked up",      classes: "bg-brand/15 text-brand border-brand/30",     dot: "bg-brand" },
  on_the_way:       { label: "On the way",     classes: "bg-brand/15 text-brand border-brand/30",     dot: "bg-brand animate-pulse" },
  delivered:        { label: "Delivered",      classes: "bg-success/15 text-success border-success/30", dot: "bg-success" },
  cancelled:        { label: "Cancelled",      classes: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
};

export function DeliveryStatusBadge({ status, className }: { status: DeliveryStatus; className?: string }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", m.classes, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}
