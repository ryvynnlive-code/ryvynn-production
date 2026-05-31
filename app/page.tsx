// app/page.tsx
// The entrance. One door, one direction.
// Server Component — no client state, no tracking, instant paint.

import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RYVYNN — You are not alone right now.',
  description:
    'A private space to say what you cannot say anywhere else. No account. No memory. No one watching. It disappears when you leave.',
};

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#050510' }}
    >
      {/* Ambient dual-flame glow — purely decorative, no images */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,255,0.07) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(155,48,255,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 text-center max-w-md mx-auto">

        {/* Logo */}
        <Image
          src="/assets/dual-flame-logo.png"
          alt="RYVYNN"
          width={64}
          height={64}
          priority
          className="opacity-80"
        />

        {/* Core statement */}
        <div className="space-y-4">
          <h1
            className="text-2xl font-light tracking-wide leading-snug"
            style={{ color: 'rgba(255,255,255,0.88)' }}
          >
            You don&apos;t have to be okay right now.
          </h1>
          <p
            className="text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: 'rgba(255,255,255,0.36)' }}
          >
            This is a private space to say what you cannot say anywhere else.
            <br />
            No account. No memory. No one watching.
            <br />
            Everything disappears when you leave.
          </p>
        </div>

        {/* Primary CTA */}
        <Link
          href="/sanctuary"
          className="inline-block px-9 py-3 rounded-full text-sm font-medium
                     border transition-all duration-300
                     hover:scale-[1.03] focus:outline-none focus-visible:ring-2
                     focus-visible:ring-cyan-400"
          style={{
            background:  'linear-gradient(135deg, rgba(0,255,255,0.08), rgba(155,48,255,0.08))',
            borderColor: 'rgba(0,255,255,0.25)',
            color:       '#00FFFF',
          }}
        >
          Begin in Private
        </Link>

        {/* Secondary paths — quiet, not promoted */}
        <div className="flex items-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
          <Link href="/guardian" className="hover:text-white/50 transition-colors">
            Talk to Guardian AI
          </Link>
          <span aria-hidden>·</span>
          <Link href="/wall" className="hover:text-white/50 transition-colors">
            Confession Wall
          </Link>
          <span aria-hidden>·</span>
          <Link href="/journal" className="hover:text-white/50 transition-colors">
            Private Journal
          </Link>
        </div>

        {/* Crisis access — always visible, never alarming */}
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
          In crisis?{' '}
          <a
            href="tel:988"
            className="underline underline-offset-2 hover:text-white/40 transition-colors"
            style={{ color: 'rgba(255,255,255,0.30)' }}
          >
            988 is free, always.
          </a>
        </p>
      </div>

      {/* Footer — legal, whispered */}
      <footer
        className="absolute bottom-6 w-full text-center text-xs"
        style={{ color: 'rgba(255,255,255,0.12)' }}
      >
        © {new Date().getFullYear()} NEXXT GEN INNOVATIONS LLC · RYVYNN · AONIXX
      </footer>
    </main>
  );
}
