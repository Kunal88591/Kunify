import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

// Add viewport export for themeColor and other viewport options
export const viewport = {
  themeColor: '#000000', // Use your preferred color (e.g., black for Spotify-like)
  width: 'device-width',
  initialScale: 1,
  // ...other viewport options as needed
};

// Metadata export (do not include themeColor here)
export const metadata = {
  title: {
    default: 'Spotify - Web Player: Music for everyone',
    template: '%s | Spotify Web Player'
  },
  description: 'Stream millions of songs with Spotify Web Player',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="app-layout">
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
