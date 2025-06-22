import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  title: 'Spotify - Web Player: Music for everyone',
  description: 'Music for everyone',
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
        <link rel="icon" href="/media/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
