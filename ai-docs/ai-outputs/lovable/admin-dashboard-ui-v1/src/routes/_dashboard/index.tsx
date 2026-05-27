import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { AnalyticsCard } from "@/components/dashboard/analytics-card";
import { RevenueChart, OrdersBarChart, DonutChart } from "@/components/dashboard/charts";
import { OrderCard } from "@/components/dashboard/order-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/dashboard/status-badge";
import { orders, revenueSeries, channelMix, topItems, riders, reservations } from "@/lib/mock-data";
import { DollarSign, ShoppingBag, Users, Bike, ArrowRight, Star } from "lucide-react";

export const Route = createFileRoute("/_dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — Happy Home Admin" }] }),
  component: Overview,
});

function Overview() {
  const liveOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const availableRiders = riders.filter((r) => r.status === "available").length;

  return (
    <>
      <DashboardHeader title="Dashboard" subtitle="Today, May 20" actions={<Button size="sm">+ New order</Button>} />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Good evening, Saman 👋" subtitle="Here's what's happening at Happy Home right now." />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsCard label="Revenue today" value="Rs 274,300" delta={12.4} hint="vs yesterday" icon={<DollarSign className="h-4 w-4" />} />
          <AnalyticsCard label="Orders" value="172" delta={8.1} hint="86 delivery · 54 dine-in" icon={<ShoppingBag className="h-4 w-4" />} />
          <AnalyticsCard label="New customers" value="38" delta={-3.2} hint="weekly avg 42" icon={<Users className="h-4 w-4" />} />
          <AnalyticsCard label="Riders available" value={`${availableRiders}/${riders.length}`} delta={0} hint="3 out for delivery" icon={<Bike className="h-4 w-4" />} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><RevenueChart data={revenueSeries} description="Last 7 days" /></div>
          <DonutChart data={channelMix} title="Channel mix" description="This week" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live orders</CardTitle>
                <CardDescription>{liveOrders.length} active right now</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm"><Link to="/orders">View all <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {liveOrders.slice(0, 4).map((o) => <OrderCard key={o.id} order={o} compact />)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top items</CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topItems.map((it, i) => (
                <div key={it.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">{i + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.sold} sold</div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">Rs {(it.revenue / 1000).toFixed(0)}k</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <OrdersBarChart data={revenueSeries} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming reservations</CardTitle>
                <CardDescription>Today's bookings</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm"><Link to="/reservations">All <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {reservations.filter((r) => r.date === "Today").map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                  <div className="flex h-10 w-12 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
                    <span className="text-[10px] uppercase">Today</span>
                    <span className="text-sm font-semibold leading-tight">{r.time.split(" ")[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{r.guest}</span>
                      <Pill tone={r.status === "seated" ? "success" : r.status === "confirmed" ? "info" : "muted"}>{r.status}</Pill>
                    </div>
                    <div className="text-xs text-muted-foreground">Party of {r.partySize} · Table {r.table}</div>
                  </div>
                  <Star className="h-4 w-4 text-warning" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
