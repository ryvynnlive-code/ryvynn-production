'use client';
import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function UpsellPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-16 text-white">
      <Flame className="h-16 w-16 text-fuchsia-500 mb-6" style={{ filter: 'drop-shadow(0 0 20px rgba(192,38,211,0.7))' }} />
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">Your Eternity Message Awaits</h1>
      <p className="text-zinc-400 text-center mb-10 max-w-md">
        Encrypted letters to your bloodline. A vault only you can burn or pass on. Locked until flame ignition.
      </p>
      <div className="relative w-full max-w-sm h-56 rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-950 to-zinc-950" />
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center space-y-2 blur-sm select-none pointer-events-none">
            <p className="text-zinc-300 text-sm italic">"To my daughter, when you find this..."</p>
            <p className="text-zinc-500 text-xs">• • • • • • • • • •</p>
            <p className="text-zinc-400 text-xs">Deliver on: 01/01/2040</p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 rounded-xl px-6 py-3 border border-fuchsia-800/50">
            <p className="text-fuchsia-300 text-sm font-semibold">🔒 Unlock with Lifetime Flame</p>
          </div>
        </div>
      </div>
      <Link
        href="/pricing"
        className="inline-block px-10 py-4 rounded-xl font-bold text-base text-black"
        style={{ background: 'linear-gradient(135deg,#ca8a04,#ea580c)', boxShadow: '0 0 30px rgba(202,138,4,0.4)' }}
      >
        🔥 See All Tiers — Starting Free
      </Link>
      <p className="text-zinc-600 text-xs mt-4">Crisis access is always free. Eternity starts at $369.36 — one time.</p>
    </main>
  );
}
