'use client';

import { useState, useEffect } from 'react';

interface WallEntry {
  id: string;
  confession: string;
  transformation: string;
  votes: number;
  created_at: string;
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return `${Math.floor(s/604800)}w ago`;
}

function getDisplay(e: WallEntry) {
  return e.transformation && e.transformation !== e.confession ? e.transformation : e.confession;
}

// ─── Single wall card ─────────────────────────────────────────────────────────
function WallCard({ entry, felt, onFelt }: {
  entry: WallEntry;
  felt: boolean;
  onFelt: () => void;
}) {
  const text = getDisplay(entry);
  const preview = text.length > 280 ? text.slice(0, 277) + '…' : text;

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 16, padding: '22px 24px', transition: 'border-color .2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,201,232,.18)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)')}>
      <p style={{ fontSize: 15, lineHeight: 1.85, color: '#d8e0ee',
        margin: '0 0 18px', whiteSpace: 'pre-wrap' }}>
        {preview}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--dimmer)' }}>
          Anonymous · {timeAgo(entry.created_at)}
        </span>
        <button
          onClick={onFelt}
          title={felt ? 'You felt this' : 'This helped me feel less alone'}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: felt ? 'rgba(0,201,232,.08)' : 'transparent',
            border: `1px solid ${felt ? 'rgba(0,201,232,.3)' : 'rgba(255,255,255,.1)'}`,
            borderRadius: 99, padding: '5px 14px', fontSize: 12,
            color: felt ? '#00C9E8' : '#636e84',
            cursor: felt ? 'default' : 'pointer',
            fontFamily: 'inherit', transition: 'all .15s',
          }}>
          {felt ? '✓ ' : ''}
          {entry.votes + (felt ? 1 : 0)} {entry.votes === 1 && !felt ? 'person' : 'people'} felt this
        </button>
      </div>
    </div>
  );
}

// ─── Featured voices (top of wall) ───────────────────────────────────────────
function FeaturedVoices({ onFelt, felt, setFelt }: {
  onFelt: (id: string) => void;
  felt: Set<string>;
  setFelt: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [featured, setFeatured] = useState<WallEntry[]>([]);

  useEffect(() => {
    fetch('/api/wall?featured=true&limit=3')
      .then(r => r.json())
      .then(d => setFeatured(d.entries ?? []))
      .catch(() => {});
  }, []);

  if (!featured.length) return null;

  return (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#636e84',
        textTransform: 'uppercase', marginBottom: 16 }}>
        Featured voices this week
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {featured.map(e => (
          <div key={e.id} style={{
            background: 'rgba(0,201,232,.04)', border: '1px solid rgba(0,201,232,.15)',
            borderRadius: 16, padding: '20px 22px',
          }}>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: '#d8e0ee',
              margin: '0 0 14px', whiteSpace: 'pre-wrap' }}>
              {getDisplay(e).slice(0, 220)}{getDisplay(e).length > 220 ? '…' : ''}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#3a4352' }}>Anonymous · {timeAgo(e.created_at)}</span>
              <button onClick={() => {
                if (felt.has(e.id)) return;
                setFelt(prev => new Set([...prev, e.id]));
                onFelt(e.id);
              }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: felt.has(e.id) ? 'rgba(0,201,232,.1)' : 'transparent',
                border: `1px solid ${felt.has(e.id) ? 'rgba(0,201,232,.35)' : 'rgba(255,255,255,.1)'}`,
                borderRadius: 99, padding: '5px 14px', fontSize: 12,
                color: felt.has(e.id) ? '#00C9E8' : '#636e84',
                cursor: felt.has(e.id) ? 'default' : 'pointer',
                fontFamily: 'inherit', transition: 'all .15s',
              }}>
                {felt.has(e.id) ? '✓ ' : ''}
                {e.votes + (felt.has(e.id) ? 1 : 0)} felt this
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main feed ────────────────────────────────────────────────────────────────
export function WallFeed({ onShare }: { onShare: () => void }) {
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset]   = useState(0);
  const [sort, setSort]       = useState<'recent' | 'popular'>('recent');
  const [felt, setFelt]       = useState<Set<string>>(new Set());

  useEffect(() => { setOffset(0); load(0); }, [sort]);

  const load = async (off: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wall?limit=12&offset=${off}&sortBy=${sort}`);
      const data = await res.json();
      setEntries(prev => off === 0 ? (data.entries ?? []) : [...prev, ...(data.entries ?? [])]);
      setHasMore(data.hasMore ?? false);
    } catch { /* silent */ }
    setLoading(false);
  };

  const markFelt = async (id: string) => {
    if (felt.has(id)) return;
    setFelt(prev => new Set([...prev, id]));
    try {
      await fetch('/api/wall', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: id }),
      });
    } catch { /* silent */ }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <FeaturedVoices onFelt={markFelt} felt={felt} setFelt={setFelt} />

      {/* Sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['recent', 'popular'] as const).map(s => (
          <button key={s} onClick={() => setSort(s)} style={{
            background: sort === s ? 'rgba(0,201,232,.1)' : 'transparent',
            border: `1px solid ${sort === s ? 'rgba(0,201,232,.35)' : 'rgba(255,255,255,.1)'}`,
            borderRadius: 99, padding: '6px 16px', fontSize: 13,
            color: sort === s ? '#00C9E8' : '#636e84',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
          }}>
            {s === 'recent' ? 'Most recent' : 'Most felt'}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: 'var(--dim)', fontSize: 15, marginBottom: 8 }}>
            No voices here yet.
          </p>
          <p style={{ color: 'var(--dimmer)', fontSize: 13, marginBottom: 24 }}>
            The first one could help someone more than you think.
          </p>
          <button className="btn" onClick={onShare} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,201,232,.1)', border: '1.5px solid #00C9E8',
            borderRadius: 99, padding: '11px 22px', color: '#00C9E8',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Leave the first one
          </button>
        </div>
      )}

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {entries.map(e => (
          <WallCard
            key={e.id}
            entry={e}
            felt={felt.has(e.id)}
            onFelt={() => markFelt(e.id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button onClick={() => { const n = offset + 12; setOffset(n); load(n); }}
            disabled={loading} style={{
              background: 'none', border: 'none', color: '#636e84',
              fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {/* Bottom nudge — after reading 3+ entries, show write prompt */}
      {entries.length >= 3 && (
        <div style={{ marginTop: 56, padding: '28px 24px',
          background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
          borderRadius: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#636e84', marginBottom: 14, lineHeight: 1.7 }}>
            You've seen others speak. Want to say something of your own?
          </p>
          <button onClick={onShare} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,201,232,.1)', border: '1.5px solid #00C9E8',
            borderRadius: 99, padding: '11px 22px', color: '#00C9E8',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Add something to the wall
          </button>
        </div>
      )}
    </div>
  );
}
