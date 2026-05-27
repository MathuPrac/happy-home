import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, Pill } from "@/components/dashboard/status-badge";
import type { Order } from "@/lib/mock-data";
import { Clock, MapPin, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function OrderCard({ order, compact = false }: { order: Order; compact?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <CardContent className={cn("p-4", compact && "p-3")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold">#{order.id}</span>
                <Pill tone="muted">{order.channel}</Pill>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" /> {order.customer}
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="mt-3 space-y-1 text-sm">
            {order.items.slice(0, compact ? 2 : 4).map((it) => (
              <div key={it.name} className="flex items-center justify-between text-muted-foreground">
                <span className="truncate">
                  <span className="text-foreground font-medium">{it.qty}×</span> {it.name}
                </span>
                <span className="tabular-nums">Rs {(it.qty * it.price).toLocaleString()}</span>
              </div>
            ))}
            {order.items.length > (compact ? 2 : 4) && (
              <p className="text-xs text-muted-foreground">+{order.items.length - (compact ? 2 : 4)} more items</p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{order.createdAt}</span>
            <span className="inline-flex items-center gap-1 truncate"><MapPin className="h-3 w-3" />{order.address}</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</p>
              <p className="text-lg font-semibold tabular-nums">Rs {order.total.toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Phone className="h-3.5 w-3.5" /></Button>
              <Button size="sm">Manage</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
