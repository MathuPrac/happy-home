import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, Receipt, Heart, User } from "lucide-react";
import { motion } from "framer-motion";
import { useCart, cartSelectors } from "@/store/cart";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/orders", label: "Orders", icon: Receipt },
  { to: "/favorites", label: "Saved", icon: Heart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function TabBar() {
  const location = useLocation();
  const count = useCart((s) => cartSelectors.itemCount(s.lines));

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-3 mb-3 rounded-3xl border border-border bg-card/85 backdrop-blur-xl shadow-[var(--shadow-card)]">
        <ul className="flex items-center justify-between px-2 py-2">
          {tabs.map((t) => {
            const active = location.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to} className="flex-1">
                <Link
                  to={t.to}
                  className="relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium"
                >
                  <span
                    className={`grid place-items-center h-9 w-9 rounded-2xl transition-colors ${
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    {t.to === "/orders" && count > 0 && (
                      <span className="absolute -top-0.5 right-1/2 translate-x-[14px] h-4 min-w-4 px-1 grid place-items-center rounded-full bg-spice text-spice-foreground text-[10px] font-bold">
                        {count}
                      </span>
                    )}
                  </span>
                  <span className={active ? "text-foreground" : "text-muted-foreground"}>
                    {t.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="tab-dot"
                      className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-accent"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
