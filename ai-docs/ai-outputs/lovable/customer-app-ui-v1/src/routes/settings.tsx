import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useTheme } from "@/store/theme";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const mode = useTheme((s) => s.mode);
  const setMode = useTheme((s) => s.set);
  const [push, setPush] = useState(true);
  const [promo, setPromo] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <MobileShell>
      <ScreenHeader title="Settings" />
      <div className="px-5 py-4 space-y-5 pb-10">
        <Group title="Appearance">
          <div className="p-4">
            <p className="text-sm font-semibold mb-3">Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {(["light", "dark"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-3 rounded-xl text-sm font-semibold capitalize transition ${
                    mode === m ? "bg-accent text-accent-foreground" : "bg-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </Group>

        <Group title="Notifications">
          <Toggle label="Order updates" value={push} onChange={setPush} />
          <Toggle label="Promotions & offers" value={promo} onChange={setPromo} />
          <Toggle label="Haptic feedback" value={haptics} onChange={setHaptics} />
        </Group>

        <Group title="Preferences">
          <Static label="Language" value="English" />
          <Static label="Currency" value="LKR (Rs.)" />
          <Static label="Default tip" value="10%" />
        </Group>

        <Group title="About">
          <Static label="Version" value="1.0.0" />
          <Static label="Privacy policy" value="" />
          <Static label="Terms of service" value="" />
        </Group>
      </div>
    </MobileShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">{title}</p>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-accent" : "bg-secondary"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Static({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
