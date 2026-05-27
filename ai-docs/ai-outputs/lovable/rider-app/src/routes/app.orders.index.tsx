import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppHeader } from "@/components/rider/AppHeader";
import { OrderCard } from "@/components/rider/OrderCard";
import { useRiderState } from "@/stores/rider-store";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

export const Route = createFileRoute("/app/orders/")({ component: Orders });

const TABS = [
  { key: "available", label: "Available" },
  { key: "active", label: "Active" },
] as const;

function Orders() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("available");
  const orders = useRiderState((s) => s.orders);
  const available = orders.filter((o) => o.status === "pending");
  const active = orders.filter((o) => !["pending", "delivered", "cancelled"].includes(o.status));
  const list = tab === "available" ? available : active;

  return (
    <>
      <AppHeader title="Orders" subtitle={`${available.length} available · ${active.length} active`} />
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-xl">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn(
              "h-9 rounded-lg text-sm font-medium transition-all",
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            )}>
              {t.label} · {t.key === "available" ? available.length : active.length}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 px-4 py-4 space-y-3">
        {list.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center text-muted-foreground">
            <div className="h-14 w-14 rounded-full bg-muted grid place-items-center"><Inbox className="h-7 w-7" /></div>
            <p className="mt-3 text-sm">No {tab} orders right now</p>
          </div>
        ) : list.map((o) => <OrderCard key={o.id} order={o} />)}
      </div>
    </>
  );
}
