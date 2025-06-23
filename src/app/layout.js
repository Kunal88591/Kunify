// This is a Server Component by default (no 'use client')

import './globals.css';
import { Montserrat } from 'next/font/google';
import { PlayerProvider } from '@/context/PlayerContext';
import ThemeInitializer from '@/components/ThemeInitializer';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} antialiased`}>
      <body className={`${montserrat.className} bg-background text-foreground`}>
        <PlayerProvider>
          <ThemeInitializer />
          <div className="app-container">{children}</div>
        </PlayerProvider>
      </body>
    </html>
  );
}
