import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pill } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { customers, type Customer } from "@/lib/mock-data";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { Users, UserPlus, TrendingUp, Crown } from "lucide-react";

export const Route = createFileRoute("/_dashboard/customers")({
  head: () => ({ meta: [{ title: "Customers — Happy Home Admin" }] }),
  component: CustomersPage,
});

const tierTone: Record<Customer["tier"], "muted" | "info" | "warning" | "primary"> = {
  Bronze: "muted", Silver: "info", Gold: "warning", Platinum: "primary",
};

function CustomersPage() {
  const cols: Column<Customer>[] = [
    { key: "name", header: "Customer", render: (c) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{c.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
        <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></div>
      </div>
    ) },
    { key: "phone", header: "Phone" },
    { key: "orders", header: "Orders", render: (c) => <span className="tabular-nums">{c.orders}</span> },
    { key: "spent", header: "Total spent", render: (c) => <span className="tabular-nums font-medium">Rs {c.spent.toLocaleString()}</span> },
    { key: "loyaltyPoints", header: "Points", render: (c) => <span className="tabular-nums">{c.loyaltyPoints.toLocaleString()}</span> },
    { key: "tier", header: "Tier", render: (c) => <Pill tone={tierTone[c.tier]}>{c.tier}</Pill> },
    { key: "lastOrder", header: "Last order", className: "text-muted-foreground" },
  ];

  return (
    <>
      <DashboardHeader title="Customers" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Customer base" subtitle="Loyalty, lifetime value, and order history.">
          <Button size="sm"><UserPlus className="h-3.5 w-3.5" /> Add customer</Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-4">
          <AnalyticsCard label="Total customers" value="2,184" delta={6.2} icon={<Users className="h-4 w-4" />} />
          <AnalyticsCard label="New this week" value="38" delta={-3.1} icon={<UserPlus className="h-4 w-4" />} />
          <AnalyticsCard label="Repeat rate" value="62%" delta={4.4} icon={<TrendingUp className="h-4 w-4" />} />
          <AnalyticsCard label="VIPs (Gold+)" value="184" delta={1.8} icon={<Crown className="h-4 w-4" />} />
        </div>

        <DataTable data={customers} columns={cols} searchKeys={["name", "email", "phone"]} />
      </div>
    </>
  );
}
