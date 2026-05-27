import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP } from "@/constants/app";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("+94 77 123 4567");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => nav({ to: "/app/dashboard" }), 700);
  };

  return (
    <div className="device-shell flex flex-col min-h-screen">
      <div className="px-6 pt-12 pb-8 bg-brand text-brand-foreground rounded-b-[2rem]">
        <div className="h-14 w-14 rounded-2xl bg-white/15 grid place-items-center"><Bike className="h-7 w-7" /></div>
        <h1 className="mt-6 text-2xl font-bold">Rider Sign in</h1>
        <p className="text-sm opacity-90 mt-1">{APP.restaurant} · Internal delivery staff</p>
      </div>

      <form onSubmit={submit} className="flex-1 px-6 py-8 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Phone number</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 text-base" inputMode="tel" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">PIN code</label>
          <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter 4-digit PIN" type="password" inputMode="numeric" maxLength={4} className="h-12 text-base tracking-[0.5em]" />
        </div>
        <Button type="submit" disabled={loading} className="w-full h-12 bg-brand hover:bg-brand/90 text-brand-foreground text-base font-semibold rounded-xl">
          {loading ? "Signing in…" : (<>Sign in <ArrowRight className="h-4 w-4 ml-1" /></>)}
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
          <ShieldCheck className="h-4 w-4" /> Secured · staff-only access
        </div>
      </form>
    </div>
  );
}
