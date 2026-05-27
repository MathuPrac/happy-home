import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { NotificationItem } from "@/components/common/NotificationItem";
import { NOTIFICATIONS } from "@/constants/mock-data";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
});

function Notifications() {
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  return (
    <MobileShell>
      <ScreenHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : "You're all caught up"}
        right={<button className="text-xs text-accent font-semibold">Mark all read</button>}
      />
      <div className="px-5 py-4 space-y-2.5 pb-10">
        {NOTIFICATIONS.map((n) => <NotificationItem key={n.id} item={n} />)}
      </div>
    </MobileShell>
  );
}
