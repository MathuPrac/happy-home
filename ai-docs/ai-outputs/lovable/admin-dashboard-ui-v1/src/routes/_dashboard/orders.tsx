import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { OrderCard } from "@/components/dashboard/order-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { orders, type Order, ORDER_STATUS_LABELS } from "@/lib/mock-data";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_dashboard/orders")({
  head: () => ({ meta: [{ title: "Live Orders — Happy Home Admin" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const live = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const completed = orders.filter((o) => o.status === "delivered");
  const cancelled = orders.filter((o) => o.status === "cancelled");

  const columns: Column<Order>[] = [
    { key: "id", header: "Order", render: (r) => <span className="font-mono text-sm font-medium">#{r.id}</span> },
    { key: "customer", header: "Customer", render: (r) => (
      <div><div className="font-medium">{r.customer}</div><div className="text-xs text-muted-foreground">{r.phone}</div></div>
    ) },
    { key: "channel", header: "Channel" },
    { key: "items", header: "Items", render: (r) => `${r.items.reduce((s, i) => s + i.qty, 0)}` },
    { key: "total", header: "Total", render: (r) => <span className="tabular-nums font-medium">Rs {r.total.toLocaleString()}</span> },
    { key: "payment", header: "Payment", render: (r) => <span className="uppercase text-xs">{r.payment}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "When", className: "text-muted-foreground" },
  ];

  return (
    <>
      <DashboardHeader title="Live Orders" subtitle={`${live.length} active orders`} />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Order Queue" subtitle="Manage every order from pending to delivered.">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
          <Button size="sm">+ New order</Button>
        </PageHeader>

        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-4 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {live.map((o) => <OrderCard key={o.id} order={o} />)}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <DataTable data={orders} columns={columns} searchKeys={["id", "customer", "phone"]} />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <DataTable data={completed} columns={columns} searchKeys={["id", "customer"]} />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            <DataTable data={cancelled} columns={columns} searchKeys={["id", "customer"]} />
          </TabsContent>
        </Tabs>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Status legend</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(ORDER_STATUS_LABELS) as (keyof typeof ORDER_STATUS_LABELS)[]).map((s) => <StatusBadge key={s} status={s} />)}
          </div>
        </div>
      </div>
    </>
  );
}
