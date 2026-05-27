import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, History, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/app/dashboard", label: "Home", icon: Home },
  { to: "/app/orders", label: "Orders", icon: ClipboardList },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/notifications", label: "Alerts", icon: Bell },
  { to: "/app/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="grid grid-cols-5 px-1.5 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {TABS.map((t) => {
          const active = pathname === t.to || (t.to !== "/app/dashboard" && pathname.startsWith(t.to));
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className={cn(
              "flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] font-medium transition-colors",
              active ? "text-brand" : "text-muted-foreground hover:text-foreground"
            )}>
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
