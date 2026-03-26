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

export function FiftyFiftyWall() {
  const { tp } = useI18n();
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setOffset(0);
    loadEntries(false, 0);
  }, [sortBy]);

  const loadEntries = async (loadMore = false, overrideOffset?: number) => {
    try {
      const currentOffset = overrideOffset !== undefined ? overrideOffset : offset;
      const response = await fetch(
        `/api/wall?limit=10&offset=${currentOffset}&sortBy=${sortBy}`
      );
      if (!response.ok) throw new Error('Failed to load wall');
      const data = await response.json();

      if (loadMore) {
        setEntries(prev => [...prev, ...data.entries]);
      } else {
        setEntries(data.entries);
      }

      setHasMore(data.hasMore);
      setOffset(currentOffset + 10);
    } catch (error) {
      console.error('Error loading wall:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (entryId: string) => {
    try {
      const response = await fetch('/api/wall', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      const data = await response.json();
      setEntries(prev =>
        prev.map(entry =>
          entry.id === entryId ? { ...entry, votes: data.newVoteCount } : entry
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleShare = async (entryId: string) => {
    const url = `${window.location.origin}/wall/${entryId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'A darkness became light — RYVYNN',
          text: 'Someone turned their shadow into a miracle. See it here:',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedId(entryId);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopiedId(entryId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-pulse">🔥</div>
        <p className="text-gray-400">{tp('wallLoading')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Sort */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-2">
            {tp('wallFiftyTitle')}
          </h2>
          <p className="text-gray-400 text-sm">{tp('wallFiftySubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'recent'
                ? 'bg-ryvynn-cyan text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tp('wallSortRecent')}
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-ryvynn-purple text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tp('wallSortPopular')}
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-8">
        {entries.length === 0 && (
          <div className="text-center py-12 bg-gray-900/30 border border-gray-800 rounded-xl">
            <p className="text-gray-400">{tp('wallNoEntries')}</p>
          </div>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="grid md:grid-cols-2 divide-x-2 divide-gray-800">
              {/* Left: Shadow/Confession */}
              <div className="p-8 bg-gradient-to-br from-gray-900 to-black">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌑</span>
                  <h3 className="font-bold text-ryvynn-cyan">{tp('wallShadowLabel')}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{entry.confession}</p>
              </div>

              {/* Right: Light/Transformation */}
              <div className="p-8 bg-gradient-to-br from-black to-gray-900">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-bold text-ryvynn-purple">{tp('wallLightLabel')}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{entry.transformation}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-800 px-8 py-4 flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-3">
                {/* Vote */}
                <button
                  onClick={() => handleVote(entry.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
                >
                  <span className="text-xl group-hover:scale-125 transition-transform">🔥</span>
                  <span className="font-bold text-ryvynn-purple">{entry.votes}</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => handleShare(entry.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm text-gray-400 hover:text-ryvynn-cyan"
                >
                  {copiedId === entry.id ? (
                    <>
                      <span>✓</span>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <span>↗</span>
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-gray-500">
                {new Date(entry.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => loadEntries(true)}
            className="px-8 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl font-bold text-white hover:scale-105 transition-all"
          >
            {tp('wallLoadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
