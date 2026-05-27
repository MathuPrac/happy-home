import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, Mail, Phone, Lock } from "lucide-react";
import { MobileShell } from "@/components/layout/MobileShell";
import { ScreenHeader } from "@/components/layout/ScreenHeader";

export const Route = createFileRoute("/auth/register")({
  component: Register,
});

function Register() {
  const nav = useNavigate();
  return (
    <MobileShell>
      <ScreenHeader transparent />
      <div className="px-6 pt-2 pb-8">
        <h1 className="font-display text-3xl font-bold leading-tight">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">Earn 100 welcome points on your first order.</p>

        <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/auth/otp" }); }} className="mt-8 space-y-3">
          <Field icon={<User className="h-4 w-4" />} placeholder="Full name" />
          <Field icon={<Mail className="h-4 w-4" />} placeholder="Email" type="email" />
          <Field icon={<Phone className="h-4 w-4" />} placeholder="+94 7X XXX XXXX" type="tel" />
          <Field icon={<Lock className="h-4 w-4" />} placeholder="Create password" type="password" />

          <label className="flex items-start gap-2 mt-4 text-xs text-muted-foreground">
            <input type="checkbox" defaultChecked className="mt-0.5 accent-[var(--color-accent)]" />
            <span>I agree to Happy Home's <span className="text-accent">Terms</span> and <span className="text-accent">Privacy Policy</span>.</span>
          </label>

          <button
            type="submit"
            className="w-full mt-2 h-13 py-4 rounded-2xl bg-accent text-accent-foreground font-semibold shadow-[var(--shadow-luxe)] active:scale-[0.98] transition"
          >
            Continue
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-accent font-semibold">Sign in</Link>
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
