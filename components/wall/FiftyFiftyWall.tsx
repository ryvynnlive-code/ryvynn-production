'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface WallEntry {
  id: string;
  confession: string;
  transformation: string;
  votes: number;
  created_at: string;
}

function timeAgo(iso: string, es: boolean): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return es ? 'justo ahora' : 'just now';
  if (s < 3600) return es ? `hace ${Math.floor(s/60)}m` : `${Math.floor(s/60)}m ago`;
  if (s < 86400) return es ? `hace ${Math.floor(s/3600)}h` : `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return es ? `hace ${Math.floor(s/86400)}d` : `${Math.floor(s/86400)}d ago`;
  return new Date(iso).toLocaleDateString(es ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' });
}

interface WallFeedProps {
  onShare?: () => void;
}

export function WallFeed({ onShare }: WallFeedProps) {
  const { language } = useI18n();
  const es = language === 'es';
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');
  const PER_PAGE = 10;

  useEffect(() => {
    setEntries([]);
    setPage(0);
    setHasMore(true);
    loadEntries(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function loadEntries(p = page, reset = false) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PER_PAGE),
        offset: String(p * PER_PAGE),
        ...(filter !== 'all' && { sort: filter }),
      });
      const res = await fetch(`/api/wall?${params}`);
      const data = await res.json();
      const list: WallEntry[] = Array.isArray(data) ? data : (data.entries ?? []);
      if (reset) {
        setEntries(list);
      } else {
        setEntries(prev => [...prev, ...list]);
      }
      setHasMore(list.length === PER_PAGE);
      setPage(p + 1);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  const vote = async (id: string) => {
    if (votedIds.has(id)) return;
    setVotedIds(prev => new Set([...prev, id]));
    setEntries(prev => prev.map(e => e.id === id ? { ...e, votes: e.votes + 1 } : e));
    await fetch(`/api/wall?id=${id}`, { method: 'PATCH' }).catch(() => {});
  };

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const CHAR_LIMIT = 240;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 80px' }}>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {(['all', 'recent', 'popular'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', transition: 'all .15s',
              background: filter === f ? 'rgba(0,201,232,.15)' : 'transparent',
              border: filter === f ? '1.5px solid #00C9E8' : '1.5px solid rgba(255,255,255,.1)',
              color: filter === f ? '#00C9E8' : '#636e84',
            }}
          >
            {es
              ? { all: 'Todo', recent: 'Reciente', popular: 'Popular' }[f]
              : { all: 'All', recent: 'Recent', popular: 'Popular' }[f]}
          </button>
        ))}
      </div>

      {/* Entries */}
      {entries.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#636e84' }}>
          <p style={{ fontSize: 15, marginBottom: 8 }}>
            {es ? 'El muro está quieto.' : 'The wall is quiet.'}
          </p>
          <p style={{ fontSize: 13 }}>
            {es ? 'Sé el primero en dejar algo.' : 'Be the first to leave something.'}
          </p>
          {onShare && (
            <button
              onClick={onShare}
              style={{ marginTop: 20, padding: '10px 22px', borderRadius: 99, fontSize: 14,
                background: 'rgba(0,201,232,.1)', border: '1.5px solid #00C9E8',
                color: '#00C9E8', cursor: 'pointer' }}>
              {es ? 'Deja algo' : 'Leave something'}
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {entries.map((entry, i) => {
          const isExpanded = expanded.has(entry.id);
          const hasMore2 = entry.transformation.length > CHAR_LIMIT;
          const displayText = hasMore2 && !isExpanded
            ? entry.transformation.slice(0, CHAR_LIMIT) + '…'
            : entry.transformation;
          const hasVoted = votedIds.has(entry.id);

          return (
            <article key={entry.id} style={{
              padding: '28px 0',
              borderBottom: i < entries.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
            }}>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: '#c8d3e8', marginBottom: 12 }}>
                {displayText}
                {hasMore2 && (
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    style={{ background: 'none', border: 'none', color: '#00C9E8',
                      fontSize: 13, cursor: 'pointer', marginLeft: 6, padding: 0 }}>
                    {isExpanded
                      ? (es ? 'menos' : 'less')
                      : (es ? 'más' : 'more')}
                  </button>
                )}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, color: '#3a4352' }}>
                  {timeAgo(entry.created_at, es)}
                </span>
                <button
                  onClick={() => vote(entry.id)}
                  disabled={hasVoted}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: hasVoted ? 'rgba(0,201,232,.08)' : 'transparent',
                    border: 'none', borderRadius: 99,
                    padding: '4px 10px', cursor: hasVoted ? 'default' : 'pointer',
                    color: hasVoted ? '#00C9E8' : '#636e84',
                    fontSize: 12, transition: 'all .15s',
                  }}
                  title={es ? 'Este me llegó' : 'This hit me'}
                >
                  <span>{hasVoted ? '♥' : '♡'}</span>
                  <span>{entry.votes}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load more */}
      {loading && (
        <p style={{ textAlign: 'center', color: '#3a4352', fontSize: 13, padding: '24px 0' }}>
          {es ? 'Cargando...' : 'Loading...'}
        </p>
      )}
      {!loading && hasMore && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            onClick={() => loadEntries()}
            style={{ padding: '10px 28px', borderRadius: 99, fontSize: 14,
              background: 'transparent', border: '1.5px solid rgba(255,255,255,.12)',
              color: '#636e84', cursor: 'pointer' }}>
            {es ? 'Cargar más' : 'Load more'}
          </button>
        </div>
      )}
      {!loading && !hasMore && entries.length > 0 && (
        <p style={{ textAlign: 'center', color: '#2a3040', fontSize: 12, marginTop: 32 }}>
          {es ? 'Eso es todo por ahora.' : "That's everything for now."}
          {onShare && (
            <button
              onClick={onShare}
              style={{ background: 'none', border: 'none', color: '#636e84',
                fontSize: 12, cursor: 'pointer', marginLeft: 8, textDecoration: 'underline' }}>
              {es ? '¿Añadir el tuyo?' : 'Add yours?'}
            </button>
          )}
        </p>
      )}
    </div>
  );
}
