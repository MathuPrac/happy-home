import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { ChefHat, Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Happy Home Admin" },
      { name: "description", content: "Sign in to the Happy Home restaurant admin dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Welcome back, Saman");
      navigate({ to: "/" });
    }, 700);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-chart-5 to-chart-1 lg:flex">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_30%_20%,white_0,transparent_45%),radial-gradient(circle_at_80%_70%,white_0,transparent_40%)]" />
        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Happy Home</div>
              <div className="text-xs uppercase tracking-widest opacity-80">Restaurant Admin</div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight">
              Run your restaurant<br />like a flagship.
            </h1>
            <p className="max-w-md text-base opacity-90">
              One operational cockpit for orders, kitchen, riders, reservations, and revenue — built for the pace of a real Sri Lankan + Indian kitchen.
            </p>
            <div className="grid max-w-md grid-cols-3 gap-3 text-sm">
              {[
                { k: "Avg ticket", v: "Rs 1,842" },
                { k: "Orders / day", v: "184" },
                { k: "On-time", v: "96%" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg bg-white/10 p-3 backdrop-blur">
                  <div className="text-xs opacity-80">{s.k}</div>
                  <div className="mt-1 text-lg font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs opacity-70">© 2026 Happy Home Restaurant · Colombo</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-md">
          <Card className="border-border/60 shadow-xl">
            <CardContent className="p-8">
              <div className="mb-6 lg:hidden">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-5 text-primary-foreground font-bold">HH</div>
                  <div className="font-semibold">Happy Home</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="mt-1 text-sm text-muted-foreground">Use your staff credentials to continue.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="saman@happyhome.lk" required />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/login" className="text-xs text-primary hover:underline">Forgot?</Link>
                  </div>
                  <Input id="password" type="password" defaultValue="••••••••" required />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" defaultChecked />
                  <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">Keep me signed in for 14 days</Label>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Sign in to dashboard
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Demo:</span> any credentials work. Roles supported — Admin, Receptionist, Kitchen, Order Manager, Delivery Coordinator.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
