'use client';

import { useEffect, useState } from 'react';

type Song = {
  title?: string;
  verse1?: string;
  chorus?: string;
  verse2?: string;
  bridge?: string;
  outro?: string;
  dedication?: string;
};

type WallEntry = { id: string; text: string };

export default function SongPage() {
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [text, setText] = useState('');
  const [song, setSong] = useState<Song | null>(null);
  const [held, setHeld] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/wall?limit=6&sortBy=recent', { cache: 'no-store' });
        const data = await res.json();
        const raw = data?.entries || data?.data || (Array.isArray(data) ? data : []);
        const mapped: WallEntry[] = raw
          .map((e: Record<string, unknown>) => ({
            id: String(e.id ?? Math.random()),
            text: String(e.transformation ?? e.confession ?? e.content ?? ''),
          }))
          .filter((e: WallEntry) => e.text.length > 3)
          .slice(0, 6);
        setEntries(mapped);
      } catch {
        // wall optional — user can still type their own
      }
    })();
  }, []);

  async function makeSong() {
    if (text.trim().length < 3) return;
    setLoading(true);
    setSong(null);
    setHeld(null);
    setError(null);
    try {
      const res = await fetch('/api/wall-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.held) setHeld(data.message);
      else if (data.song) setSong(data.song);
      else setError(data.error || 'Something slipped. Try again.');
    } catch {
      setError('Something slipped. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const Section = ({ label, body }: { label: string; body?: string }) =>
    body ? (
      <div className="mb-flame-md">
        <p className="uppercase tracking-[0.25em] text-[10px] text-ryvynn-cyan/60 mb-1">{label}</p>
        <p className="whitespace-pre-line text-white/90 leading-relaxed">{body}</p>
      </div>
    ) : null;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-14">
      <div className="max-w-2xl mx-auto">
        <p className="uppercase tracking-[0.3em] text-xs text-ryvynn-purple/70 mb-flame-sm text-center">
          The Wall, Reimagined
        </p>
        <h1 className="text-3xl sm:text-4xl font-light mb-flame-sm text-center">
          Turn your words into a{' '}
          <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent font-semibold">
            song
          </span>
        </h1>
        <p className="text-white/50 text-sm text-center mb-flame-xl">
          Share something real. The Dual Flame writes it into a song that honors it.
        </p>

        {entries.length > 0 && (
          <div className="mb-flame-lg">
            <p className="text-white/40 text-xs mb-flame-sm">Pull from the wall, or write your own below:</p>
            <div className="flex flex-col gap-2">
              {entries.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setText(e.text)}
                  className="text-left text-sm text-white/70 border border-white/10 rounded-sacred-md px-flame-sm py-2 hover:border-ryvynn-cyan/40 transition-colors"
                >
                  {e.text.length > 120 ? e.text.slice(0, 120) + '…' : e.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          value={text}
          onChange={(ev) => setText(ev.target.value)}
          rows={4}
          placeholder="Write what's on your heart…"
          className="w-full bg-white/5 border border-white/10 rounded-sacred-lg p-flame-sm text-white/90 placeholder-white/30 focus:border-ryvynn-cyan/50 focus:outline-none mb-flame-md"
        />

        <div className="text-center">
          <button
            onClick={makeSong}
            disabled={loading || text.trim().length < 3}
            className="px-flame-lg py-flame-sm rounded-sacred-xl border border-ryvynn-purple/40 bg-gradient-to-r from-ryvynn-cyan/10 to-ryvynn-purple/10 hover:from-ryvynn-cyan/20 hover:to-ryvynn-purple/20 transition-all animate-glow-purple disabled:opacity-40"
          >
            {loading ? 'Writing your song…' : 'Turn this into a song'}
          </button>
        </div>

        {held && (
          <div className="mt-flame-lg border border-ryvynn-cyan/30 rounded-sacred-lg p-flame-md text-center text-white/80 leading-relaxed">
            {held}
          </div>
        )}

        {error && <p className="mt-flame-md text-center text-red-300/80 text-sm">{error}</p>}

        {song && (
          <div className="mt-flame-xl border-t border-white/10 pt-flame-lg animate-float">
            <h2 className="text-2xl font-semibold text-center bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-flame-lg">
              {song.title || 'Your Song'}
            </h2>
            <Section label="Verse" body={song.verse1} />
            <Section label="Chorus" body={song.chorus} />
            <Section label="Verse" body={song.verse2} />
            <Section label="Bridge" body={song.bridge} />
            <Section label="Outro" body={song.outro} />
            {song.dedication && (
              <p className="text-center italic text-ryvynn-cyan/70 mt-flame-lg">{song.dedication}</p>
            )}
            <p className="text-center text-white/30 text-xs mt-flame-xl">
              Lyrics generated by the Dual Flame · sung audio coming soon
            </p>
          </div>
        )}

        <div className="mt-flame-2xl text-center">
          <a href="/" className="text-white/40 text-sm hover:text-white/70 transition-colors">← Back home</a>
        </div>
      </div>
    </main>
  );
}
