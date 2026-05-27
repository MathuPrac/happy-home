import type { Metadata } from 'next';
import { MenuPage } from '@/pages/menu-page';

export const metadata: Metadata = {
  title: 'Menu',
  description:
    'Explore the Happy Home menu: signature Sri Lankan curries, Indian classics, breads, rice, and heritage desserts.',
  alternates: { canonical: '/menu' },
};

export default function Page() {
  return <MenuPage />;
}
