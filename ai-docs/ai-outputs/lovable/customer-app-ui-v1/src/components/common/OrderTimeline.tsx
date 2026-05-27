import { Check, ChefHat, Bike, PackageCheck, Receipt } from "lucide-react";
import type { OrderStatus } from "@/types";

const steps: { key: OrderStatus; label: string; icon: typeof Receipt }[] = [
  { key: "placed", label: "Order placed", icon: Receipt },
  { key: "preparing", label: "Preparing in kitchen", icon: ChefHat },
  { key: "rider_assigned", label: "Rider assigned", icon: PackageCheck },
  { key: "out_for_delivery", label: "Out for delivery", icon: Bike },
  { key: "delivered", label: "Delivered", icon: Check },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = steps.findIndex((s) => s.key === status);

  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = s.icon;
        return (
          <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[19px] top-10 bottom-0 w-px ${
                  done ? "bg-accent" : "bg-border"
                }`}
              />
            )}
            <div
              className={`relative z-10 grid place-items-center h-10 w-10 rounded-full flex-shrink-0 transition ${
                done
                  ? "bg-accent text-accent-foreground"
                  : active
                  ? "bg-accent text-accent-foreground ring-4 ring-accent/20 animate-pulse"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 pt-2">
              <p className={`text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </p>
              {active && (
                <p className="text-xs text-accent mt-0.5">In progress…</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
