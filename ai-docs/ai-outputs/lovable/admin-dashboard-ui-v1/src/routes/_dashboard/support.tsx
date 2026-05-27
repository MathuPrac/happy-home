import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Pill } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { tickets, type Ticket } from "@/lib/mock-data";

export const Route = createFileRoute("/_dashboard/support")({
  head: () => ({ meta: [{ title: "Support Tickets — Happy Home Admin" }] }),
  component: SupportPage,
});

const priTone: Record<Ticket["priority"], "destructive" | "warning" | "muted"> = {
  high: "destructive", medium: "warning", low: "muted",
};
const statTone: Record<Ticket["status"], "info" | "warning" | "success"> = {
  open: "info", pending: "warning", resolved: "success",
};

function SupportPage() {
  const cols: Column<Ticket>[] = [
    { key: "id", header: "Ticket", render: (t) => <span className="font-mono text-xs">{t.id}</span> },
    { key: "subject", header: "Subject", render: (t) => <span className="font-medium">{t.subject}</span> },
    { key: "customer", header: "Customer" },
    { key: "priority", header: "Priority", render: (t) => <Pill tone={priTone[t.priority]}>{t.priority}</Pill> },
    { key: "status", header: "Status", render: (t) => <Pill tone={statTone[t.status]}>{t.status}</Pill> },
    { key: "updated", header: "Updated", className: "text-muted-foreground" },
    { key: "actions", header: "", render: () => <Button size="sm" variant="outline">Open</Button>, className: "text-right" },
  ];
  return (
    <>
      <DashboardHeader title="Support Tickets" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Support Tickets" subtitle="Customer issues and resolutions.">
          <Button size="sm">+ New ticket</Button>
        </PageHeader>
        <DataTable data={tickets} columns={cols} searchKeys={["id", "subject", "customer"]} />
      </div>
    </>
  );
}
