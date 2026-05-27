import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/rider/AppHeader";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { Bell, Moon, MapPin, Languages, Lock, Volume2 } from "lucide-react";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Settings() {
  const { theme, toggle } = useTheme();
  return (
    <>
      <AppHeader title="Settings" back />
      <div className="px-4 pt-3 pb-6 space-y-3">
        <Group title="Preferences">
          <Item icon={Moon} label="Dark mode" right={<Switch checked={theme === "dark"} onCheckedChange={toggle} />} />
          <Item icon={Bell} label="Push notifications" right={<Switch defaultChecked />} />
          <Item icon={Volume2} label="Order sound alerts" right={<Switch defaultChecked />} />
          <Item icon={MapPin} label="Background location" right={<Switch defaultChecked />} />
        </Group>
        <Group title="Account">
          <Item icon={Languages} label="Language" right={<span className="text-sm text-muted-foreground">English</span>} />
          <Item icon={Lock} label="Change PIN" right={<span className="text-sm text-muted-foreground">›</span>} />
        </Group>
      </div>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 mb-2">{title}</p>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">{children}</div>
    </div>
  );
}

function Item({ icon: Icon, label, right }: { icon: React.ElementType; label: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      {right}
    </div>
  );
}
