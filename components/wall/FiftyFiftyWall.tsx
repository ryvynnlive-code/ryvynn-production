'use client';

import { useState, useEffect } from 'react';

interface WallEntry {
  id: string;
  confession: string;
  transformation: string;
  votes: number;
  created_at: string;
}

interface Props {
  onShare: () => void;
}

function timeAgo(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800) return `${Math.floor(d / 86400)}d ago`;
  return `${Math.floor(d / 604800)}w ago`;
}

export function WallFeed({ onShare }: Props) {
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [loading, setLoading]  = useState(true);
  const [hasMore, setHasMore]  = useState(false);
  const [offset, setOffset]    = useState(0);
  const [sort, setSort]        = useState<'recent' | 'popular'>('recent');
  const [voted, setVoted]      = useState<Set<string>>(new Set());

  useEffect(() => {
    setOffset(0);
    load(0);
  }, [sort]);

  const load = async (off: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wall?limit=12&offset=${off}&sortBy=${sort}`);
      const data = await res.json();
      if (off === 0) {
        setEntries(data.entries ?? []);
      } else {
        setEntries(prev => [...prev, ...(data.entries ?? [])]);
      }
      setHasMore(data.hasMore ?? false);
    } catch { /* silent */ }
    setLoading(false);
  };

  const loadMore = () => {
    const next = offset + 12;
    setOffset(next);
    load(next);
  };

  const upvote = async (id: string) => {
    if (voted.has(id)) return;
    setVoted(prev => new Set([...prev, id]));
    setEntries(prev => prev.map(e => e.id === id ? { ...e, votes: e.votes + 1 } : e));
    try {
      await fetch('/api/wall', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryId: id }) });
    } catch { /* silent */ }
  };

  // Use confession text if it differs from transformation, else just show transformation
  const displayText = (entry: WallEntry) =>
    entry.transformation && entry.transformation !== entry.confession
      ? entry.transformation
      : entry.confession;

  if (loading && entries.length === 0) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--dimmer)', fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!loading && entries.length === 0) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--dim)', fontSize: 15, marginBottom: 20 }}>
          Nothing on the wall yet. Be the first to leave something.
        </p>
        <button className="btn" onClick={onShare}>Add yours</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>

      {/* Sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {(['recent', 'popular'] as const).map(s => (
          <button key={s} onClick={() => setSort(s)}
            style={{
              background: sort === s ? 'rgba(0,201,232,.12)' : 'transparent',
              border: `1px solid ${sort === s ? 'rgba(0,201,232,.35)' : 'rgba(255,255,255,.1)'}`,
              borderRadius: 99, padding: '6px 16px', fontSize: 13,
              color: sort === s ? 'var(--cyan)' : 'var(--dim)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
            }}>
            {s === 'recent' ? 'Most recent' : 'Most helpful'}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {entries.map(entry => (
          <div key={entry.id}
            style={{
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 16, padding: '22px 24px',
              transition: 'border-color .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,201,232,.2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)')}
          >
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#d8e0ee', margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
              {displayText(entry)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--dimmer)' }}>
                Anonymous · {timeAgo(entry.created_at)}
              </span>
              <button
                onClick={() => upvote(entry.id)}
                title={voted.has(entry.id) ? 'You marked this helpful' : 'This helped me'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: voted.has(entry.id) ? 'rgba(0,201,232,.08)' : 'transparent',
                  border: `1px solid ${voted.has(entry.id) ? 'rgba(0,201,232,.3)' : 'rgba(255,255,255,.1)'}`,
                  borderRadius: 99, padding: '5px 14px',
                  fontSize: 12, color: voted.has(entry.id) ? 'var(--cyan)' : 'var(--dimmer)',
                  cursor: voted.has(entry.id) ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'all .15s',
                }}>
                <span>{voted.has(entry.id) ? '✓' : '↑'}</span>
                <span>{entry.votes} {entry.votes === 1 ? 'person' : 'people'} felt this</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button className="btn-ghost" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Bottom share nudge */}
      <div style={{ marginTop: 48, padding: '28px 24px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 14, lineHeight: 1.7 }}>
          If something you went through might help someone else — it can live here too.
        </p>
        <button className="btn" onClick={onShare}>Add something to the wall</button>
      </div>
    </div>
  );
}
