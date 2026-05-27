import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pill } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { staff, type StaffMember } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_dashboard/settings/staff")({
  head: () => ({ meta: [{ title: "Staff & Roles — Happy Home Admin" }] }),
  component: StaffPage,
});

const PERMS = ["View orders","Manage orders","Manage kitchen","Assign riders","Edit menu","View analytics","Manage staff","System settings"];
const ROLES = ["Admin","Receptionist","Kitchen","Order Manager","Delivery Coordinator"] as const;
const matrix: Record<string, boolean[]> = {
  Admin:                 [true, true, true, true, true, true, true, true],
  Receptionist:          [true, true, false, false, false, false, false, false],
  Kitchen:               [true, false, true, false, false, false, false, false],
  "Order Manager":       [true, true, true, true, true, true, false, false],
  "Delivery Coordinator":[true, true, false, true, false, true, false, false],
};

function StaffPage() {
  const cols: Column<StaffMember>[] = [
    { key: "name", header: "Member", render: (s) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{s.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
        <div><div className="font-medium">{s.name}</div><div className="text-xs text-muted-foreground">{s.email}</div></div>
      </div>
    ) },
    { key: "role", header: "Role", render: (s) => <Pill tone="info">{s.role}</Pill> },
    { key: "status", header: "Status", render: (s) => <Pill tone={s.status === "active" ? "success" : "muted"}>{s.status}</Pill> },
    { key: "lastSeen", header: "Last seen", className: "text-muted-foreground" },
    { key: "actions", header: "", render: () => <Button variant="ghost" size="sm">Manage</Button>, className: "text-right" },
  ];
  return (
    <>
      <DashboardHeader title="Staff & Roles" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Staff & Permissions" subtitle="Invite staff and assign role-based access.">
          <Button size="sm">+ Invite staff</Button>
        </PageHeader>

        <DataTable data={staff} columns={cols} searchKeys={["name", "email", "role"]} />

        <Card>
          <CardHeader>
            <CardTitle>Role permissions</CardTitle>
            <CardDescription>Toggle what each role can access</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4">Permission</th>
                  {ROLES.map((r) => <th key={r} className="px-3 py-2">{r}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {PERMS.map((p, i) => (
                  <tr key={p}>
                    <td className="py-2.5 pr-4 font-medium">{p}</td>
                    {ROLES.map((r) => (
                      <td key={r} className="px-3 py-2.5"><Switch defaultChecked={matrix[r][i]} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
