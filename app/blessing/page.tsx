'use client';

import { useState } from 'react';

export default function BlessingPage() {
  const [blessing, setBlessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function receive() {
    setLoading(true);
    setRevealed(false);
    try {
      const res = await fetch('/api/blessing', { cache: 'no-store' });
      const data = await res.json();
      // brief pause so the flame "ignites" before the words arrive
      setTimeout(() => {
        setBlessing(data.blessing);
        setRevealed(true);
        setLoading(false);
      }, 700);
    } catch {
      setBlessing('You are here. That is enough for right now.');
      setRevealed(true);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-ryvynn-cyan/70 mb-flame-sm">
          The Vault
        </p>
        <h1 className="text-3xl sm:text-4xl font-light mb-flame-md">
          Receive a{' '}
          <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent font-semibold">
            Blessing
          </span>
        </h1>
        <p className="text-white/50 text-sm mb-flame-xl">
          A single message, drawn for you. No name. No tracking. Just light.
        </p>

        <div className="min-h-[180px] flex items-center justify-center mb-flame-lg">
          {loading && (
            <div className="h-16 w-16 rounded-full animate-glow-cyan animate-float bg-gradient-to-br from-ryvynn-cyan to-ryvynn-purple opacity-80" />
          )}
          {!loading && revealed && blessing && (
            <p className="text-lg sm:text-xl leading-relaxed text-white/90 animate-float">
              {blessing}
            </p>
          )}
          {!loading && !revealed && (
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-ryvynn-cyan/40 to-ryvynn-purple/40" />
          )}
        </div>

        <button
          onClick={receive}
          disabled={loading}
          className="px-flame-lg py-flame-sm rounded-sacred-xl border border-ryvynn-cyan/40 bg-gradient-to-r from-ryvynn-cyan/10 to-ryvynn-purple/10 hover:from-ryvynn-cyan/20 hover:to-ryvynn-purple/20 transition-all animate-glow-purple disabled:opacity-50"
        >
          {blessing ? 'Receive another' : 'Receive a blessing'}
        </button>

        <div className="mt-flame-xl">
          <a href="/" className="text-white/40 text-sm hover:text-white/70 transition-colors">
            ← Back home
          </a>
        </div>
      </div>
    </main>
  );
}
