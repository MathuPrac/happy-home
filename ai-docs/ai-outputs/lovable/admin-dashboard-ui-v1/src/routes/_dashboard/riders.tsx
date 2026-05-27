import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/dashboard/status-badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { riders, type Rider } from "@/lib/mock-data";
import { Bike, Phone, Star } from "lucide-react";

export const Route = createFileRoute("/_dashboard/riders")({
  head: () => ({ meta: [{ title: "Riders — Happy Home Admin" }] }),
  component: RidersPage,
});

function RidersPage() {
  const cols: Column<Rider>[] = [
    { key: "name", header: "Rider", render: (r) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/15 text-primary text-xs">{r.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
        <div>
          <div className="font-medium">{r.name}</div>
          <div className="text-xs text-muted-foreground">{r.id}</div>
        </div>
      </div>
    ) },
    { key: "phone", header: "Contact" },
    { key: "zone", header: "Zone" },
    { key: "vehicle", header: "Vehicle" },
    { key: "deliveries", header: "Deliveries", render: (r) => <span className="tabular-nums">{r.deliveries}</span> },
    { key: "rating", header: "Rating", render: (r) => <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {r.rating}</span> },
    { key: "status", header: "Status", render: (r) => (
      <Pill tone={r.status === "available" ? "success" : r.status === "busy" ? "warning" : "muted"}>{r.status}</Pill>
    ) },
  ];

  return (
    <>
      <DashboardHeader title="Riders" subtitle="Fleet overview & tracking" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Rider Fleet" subtitle="Manage riders, performance, and zones.">
          <Button size="sm">+ Add rider</Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {riders.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11"><AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-5/20 text-primary">{r.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><Bike className="h-3 w-3" /> {r.vehicle} · {r.zone}</div>
                  </div>
                  <Pill tone={r.status === "available" ? "success" : r.status === "busy" ? "warning" : "muted"}>{r.status}</Pill>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-xs text-muted-foreground">Deliveries</div><div className="font-semibold">{r.deliveries}</div></div>
                  <div><div className="text-xs text-muted-foreground">Rating</div><div className="inline-flex items-center gap-1 font-semibold"><Star className="h-3 w-3 text-warning" />{r.rating}</div></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1"><Phone className="h-3 w-3" /> Call</Button>
                  <Button size="sm" className="flex-1">Track</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DataTable data={riders} columns={cols} searchKeys={["name", "phone", "zone"]} />
      </div>
    </>
  );
}
