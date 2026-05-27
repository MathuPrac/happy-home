'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check, Clock, Users } from 'lucide-react';
import { reservationTimes } from '@/features/reservations/data/reservation-options';
import { PageShell } from '@/layouts/page-shell';
import { SectionTitle } from '@/layouts/section-title';

function ReservationField({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {icon ? <span className="text-gold">{icon}</span> : null}
        {label}
        {required ? <span className="text-gold">*</span> : null}
      </span>
      {children}
    </label>
  );
}

export function ReservationsPage() {
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
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-8 rounded-sm border border-border bg-card p-8 md:col-span-3 md:p-10"
          >
            {submitted ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold">
                  <Check className="h-7 w-7 text-gold" />
                </div>
                <h3 className="mt-6 font-display text-3xl">Request received.</h3>
                <p className="mt-3 max-w-sm text-muted-foreground">
                  We&apos;ll confirm your table within two hours. A holding email is on its way.
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <ReservationField label="First name" required>
                    <input required type="text" className="luxe-input" />
                  </ReservationField>
                  <ReservationField label="Last name" required>
                    <input required type="text" className="luxe-input" />
                  </ReservationField>
                  <ReservationField label="Email" required>
                    <input required type="email" className="luxe-input" />
                  </ReservationField>
                  <ReservationField label="Phone">
                    <input type="tel" className="luxe-input" />
                  </ReservationField>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  <ReservationField label="Date" icon={<Calendar className="h-4 w-4" />} required>
                    <input required type="date" className="luxe-input" />
                  </ReservationField>
                  <ReservationField label="Guests" icon={<Users className="h-4 w-4" />} required>
                    <select className="luxe-input" required>
                      {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </ReservationField>
                  <ReservationField label="Time" icon={<Clock className="h-4 w-4" />} required>
                    <select className="luxe-input" required>
                      {reservationTimes.map((time) => (
                        <option key={time}>{time}</option>
                      ))}
                    </select>
                  </ReservationField>
                </div>

                <ReservationField label="Occasion or notes">
                  <textarea
                    rows={3}
                    className="luxe-input resize-none"
                    placeholder="Anniversary, dietary requests…"
                  />
                </ReservationField>

                <button
                  type="submit"
                  className="w-full rounded-sm bg-gold py-4 text-sm uppercase tracking-[0.25em] text-primary-foreground transition-all hover:shadow-luxe"
                >
                  Request reservation
                </button>
              </>
            )}
          </motion.form>

          <aside className="space-y-8 md:col-span-2">
            <div className="rounded-sm border border-border bg-card/60 p-8">
              <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Service hours</h4>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Tuesday – Thursday</span>
                  <span>6:00 — 10:30 pm</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Friday – Saturday</span>
                  <span>6:00 — 11:00 pm</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span>6:00 — 10:00 pm</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Monday</span>
                  <span>Closed</span>
                </li>
              </ul>
            </div>

            <div className="rounded-sm border border-border bg-card/60 p-8">
              <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Private dining</h4>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Our brass room seats up to twelve for tasting menus and quiet celebrations. Reach
                out at{' '}
                <a className="text-gold hover:underline" href="mailto:private@happyhome.lk">
                  private@happyhome.lk
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
