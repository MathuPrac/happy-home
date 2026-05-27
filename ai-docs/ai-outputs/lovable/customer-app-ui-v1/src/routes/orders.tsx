import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Package } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { TabBar } from "@/components/layout/TabBar";
import { ORDERS } from "@/constants/mock-data";
import { formatLKR } from "@/utils/format";

export const Route = createFileRoute("/orders")({
  component: Orders,
});

const statusTone: Record<string, string> = {
  out_for_delivery: "bg-accent/15 text-accent",
  preparing: "bg-spice/15 text-spice",
  delivered: "bg-success/15 text-success",
  placed: "bg-muted text-muted-foreground",
  rider_assigned: "bg-accent/15 text-accent",
};

const statusLabel: Record<string, string> = {
  out_for_delivery: "Out for delivery",
  preparing: "Preparing",
  delivered: "Delivered",
  placed: "Placed",
  rider_assigned: "Rider assigned",
};

function Orders() {
  const active = ORDERS.filter((o) => o.status !== "delivered");
  const past = ORDERS.filter((o) => o.status === "delivered");

  return (
    <MobileShell withTabBar>
      <header className="px-5 pt-3 pb-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <h1 className="font-display text-2xl font-bold">Your orders</h1>
        <p className="text-sm text-muted-foreground">Track current and revisit past meals.</p>
      </header>

      <div className="px-5 pt-4 space-y-6 pb-6">
        {active.length > 0 && (
          <section>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Active</p>
            <div className="space-y-3">
              {active.map((o) => (
                <Link
                  key={o.id}
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="block rounded-2xl bg-card border border-border p-4 active:scale-[0.99] transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusTone[o.status]}`}>
                      {statusLabel[o.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">{o.code}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {o.items.slice(0, 3).map((it, i) => (
                        <img key={i} src={it.image} alt="" className="h-11 w-11 rounded-xl object-cover ring-2 ring-card" />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{o.items.map((i) => i.name).join(" · ")}</p>
                      <p className="text-xs text-muted-foreground">{o.placedAt} · {formatLKR(o.total)}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {o.status === "out_for_delivery" && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <p className="text-xs">
                        <span className="text-muted-foreground">Arriving in </span>
                        <span className="font-bold text-accent">{o.etaMinutes} min</span>
                      </p>
                      <span className="text-xs text-accent font-semibold">Track →</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Past orders</p>
          {past.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {past.map((o) => (
                <Link
                  key={o.id}
                  to="/orders/$id"
                  params={{ id: o.id }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
                >
                  <img src={o.items[0].image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{o.items[0].name}{o.items.length > 1 && ` +${o.items.length - 1}`}</p>
                    <p className="text-xs text-muted-foreground">{o.placedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatLKR(o.total)}</p>
                    <button className="text-[11px] text-accent font-semibold">Reorder</button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
      <TabBar />
    </MobileShell>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center">
      <div className="grid place-items-center mx-auto h-14 w-14 rounded-2xl bg-secondary mb-3">
        <Package className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold">No orders yet</p>
      <p className="text-xs text-muted-foreground mt-1">Your past meals will appear here.</p>
    </div>
  );
}
