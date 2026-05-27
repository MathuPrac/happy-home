import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar, Users, Clock, Check } from "lucide-react";
import { PageShell, SectionTitle } from "@/components/PageShell";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Happy Home Restaurant" },
      { name: "description", content: "Reserve your table at Happy Home. Sri Lankan and Indian fine dining in Colombo, Tuesday to Sunday." },
      { property: "og:title", content: "Reservations — Happy Home Restaurant" },
      { property: "og:description", content: "Reserve your table at Happy Home." },
      { property: "og:url", content: "/reservations" },
    ],
    links: [{ rel: "canonical", href: "/reservations" }],
  }),
  component: ReservationsPage,
});

const times = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];

function ReservationsPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageShell>
      <section className="container-luxe py-20">
        <SectionTitle
          eyebrow="Reservations"
          title="Reserve your evening."
          lead="A small room. We seat 36 guests per service — bookings open 30 days ahead. For parties of 7 or more, please email us directly."
        />

        <div className="mt-16 grid gap-12 md:grid-cols-5">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="md:col-span-3 space-y-8 rounded-sm border border-border bg-card p-8 md:p-10"
          >
            {submitted ? (
              <div className="flex flex-col items-center text-center py-16">
                <div className="h-16 w-16 rounded-full border border-gold flex items-center justify-center">
                  <Check className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-6 font-display text-3xl">Request received.</h3>
                <p className="mt-3 text-muted-foreground max-w-sm">
                  We'll confirm your table within two hours. A holding email is on its way.
                </p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label="First name" required><input required type="text" className="luxe-input" /></Field>
                  <Field label="Last name" required><input required type="text" className="luxe-input" /></Field>
                  <Field label="Email" required><input required type="email" className="luxe-input" /></Field>
                  <Field label="Phone"><input type="tel" className="luxe-input" /></Field>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <Field label="Date" icon={<Calendar className="h-4 w-4" />} required>
                    <input required type="date" className="luxe-input" />
                  </Field>
                  <Field label="Guests" icon={<Users className="h-4 w-4" />} required>
                    <select className="luxe-input" required>
                      {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Time" icon={<Clock className="h-4 w-4" />} required>
                    <select className="luxe-input" required>
                      {times.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Occasion or notes">
                  <textarea rows={3} className="luxe-input resize-none" placeholder="Anniversary, dietary requests…" />
                </Field>

                <button
                  type="submit"
                  className="w-full rounded-sm bg-gold py-4 text-sm uppercase tracking-[0.25em] text-primary-foreground transition-all hover:shadow-luxe"
                >
                  Request reservation
                </button>
              </>
            )}
          </motion.form>

          <aside className="md:col-span-2 space-y-8">
            <div className="rounded-sm border border-border bg-card/60 p-8">
              <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Service hours</h4>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-muted-foreground">Tuesday – Thursday</span><span>6:00 — 10:30 pm</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Friday – Saturday</span><span>6:00 — 11:00 pm</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Sunday</span><span>6:00 — 10:00 pm</span></li>
                <li className="flex justify-between"><span className="text-muted-foreground">Monday</span><span>Closed</span></li>
              </ul>
            </div>

            <div className="rounded-sm border border-border bg-card/60 p-8">
              <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Private dining</h4>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Our brass room seats up to twelve for tasting menus and quiet celebrations. Reach out at <a className="text-gold hover:underline" href="mailto:private@happyhome.lk">private@happyhome.lk</a>.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <style>{`
        .luxe-input {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 0.85rem 1rem;
          color: var(--foreground);
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }
        .luxe-input:focus {
          outline: none;
          border-color: var(--gold);
        }
        .luxe-input::placeholder { color: oklch(0.55 0.02 80); }
      `}</style>
    </PageShell>
  );
}

function Field({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {icon && <span className="text-gold">{icon}</span>}
        {label}{required && <span className="text-gold">*</span>}
      </span>
      {children}
    </label>
  );
}
