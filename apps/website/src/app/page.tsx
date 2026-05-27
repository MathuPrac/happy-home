import type { Metadata } from 'next';
import { HomePage } from '@/pages/home-page';

export const metadata: Metadata = {
  title: 'Happy Home — Modern Sri Lankan & Indian Fine Dining',
  description:
    'Happy Home Restaurant. A modern, minimal and luxurious table for the soulful flavours of Sri Lanka and India in the heart of Colombo.',
  alternates: { canonical: '/' },
};

const restaurantJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Happy Home Restaurant',
  servesCuisine: ['Sri Lankan', 'Indian'],
  priceRange: '$$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '24 Galle Face Terrace',
    addressLocality: 'Colombo',
    addressCountry: 'LK',
  },
  telephone: '+94112345678',
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
      />
      <HomePage />
    </>
  );
}
