import type { Metadata } from 'next';
import { ContactPage } from '@/pages/contact-page';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Visit Happy Home at 24 Galle Face Terrace, Colombo. Call, email, or get directions.',
  alternates: { canonical: '/contact' },
};

export default function Page() {
  return <ContactPage />;
}
