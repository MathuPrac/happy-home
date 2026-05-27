import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { RevenueChart, OrdersBarChart } from "@/components/dashboard/charts";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { revenueSeries } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Download, DollarSign, Receipt, Percent } from "lucide-react";

export const Route = createFileRoute("/_dashboard/reports/revenue")({
  head: () => ({ meta: [{ title: "Revenue Reports — Happy Home Admin" }] }),
  component: RevenuePage,
});

function RevenuePage() {
  return (
    <>
      <DashboardHeader title="Revenue Reports" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Revenue" subtitle="Earnings, taxes, and net payout breakdown.">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export CSV</Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-4">
          <AnalyticsCard label="Gross revenue" value="Rs 1,491,000" delta={9.2} icon={<DollarSign className="h-4 w-4" />} />
          <AnalyticsCard label="Net revenue" value="Rs 1,328,000" delta={8.1} icon={<Receipt className="h-4 w-4" />} />
          <AnalyticsCard label="Tax collected" value="Rs 119,280" delta={6.4} icon={<Percent className="h-4 w-4" />} />
          <AnalyticsCard label="Refunds" value="Rs 23,400" delta={-12.0} hint="lower is better" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><RevenueChart data={revenueSeries} description="Daily gross revenue" /></div>
          <OrdersBarChart data={revenueSeries} />
        </div>
      </div>
    </>
  );
}
