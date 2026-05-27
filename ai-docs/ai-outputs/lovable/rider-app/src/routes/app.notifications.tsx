import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/rider/AppHeader";
import { NotificationItem } from "@/components/rider/NotificationItem";
import { mockNotifications } from "@/lib/mock-data";

export const Route = createFileRoute("/app/notifications")({ component: Notifications });

function Notifications() {
  return (
    <>
      <AppHeader title="Notifications" subtitle={`${mockNotifications.filter(n => !n.read).length} unread`} />
      <div className="px-4 pt-3 pb-6 space-y-2.5">
        {mockNotifications.map((n) => <NotificationItem key={n.id} n={n} />)}
      </div>
    </>
  );
}
