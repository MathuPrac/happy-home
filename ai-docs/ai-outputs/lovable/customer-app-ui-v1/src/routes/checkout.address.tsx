import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Home, Briefcase, Plus, AlertTriangle } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { RESTAURANT } from "@/constants/mock-data";

export const Route = createFileRoute("/checkout/address")({
  component: AddressScreen,
});

const ADDRESSES = [
  { id: "a1", label: "Home", icon: Home, address: "Apt 14B, Cinnamon Gardens, Colombo 07", distance: 3.2 },
  { id: "a2", label: "Office", icon: Briefcase, address: "Level 12, World Trade Center, Colombo 01", distance: 5.4 },
  { id: "a3", label: "Mom's place", icon: Home, address: "182 Galle Road, Mount Lavinia", distance: 12.8 },
];

function AddressScreen() {
  const router = useRouter();
  const [sel, setSel] = useState("a1");
  const selected = ADDRESSES.find((a) => a.id === sel)!;
  const outOfRange = selected.distance > RESTAURANT.deliveryRadiusKm;

  return (
    <MobileShell>
      <ScreenHeader title="Delivery address" />

      {/* Map placeholder */}
      <div className="relative h-56 mx-5 mt-2 rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-muted">
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 16px, color-mix(in oklab, var(--color-muted-foreground) 18%, transparent) 16px, color-mix(in oklab, var(--color-muted-foreground) 18%, transparent) 17px)`,
        }} />
        <div className="absolute inset-x-0 top-4 mx-auto w-fit px-3 py-1.5 rounded-full bg-card border border-border text-[11px] font-medium">
          📍 Map preview
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-accent/30 animate-ping" />
            <div className="relative grid place-items-center h-12 w-12 rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-luxe)]">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {outOfRange && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-spice/10 border border-spice/30">
            <AlertTriangle className="h-5 w-5 text-spice flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-spice">Outside delivery area</p>
              <p className="text-xs text-muted-foreground mt-1">
                Delivery is currently unavailable in your area. We deliver within {RESTAURANT.deliveryRadiusKm} km of our restaurant.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs uppercase tracking-wider text-muted-foreground">Saved addresses</p>
        {ADDRESSES.map((a) => {
          const Icon = a.icon;
          const active = sel === a.id;
          const tooFar = a.distance > RESTAURANT.deliveryRadiusKm;
          return (
            <button
              key={a.id}
              onClick={() => setSel(a.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition ${
                active ? "border-accent bg-accent/5" : "border-border bg-card"
              } ${tooFar ? "opacity-60" : ""}`}
            >
              <span className={`grid place-items-center h-10 w-10 rounded-xl ${active ? "bg-accent text-accent-foreground" : "bg-secondary"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{a.label}</p>
                <p className="text-xs text-muted-foreground truncate">{a.address}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.distance} km away</p>
              </div>
              <span className={`h-5 w-5 rounded-full border-2 ${active ? "border-accent bg-accent" : "border-border"}`}>
                {active && <span className="block h-2 w-2 bg-accent-foreground rounded-full m-auto mt-[5px]" />}
              </span>
            </button>
          );
        })}

        <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-accent">
          <Plus className="h-4 w-4" /> Add new address
        </button>

        <button
          onClick={() => router.history.back()}
          disabled={outOfRange}
          className="w-full mt-4 h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition disabled:opacity-50"
        >
          Use this address
        </button>
      </div>
    </MobileShell>
  );
}
