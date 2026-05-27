import { createFileRoute } from "@tanstack/react-router";
import { DashboardHeader, PageHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/mock-data";
import { Bell, ChefHat, Bike, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Happy Home Admin" }] }),
  component: NotificationsPage,
});

const iconFor = {
  order: <Bell className="h-4 w-4" />,
  kitchen: <ChefHat className="h-4 w-4" />,
  rider: <Bike className="h-4 w-4" />,
  system: <SettingsIcon className="h-4 w-4" />,
};

function NotificationsPage() {
  return (
    <>
      <DashboardHeader title="Notifications" />
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader title="Notification Center" subtitle="Realtime alerts across the restaurant.">
          <Button variant="outline" size="sm">Mark all as read</Button>
        </PageHeader>

        <Card>
          <CardHeader><CardTitle>Recent</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {notifications.map((n) => (
              <div key={n.id} className={cn("flex items-start gap-3 py-3", n.unread && "bg-muted/30 -mx-6 px-6")}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">{iconFor[n.type]}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{n.title}</span>
                    {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
