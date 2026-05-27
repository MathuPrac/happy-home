'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { milestones } from '@/features/about/data/milestones.data';
import { PageShell } from '@/layouts/page-shell';
import { SectionTitle } from '@/layouts/section-title';

export function AboutPage() {
  return (
    <PageShell>
      <section className="container-luxe pb-32 pt-20">
        <div className="grid gap-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">Our story</div>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] md:text-7xl">
              Two kitchens.
              <br />
              <span className="gradient-text italic">One quiet room.</span>
            </h1>
          </div>
          <div className="md:col-span-5">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Happy Home began as a six-seat kitchen on Galle Road, run by a grandmother who refused
              to write down a single recipe. Three decades on, her granddaughter still cooks from
              memory — only the room has changed.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
          className="relative mt-20 aspect-[16/9] overflow-hidden rounded-sm"
        >
          <Image
            src="/images/interior.jpg"
            alt="Interior of Happy Home"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </section>

      <section className="container-luxe grid gap-20 pb-32 md:grid-cols-2">
        <div>
          <SectionTitle
            eyebrow="The kitchen"
            title="Cooked from memory, plated with intention."
          />
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Our pantry is small and obsessive. Curry leaves from a single grove in Negombo. Saffron
            pulled from Kashmir. Coconuts cracked the morning of. Everything ground in stone — the
            only piece of equipment Amma insisted travel with us.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            We don&apos;t fuse cuisines. We let Sri Lanka and India sit beside each other on the
            table the way they sit beside each other on the map — two voices, one quiet
            conversation.
          </p>
        </div>

        <div>
          <SectionTitle eyebrow="Milestones" title="Thirty years, a few quiet steps." />
          <ol className="mt-10 space-y-6">
            {milestones.map((milestone, index) => (
              <motion.li
                key={milestone.year}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative flex gap-6 border-l border-border pl-6"
              >
                <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-gold" />
                <span className="w-20 shrink-0 font-display text-2xl text-gold">{milestone.year}</span>
                <p className="pt-1 leading-relaxed text-muted-foreground">{milestone.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </PageShell>
  );
}
