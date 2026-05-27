import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Pill } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { coupons, type Coupon } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_dashboard/promotions")({
  head: () => ({ meta: [{ title: "Promotions — Happy Home Admin" }] }),
  component: PromotionsPage,
});

const tone: Record<Coupon["status"], "success" | "muted" | "info"> = {
  active: "success", expired: "muted", scheduled: "info",
};

function PromotionsPage() {
  const cols: Column<Coupon>[] = [
    { key: "code", header: "Code", render: (c) => <span className="font-mono font-medium">{c.code}</span> },
    { key: "discount", header: "Discount" },
    { key: "uses", header: "Usage", render: (c) => (
      <div className="w-40">
        <div className="mb-1 text-xs text-muted-foreground tabular-nums">{c.uses} / {c.limit}</div>
        <Progress value={(c.uses / c.limit) * 100} className="h-1.5" />
      </div>
    ) },
    { key: "expires", header: "Expires" },
    { key: "status", header: "Status", render: (c) => <Pill tone={tone[c.status]}>{c.status}</Pill> },
    { key: "actions", header: "", render: () => <Button variant="ghost" size="sm">Edit</Button>, className: "text-right" },
  ];

  return (
    <>
      <DashboardHeader title="Promotions & Coupons" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Promotions & Coupons" subtitle="Create coupon codes and seasonal campaigns.">
          <Button size="sm">+ New coupon</Button>
        </PageHeader>
        <DataTable data={coupons} columns={cols} searchKeys={["code"]} />
      </div>
    </>
  );
}
