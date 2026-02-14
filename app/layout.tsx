import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RYVYNN - From Our Darkest Hours to Our Brightest Days',
  description: 'Privacy-first AI mental wellness. Zero surveillance, radical anonymity. Transform confessions into miracles.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
