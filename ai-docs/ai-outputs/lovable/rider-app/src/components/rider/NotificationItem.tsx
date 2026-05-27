import { Bell, Package, Wallet, AlertTriangle, Settings as Cog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItemData } from "@/types";

const ICONS = {
  order: Package,
  earning: Wallet,
  alert: AlertTriangle,
  system: Cog,
};

export function NotificationItem({ n }: { n: NotificationItemData }) {
  const Icon = ICONS[n.type] ?? Bell;
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-2xl border p-3.5 transition-colors",
      n.read ? "bg-card border-border" : "bg-brand/5 border-brand/20"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-xl grid place-items-center shrink-0",
        n.type === "order" && "bg-brand/15 text-brand",
        n.type === "earning" && "bg-success/15 text-success",
        n.type === "alert" && "bg-destructive/15 text-destructive",
        n.type === "system" && "bg-muted text-muted-foreground",
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{n.title}</p>
          <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
      </div>
      {!n.read && <span className="h-2 w-2 rounded-full bg-brand mt-1.5" />}
    </div>
  );
}
