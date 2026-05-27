import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/dashboard/status-badge";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { reservations, type Reservation } from "@/lib/mock-data";
import { CalendarPlus, Users2, Clock } from "lucide-react";

export const Route = createFileRoute("/_dashboard/reservations")({
  head: () => ({ meta: [{ title: "Reservations — Happy Home Admin" }] }),
  component: ReservationsPage,
});

const tone: Record<Reservation["status"], "info" | "success" | "muted" | "destructive"> = {
  confirmed: "info", seated: "success", pending: "muted", cancelled: "destructive",
};

function ReservationsPage() {
  const today = reservations.filter((r) => r.date === "Today");
  const upcoming = reservations.filter((r) => r.date !== "Today");

  const cols: Column<Reservation>[] = [
    { key: "id", header: "Ref", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "guest", header: "Guest", render: (r) => <div><div className="font-medium">{r.guest}</div><div className="text-xs text-muted-foreground">{r.phone}</div></div> },
    { key: "partySize", header: "Party", render: (r) => <span className="inline-flex items-center gap-1"><Users2 className="h-3 w-3" />{r.partySize}</span> },
    { key: "date", header: "Date" },
    { key: "time", header: "Time" },
    { key: "table", header: "Table" },
    { key: "status", header: "Status", render: (r) => <Pill tone={tone[r.status]}>{r.status}</Pill> },
    { key: "note", header: "Note", render: (r) => <span className="text-muted-foreground text-xs">{r.note ?? "—"}</span> },
  ];

  return (
    <>
      <DashboardHeader title="Reservations" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Reservation Manager" subtitle="Tables, bookings, and walk-in flow.">
          <Button size="sm"><CalendarPlus className="h-3.5 w-3.5" /> New reservation</Button>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Today's bookings</CardTitle>
            <CardDescription>{today.length} reservations scheduled</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {today.map((r) => (
              <div key={r.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.guest}</span>
                  <Pill tone={tone[r.status]}>{r.status}</Pill>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div><div className="text-foreground font-semibold">{r.time}</div>Time</div>
                  <div><div className="text-foreground font-semibold">{r.partySize}</div>Guests</div>
                  <div><div className="text-foreground font-semibold">{r.table}</div>Table</div>
                </div>
                {r.note && <div className="mt-2 text-xs text-muted-foreground">Note: {r.note}</div>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All reservations</CardTitle>
            <CardDescription>Upcoming and historical</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable data={[...today, ...upcoming]} columns={cols} searchKeys={["guest", "phone", "id"]} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
