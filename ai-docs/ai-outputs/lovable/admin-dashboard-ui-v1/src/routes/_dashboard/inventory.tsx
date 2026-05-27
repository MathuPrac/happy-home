import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Pill } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { inventoryItems } from "@/lib/mock-data";
import { Package, AlertTriangle } from "lucide-react";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";

type InvItem = (typeof inventoryItems)[number];

export const Route = createFileRoute("/_dashboard/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Happy Home Admin" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const lowCount = inventoryItems.filter((i) => i.status !== "ok").length;

  const cols: Column<InvItem>[] = [
    { key: "name", header: "Item", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "qty", header: "On hand", render: (r) => <span className="tabular-nums">{r.qty} {r.unit}</span> },
    { key: "threshold", header: "Reorder at", render: (r) => <span className="tabular-nums text-muted-foreground">{r.threshold} {r.unit}</span> },
    { key: "status", header: "Status", render: (r) => (
      <Pill tone={r.status === "ok" ? "success" : r.status === "low" ? "warning" : "destructive"}>{r.status}</Pill>
    ) },
    { key: "actions", header: "", render: () => <Button size="sm" variant="outline">Restock</Button>, className: "text-right" },
  ];

  return (
    <>
      <DashboardHeader title="Inventory" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Inventory Preview" subtitle="Stock levels for key ingredients.">
          <Button size="sm">+ Stock entry</Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <AnalyticsCard label="Tracked SKUs" value={String(inventoryItems.length)} icon={<Package className="h-4 w-4" />} />
          <AnalyticsCard label="Low stock" value={String(lowCount)} hint="Needs reorder" icon={<AlertTriangle className="h-4 w-4" />} />
          <AnalyticsCard label="Avg coverage" value="9 days" delta={-2.1} hint="vs last week" />
        </div>

        <DataTable data={inventoryItems} columns={cols} searchKeys={["name"]} />
      </div>
    </>
  );
}
