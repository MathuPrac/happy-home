import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/mock-data";
import { ORDER_STATUS_LABELS } from "@/lib/mock-data";

const styles: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground ring-border",
  accepted: "bg-info/10 text-info ring-info/20",
  preparing: "bg-warning/15 text-warning-foreground ring-warning/30",
  ready: "bg-primary/10 text-primary ring-primary/20",
  assigned: "bg-info/10 text-info ring-info/20",
  out_for_delivery: "bg-chart-5/10 text-chart-5 ring-chart-5/20",
  delivered: "bg-success/15 text-success ring-success/30",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function Pill({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "success" | "warning" | "info" | "destructive" | "primary";
  className?: string;
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground ring-border",
    success: "bg-success/15 text-success ring-success/30",
    warning: "bg-warning/15 text-warning-foreground ring-warning/30",
    info: "bg-info/10 text-info ring-info/20",
    destructive: "bg-destructive/10 text-destructive ring-destructive/20",
    primary: "bg-primary/10 text-primary ring-primary/20",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}
