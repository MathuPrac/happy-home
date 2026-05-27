import { Cormorant_Garamond, Inter } from 'next/font/google';

export const fontDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
});

export const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});
