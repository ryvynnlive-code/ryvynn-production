'use client';

import { useState } from 'react';

export default function BlessingPage() {
  const [text, setText] = useState('');
  const [blessing, setBlessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function receive() {
    setLoading(true);
    setRevealed(false);
    try {
      const hasText = text.trim().length >= 2;
      const res = await fetch('/api/blessing', {
        method: hasText ? 'POST' : 'GET',
        headers: hasText ? { 'Content-Type': 'application/json' } : undefined,
        body: hasText ? JSON.stringify({ text }) : undefined,
        cache: 'no-store',
      });
      const data = await res.json();
      setTimeout(() => {
        setBlessing(data.blessing || 'You are here. That is enough for right now.');
        setRevealed(true);
        setLoading(false);
      }, 650);
    } catch {
      setBlessing('You are here. That is enough for right now.');
      setRevealed(true);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <p className="uppercase tracking-[0.3em] text-xs text-ryvynn-cyan/70 mb-flame-sm">The Vault</p>
        <h1 className="text-3xl sm:text-4xl font-light mb-flame-md">
          Receive a{' '}
          <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent font-semibold">Blessing</span>
        </h1>
        <p className="text-white/50 text-sm mb-flame-lg">
          Tell the Flame what you're carrying and it will write one for you — or leave it empty and just receive some light.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="What are you carrying? (optional)"
          className="w-full bg-white/5 border border-white/10 rounded-sacred-lg p-flame-sm text-white/90 placeholder-white/30 focus:border-ryvynn-cyan/50 focus:outline-none mb-flame-lg text-sm"
        />

        <div className="min-h-[150px] flex items-center justify-center mb-flame-lg">
          {loading && (
            <div className="h-16 w-16 rounded-full animate-glow-cyan animate-float bg-gradient-to-br from-ryvynn-cyan to-ryvynn-purple opacity-80" />
          )}
          {!loading && revealed && blessing && (
            <p className="text-lg sm:text-xl leading-relaxed text-white/90 animate-float whitespace-pre-line">{blessing}</p>
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
          {loading ? 'Receiving…' : blessing ? 'Receive another' : 'Receive a blessing'}
        </button>

        <div className="mt-flame-xl">
          <a href="/" className="text-white/40 text-sm hover:text-white/70 transition-colors">← Back home</a>
        </div>
      </div>
    </main>
  );
}
