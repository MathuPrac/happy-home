import type { Metadata } from 'next';
import { AppProviders } from '@/lib/providers';
import { fontDisplay, fontSans } from '@/lib/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Happy Home — Modern Sri Lankan & Indian Fine Dining',
    template: '%s — Happy Home Restaurant',
  },
  description:
    'A modern, minimal table for the soulful flavours of Sri Lanka and India in the heart of Colombo.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    siteName: 'Happy Home Restaurant',
    type: 'website',
    locale: 'en_LK',
  },
  themeColor: '#1a1410',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontDisplay.variable} ${fontSans.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
