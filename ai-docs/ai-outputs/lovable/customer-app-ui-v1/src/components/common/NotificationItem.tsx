import { Bike, Tag, Gift, Info } from "lucide-react";
import type { NotificationItem as N } from "@/types";

const icons = { order: Bike, promo: Tag, loyalty: Gift, system: Info };
const tints = {
  order: "bg-accent/15 text-accent",
  promo: "bg-spice/15 text-spice",
  loyalty: "bg-gold/20 text-gold",
  system: "bg-muted text-muted-foreground",
};

export function NotificationItem({ item }: { item: N }) {
  const Icon = icons[item.type];
  return (
    <div className="flex gap-3 p-3 rounded-2xl bg-card border border-border">
      <div className={`grid place-items-center h-10 w-10 rounded-2xl flex-shrink-0 ${tints[item.type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight">{item.title}</p>
          {item.unread && <span className="h-2 w-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
        <p className="text-[10px] text-muted-foreground mt-1.5">{item.time}</p>
      </div>
    </div>
  );
}
