import type { Metadata } from 'next';
import { ReservationsPage } from '@/pages/reservations-page';

export const metadata: Metadata = {
  title: 'Reservations',
  description:
    'Reserve your table at Happy Home. Sri Lankan and Indian fine dining in Colombo, Tuesday to Sunday.',
  alternates: { canonical: '/reservations' },
};

export default function Page() {
  return <ReservationsPage />;
}
