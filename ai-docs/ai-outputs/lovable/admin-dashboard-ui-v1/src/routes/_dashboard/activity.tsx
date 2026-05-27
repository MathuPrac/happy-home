import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { activityLogs, type ActivityLog } from "@/lib/mock-data";
import { Pill } from "@/components/dashboard/status-badge";

export const Route = createFileRoute("/_dashboard/activity")({
  head: () => ({ meta: [{ title: "Activity Logs — Happy Home Admin" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const cols: Column<ActivityLog>[] = [
    { key: "actor", header: "Actor", render: (a) => <div><div className="font-medium">{a.actor}</div><div className="text-xs text-muted-foreground">{a.role}</div></div> },
    { key: "action", header: "Action" },
    { key: "target", header: "Target", render: (a) => <span className="text-muted-foreground">{a.target}</span> },
    { key: "role", header: "Role", render: (a) => <Pill tone="info">{a.role}</Pill> },
    { key: "time", header: "When", className: "text-muted-foreground" },
  ];
  return (
    <>
      <DashboardHeader title="Activity Logs" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Activity Logs" subtitle="Audit trail of every change in the system." />
        <DataTable data={activityLogs} columns={cols} searchKeys={["actor", "action", "target"]} />
      </div>
    </>
  );
}
