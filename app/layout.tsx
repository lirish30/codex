import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { KiboThemeProvider } from '@/components/theme/KiboThemeProvider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kibo UI Todo',
  description: 'Simple todo list built with Next.js and Kibo UI in dark mode.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <KiboThemeProvider>{children}</KiboThemeProvider>
      </body>
    </html>
  );
}
