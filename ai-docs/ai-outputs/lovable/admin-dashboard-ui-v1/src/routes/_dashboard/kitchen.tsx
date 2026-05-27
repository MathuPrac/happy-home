import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/dashboard/status-badge";
import { Progress } from "@/components/ui/progress";
import { orders, type Order, type OrderStatus } from "@/lib/mock-data";
import { ChefHat, Timer, CheckCircle2, Flame } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_dashboard/kitchen")({
  head: () => ({ meta: [{ title: "Kitchen Management — Happy Home Admin" }] }),
  component: KitchenPage,
});

const COLS: { key: OrderStatus; title: string; icon: React.ReactNode; tone: "muted" | "warning" | "primary" | "success" }[] = [
  { key: "accepted", title: "Queued", icon: <Timer className="h-4 w-4" />, tone: "muted" },
  { key: "preparing", title: "Cooking", icon: <Flame className="h-4 w-4" />, tone: "warning" },
  { key: "ready", title: "Ready for pickup", icon: <CheckCircle2 className="h-4 w-4" />, tone: "success" },
];

function KitchenCard({ order }: { order: Order }) {
  const progress = order.status === "accepted" ? 10 : order.status === "preparing" ? 65 : 100;
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-sm font-semibold">#{order.id}</div>
              <div className="text-xs text-muted-foreground">{order.channel} · {order.createdAt}</div>
            </div>
            <Pill tone="primary">{order.items.reduce((s, i) => s + i.qty, 0)} items</Pill>
          </div>
          <div className="mt-3 space-y-1.5">
            {order.items.map((it) => (
              <div key={it.name} className="flex items-center gap-2 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-[11px] font-semibold">{it.qty}</span>
                <span className="truncate">{it.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Prep progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="mt-1.5 h-1.5" />
          </div>
          <div className="mt-4 flex gap-2">
            {order.status === "accepted" && <Button size="sm" className="flex-1">Start cooking</Button>}
            {order.status === "preparing" && <Button size="sm" className="flex-1">Mark ready</Button>}
            {order.status === "ready" && <Button size="sm" variant="outline" className="flex-1">Notify rider</Button>}
            <Button size="sm" variant="ghost">Details</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function KitchenPage() {
  return (
    <>
      <DashboardHeader title="Kitchen" subtitle="Live preparation board" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Kitchen Queue" subtitle="Live board for everything happening on the line.">
          <Pill tone="success"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Online</Pill>
          <Button variant="outline" size="sm"><ChefHat className="h-3.5 w-3.5" /> Print KOTs</Button>
        </PageHeader>

        <div className="grid gap-4 lg:grid-cols-3">
          {COLS.map((col) => {
            const items = orders.filter((o) => o.status === col.key);
            return (
              <Card key={col.key} className="bg-muted/30">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                    <span className="text-muted-foreground">{col.icon}</span> {col.title}
                  </CardTitle>
                  <Pill tone={col.tone}>{items.length}</Pill>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-lg border border-dashed py-10 text-center text-xs text-muted-foreground">No orders here</div>
                  ) : items.map((o) => <KitchenCard key={o.id} order={o} />)}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
