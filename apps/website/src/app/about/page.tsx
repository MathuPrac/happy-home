import type { Metadata } from 'next';
import { AboutPage } from '@/pages/about-page';

export const metadata: Metadata = {
  title: 'About',
  description:
    'The story of Happy Home: a family of cooks from Colombo and Kerala bringing heritage to a modern table.',
  alternates: { canonical: '/about' },
};

export default function Page() {
  return <AboutPage />;
}
