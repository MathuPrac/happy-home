import { PageShell } from '@/layouts/page-shell';
import { AppCtaSection } from '@/sections/shared/app-cta-section';
import { HeroSection } from '@/sections/home/hero-section';
import { PhilosophySection } from '@/sections/home/philosophy-section';
import { SignaturesSection } from '@/sections/home/signatures-section';

export function HomePage() {
  return (
    <PageShell>
      <HeroSection />
      <PhilosophySection />
      <SignaturesSection />
      <AppCtaSection />
    </PageShell>
  );
}
