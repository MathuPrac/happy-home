import { Check, Store, Bike, MapPin, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliveryStatus } from "@/types";

const STEPS: { key: DeliveryStatus; label: string; icon: React.ElementType }[] = [
  { key: "accepted", label: "Order accepted", icon: Check },
  { key: "ready_for_pickup", label: "At restaurant", icon: Store },
  { key: "picked_up", label: "Picked up", icon: PackageCheck },
  { key: "on_the_way", label: "On the way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const ORDER: DeliveryStatus[] = ["pending","accepted","ready_for_pickup","picked_up","on_the_way","delivered"];

export function DeliveryTimeline({ status }: { status: DeliveryStatus }) {
  const currentIdx = ORDER.indexOf(status);
  return (
    <ol className="relative space-y-5">
      {STEPS.map((s, i) => {
        const stepIdx = ORDER.indexOf(s.key);
        const done = currentIdx >= stepIdx;
        const active = currentIdx === stepIdx;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex items-start gap-3">
            <div className="relative flex flex-col items-center">
              <div className={cn(
                "h-9 w-9 rounded-full grid place-items-center border-2 transition-colors",
                done ? "bg-brand border-brand text-brand-foreground" : "bg-muted border-border text-muted-foreground",
                active && "ring-4 ring-brand/20",
              )}>
                <Icon className="h-4 w-4" />
              </div>
              {i < STEPS.length - 1 && (
                <span className={cn("w-0.5 flex-1 mt-1", done ? "bg-brand" : "bg-border")} style={{ height: 28 }} />
              )}
            </div>
            <div className="pb-2">
              <p className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>{s.label}</p>
              <p className="text-xs text-muted-foreground">{active ? "In progress" : done ? "Completed" : "Pending"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
