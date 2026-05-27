import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/rider/BottomNav";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  return (
    <div className="device-shell min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
