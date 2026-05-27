'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionTitle } from '@/layouts/section-title';

export function PhilosophySection() {
  return (
    <section className="container-luxe grid gap-16 py-32 md:grid-cols-2 md:items-center">
      <SectionTitle
        eyebrow="The philosophy"
        title="Heritage, plated quietly."
        lead="We cook from memory — the brass pots of a Jaffna kitchen, the tandoors of old Delhi. Then we strip everything back: one technique, one ingredient at the centre, one perfect bite. No theatre. Just intention."
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative aspect-[4/5] overflow-hidden rounded-sm"
      >
        <Image
          src="/images/interior.jpg"
          alt="Happy Home dining room"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-gold/20" />
      </motion.div>
    </section>
  );
}
