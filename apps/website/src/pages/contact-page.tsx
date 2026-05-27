'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { contactChannels } from '@/features/contact/data/contact-channels.data';
import { PageShell } from '@/layouts/page-shell';
import { SectionTitle } from '@/layouts/section-title';

export function ContactPage() {
  return (
    <PageShell>
      <section className="container-luxe py-20">
        <SectionTitle
          eyebrow="Contact"
          title="Come and find us."
          lead="A townhouse on the Terrace, three doors from the ocean. The brass door is always the right one."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.a
                key={channel.label}
                href={channel.href}
                target={channel.external ? '_blank' : undefined}
                rel={channel.external ? 'noreferrer' : undefined}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
                className="group relative rounded-sm border border-border bg-card p-8 transition-all hover:border-gold/50 hover:shadow-luxe"
              >
                <Icon className="h-6 w-6 text-gold" />
                <div className="mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {channel.label}
                </div>
                <div className="mt-2 whitespace-pre-line font-display text-2xl leading-snug">
                  {channel.value}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
                  {channel.action}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </motion.a>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 aspect-[21/9] overflow-hidden rounded-sm border border-border"
        >
          <iframe
            title="Happy Home location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=79.84%2C6.92%2C79.86%2C6.94&layer=mapnik"
            className="h-full w-full brightness-75 contrast-125 grayscale"
            loading="lazy"
          />
        </motion.div>
      </section>
    </PageShell>
  );
}
