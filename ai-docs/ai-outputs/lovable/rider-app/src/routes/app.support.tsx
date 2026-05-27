import { createFileRoute } from "@tanstack/react-router";
import { Phone, AlertTriangle, ShieldAlert, MapPin } from "lucide-react";
import { AppHeader } from "@/components/rider/AppHeader";
import { APP } from "@/constants/app";

export const Route = createFileRoute("/app/support")({ component: Support });

function Support() {
  return (
    <>
      <AppHeader title="Emergency Support" back />
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div className="rounded-2xl bg-destructive text-destructive-foreground p-5">
          <ShieldAlert className="h-8 w-8" />
          <h2 className="mt-3 text-lg font-bold">In an emergency?</h2>
          <p className="text-sm opacity-90 mt-1">Tap the SOS button. Restaurant ops and emergency contacts will be alerted with your live location.</p>
          <button className="mt-4 w-full h-12 rounded-xl bg-white text-destructive font-bold">
            SOS · Send alert
          </button>
        </div>

        <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
          <SupportRow icon={Phone} title="Call restaurant ops" subtitle={APP.supportPhone} href={`tel:${APP.supportPhone}`} />
          <SupportRow icon={AlertTriangle} title="Report an incident" subtitle="Accident, theft, or harassment" />
          <SupportRow icon={MapPin} title="Vehicle breakdown" subtitle="Request roadside assistance" />
        </div>

        <p className="text-xs text-muted-foreground text-center px-6">
          Your safety comes first. Pull over to a safe spot before using these features.
        </p>
      </div>
    </>
  );
}

function SupportRow({ icon: Icon, title, subtitle, href }: { icon: React.ElementType; title: string; subtitle: string; href?: string }) {
  const Wrap: any = href ? "a" : "div";
  return (
    <Wrap href={href} className="flex items-center gap-3 px-4 py-3.5">
      <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive grid place-items-center"><Icon className="h-5 w-5" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
    </Wrap>
  );
}
