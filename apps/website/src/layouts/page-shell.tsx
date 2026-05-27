'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/layouts/site-footer';
import { SiteHeader } from '@/layouts/site-header';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 pt-20"
      >
        {children}
      </motion.main>
      <SiteFooter />
    </div>
  );
}
