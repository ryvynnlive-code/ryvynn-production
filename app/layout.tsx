import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/components/providers/ReduxProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'RYVYNN — From Our Darkest Hours to Our Brightest Days',
  description: 'Privacy-first AI soul guardian. Zero surveillance, radical anonymity. Transform confessions into miracles. Free crisis access forever.',
  keywords: ['mental wellness', 'anonymous', 'crisis support', 'AI companion', 'privacy first'],
  openGraph: {
    title:       'RYVYNN — From Our Darkest Hours to Our Brightest Days',
    description: 'Privacy-first AI soul guardian. Transform your confession into a miracle.',
    type:        'website',
    url:         'https://ryvynn.live',
  },
};

export const viewport: Viewport = {
  themeColor:   '#0a0a0f',
  width:        'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
