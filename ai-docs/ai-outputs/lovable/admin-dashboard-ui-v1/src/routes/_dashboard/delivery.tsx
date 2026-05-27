import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pill, StatusBadge } from "@/components/dashboard/status-badge";
import { orders, riders } from "@/lib/mock-data";
import { MapPin, Navigation, Phone, Truck } from "lucide-react";

export const Route = createFileRoute("/_dashboard/delivery")({
  head: () => ({ meta: [{ title: "Delivery Management — Happy Home Admin" }] }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const needAssignment = orders.filter((o) => o.status === "ready");
  const inTransit = orders.filter((o) => o.status === "out_for_delivery" || o.status === "assigned");
  const available = riders.filter((r) => r.status === "available");

  return (
    <>
      <DashboardHeader title="Delivery" subtitle="Assignments & live tracking" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Delivery Operations" subtitle="Assign riders, watch deliveries, and stay on time." />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="h-4 w-4" /> Ready for assignment</CardTitle>
              <CardDescription>{needAssignment.length} orders awaiting a rider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {needAssignment.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">#{o.id}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="mt-1 text-sm">{o.customer} · Rs {o.total.toLocaleString()}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{o.address}</div>
                  </div>
                  <Button size="sm">Assign rider</Button>
                </div>
              ))}
              {needAssignment.length === 0 && <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">All orders assigned 🎉</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available riders</CardTitle>
              <CardDescription>{available.length} ready to go</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {available.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-info/10 text-info">{r.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.zone} · ★ {r.rating}</div>
                  </div>
                  <Pill tone="success">Free</Pill>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Navigation className="h-4 w-4" /> In transit</CardTitle>
            <CardDescription>{inTransit.length} orders moving right now</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {inTransit.map((o) => {
              const rider = riders.find((r) => r.id === "R-01" && o.rider === "Kamal R.") ?? riders.find((r) => r.name.includes(o.rider?.split(" ")[0] ?? ""));
              return (
                <div key={o.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold">#{o.id}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/15 text-primary">{(rider?.name ?? o.rider ?? "R")[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{rider?.name ?? o.rider}</div>
                      <div className="text-xs text-muted-foreground">{rider?.vehicle ?? "Bike"} · ETA {o.eta ?? 10}m</div>
                    </div>
                    <Button size="icon" variant="outline" className="h-8 w-8"><Phone className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">{o.address}</div>
                  <div className="mt-3 h-24 rounded-md bg-gradient-to-br from-info/10 via-muted to-primary/10 ring-1 ring-inset ring-border [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:18px_18px]" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
