import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { RevenueChart, OrdersBarChart, DonutChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { revenueSeries, channelMix, paymentMix, topItems, riders } from "@/lib/mock-data";
import { DollarSign, ShoppingBag, Star, Clock } from "lucide-react";

export const Route = createFileRoute("/_dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Happy Home Admin" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <>
      <DashboardHeader title="Analytics" subtitle="Insights across operations" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Restaurant Analytics" subtitle="Revenue, customers, and performance at a glance." />

        <div className="grid gap-4 md:grid-cols-4">
          <AnalyticsCard label="Weekly revenue" value="Rs 1.49M" delta={9.2} icon={<DollarSign className="h-4 w-4" />} />
          <AnalyticsCard label="Weekly orders" value="929" delta={6.8} icon={<ShoppingBag className="h-4 w-4" />} />
          <AnalyticsCard label="Avg rating" value="4.7" delta={0.3} icon={<Star className="h-4 w-4" />} />
          <AnalyticsCard label="Avg delivery" value="28 min" delta={-4.1} hint="lower is better" icon={<Clock className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><RevenueChart data={revenueSeries} /></div>
          <DonutChart data={channelMix} title="Channel mix" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <OrdersBarChart data={revenueSeries} />
          <DonutChart data={paymentMix} title="Payment mix" />
          <Card>
            <CardHeader>
              <CardTitle>Rider performance</CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {riders.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (r.deliveries / 220) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-sm tabular-nums">{r.deliveries}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top-selling foods</CardTitle>
            <CardDescription>By units sold this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topItems.map((t, i) => (
              <div key={t.name} className="grid grid-cols-12 items-center gap-3">
                <div className="col-span-1 text-sm text-muted-foreground">#{i + 1}</div>
                <div className="col-span-4 font-medium">{t.name}</div>
                <div className="col-span-5"><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-primary to-chart-5" style={{ width: `${(t.sold / 320) * 100}%` }} /></div></div>
                <div className="col-span-1 text-right text-sm tabular-nums">{t.sold}</div>
                <div className="col-span-1 text-right text-sm tabular-nums">Rs {(t.revenue / 1000).toFixed(0)}k</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
