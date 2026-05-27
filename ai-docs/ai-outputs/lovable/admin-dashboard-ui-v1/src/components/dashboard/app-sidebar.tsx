import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, ShoppingBag, ChefHat, Truck, Bike, Users, CalendarRange,
  UtensilsCrossed, FolderTree, PlusSquare, Package, BarChart3, LineChart,
  Gift, Megaphone, Bell, CreditCard, Wallet, Settings, Shield, MapPinned,
  MessageSquareText, LifeBuoy, ScrollText, UserCog, SlidersHorizontal,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Live Orders", url: "/orders", icon: ShoppingBag },
      { title: "Kitchen", url: "/kitchen", icon: ChefHat },
      { title: "Delivery", url: "/delivery", icon: Truck },
      { title: "Riders", url: "/riders", icon: Bike },
      { title: "Reservations", url: "/reservations", icon: CalendarRange },
    ],
  },
  {
    label: "Menu",
    items: [
      { title: "Menu Items", url: "/menu", icon: UtensilsCrossed },
      { title: "Categories", url: "/menu/categories", icon: FolderTree },
      { title: "Add Item", url: "/menu/new", icon: PlusSquare },
      { title: "Inventory", url: "/inventory", icon: Package },
    ],
  },
  {
    label: "Customers",
    items: [
      { title: "Customers", url: "/customers", icon: Users },
      { title: "Loyalty", url: "/loyalty", icon: Gift },
      { title: "Promotions", url: "/promotions", icon: Megaphone },
      { title: "Feedback", url: "/feedback", icon: MessageSquareText },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Revenue", url: "/reports/revenue", icon: LineChart },
      { title: "Payments", url: "/reports/payments", icon: CreditCard },
      { title: "COD vs Card", url: "/reports/cod-card", icon: Wallet },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell },
      { title: "Support Tickets", url: "/support", icon: LifeBuoy },
      { title: "Activity Logs", url: "/activity", icon: ScrollText },
      { title: "Staff & Roles", url: "/settings/staff", icon: Shield },
      { title: "Delivery Radius", url: "/settings/delivery-radius", icon: MapPinned },
      { title: "Profile", url: "/settings/profile", icon: UserCog },
      { title: "Restaurant", url: "/settings", icon: Settings },
      { title: "System", url: "/settings/system", icon: SlidersHorizontal },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground font-bold shadow-sm">
            HH
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">Happy Home</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Restaurant Admin</span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link
                          to={item.url}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md transition-colors",
                            active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
