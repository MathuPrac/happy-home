import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Apple } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

export const Route = createFileRoute("/auth/login")({
  component: Login,
});

function Login() {
  const nav = useNavigate();
  return (
    <MobileShell>
      <ScreenHeader transparent />
      <div className="px-6 pt-2 pb-8">
        <h1 className="font-display text-3xl font-bold leading-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to continue your Happy Home experience.</p>

        <form
          onSubmit={(e) => { e.preventDefault(); nav({ to: "/auth/otp" }); }}
          className="mt-8 space-y-3"
        >
          <Field icon={<Mail className="h-4 w-4" />} placeholder="Email or phone" defaultValue="aanya.perera@gmail.com" />
          <Field icon={<Lock className="h-4 w-4" />} placeholder="Password" type="password" defaultValue="••••••••" />
          <div className="flex justify-end">
            <Link to="/auth/login" className="text-xs text-accent font-medium">Forgot password?</Link>
          </div>
          <button
            type="submit"
            className="w-full h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center gap-3 my-7">
          <span className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SocialBtn label="Google" />
          <SocialBtn label="Apple" icon={<Apple className="h-4 w-4" />} />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          New to Happy Home?{" "}
          <Link to="/auth/register" className="text-accent font-semibold">Create account</Link>
        </p>
      </div>
    </MobileShell>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  const { icon, ...rest } = props;
  return (
    <label className="flex items-center gap-3 h-13 px-4 py-3.5 rounded-2xl bg-card border border-border focus-within:ring-2 focus-within:ring-accent transition">
      <span className="text-muted-foreground">{icon}</span>
      <input {...rest} className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
    </label>
  );
}

function SocialBtn({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-card border border-border text-sm font-medium active:scale-[0.98] transition">
      {icon ?? <span className="font-bold text-base">G</span>}
      {label}
    </button>
  );
}
