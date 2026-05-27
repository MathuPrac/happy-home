'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative -mt-20 flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
      </div>

      <div className="container-luxe relative z-10 pb-24 pt-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          className="max-w-3xl"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gold"
          >
            <span className="h-px w-10 bg-gold" /> Sri Lankan · Indian · Est. 1998
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.9 }}
            className="mt-6 font-display text-6xl leading-[0.95] tracking-tight md:text-8xl"
          >
            A modern table <br />
            for <span className="gradient-text italic">timeless</span> spice.
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Two heritages, one quiet room. Chef Anika reimagines the grandmothers&apos; classics of
            Colombo and Kerala — composed with restraint, plated with intention.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <Link
              href="/reservations"
              className="group inline-flex items-center justify-center gap-3 rounded-sm bg-gold px-8 py-4 text-sm uppercase tracking-[0.25em] text-primary-foreground transition-all hover:shadow-luxe"
            >
              Reserve a table
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-foreground transition-colors hover:text-gold"
            >
              View the menu →
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground"
      >
        Scroll
      </motion.div>
    </section>
  );
}
