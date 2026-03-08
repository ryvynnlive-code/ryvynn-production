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
  const { t } = useI18n();
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    loadEntries();
  }, [sortBy]);

  const loadEntries = async (loadMore = false) => {
    try {
      const currentOffset = loadMore ? offset : 0;
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
      
      // Update local state
      setEntries(prev => prev.map(entry =>
        entry.id === entryId
          ? { ...entry, votes: data.newVoteCount }
          : entry
      ));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-pulse">🔥</div>
        <p className="text-gray-400">Loading transformations...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Sort */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-2">
            50/50 Wall: From Shadow to Light
          </h2>
          <p className="text-gray-400 text-sm">
            Anonymous transformations from darkness to hope
          </p>
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
            Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-ryvynn-purple text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-8">
        {entries.length === 0 && (
          <div className="text-center py-12 bg-gray-900/30 border border-gray-800 rounded-xl">
            <p className="text-gray-400">No entries yet. Be the first to share.</p>
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
                  <h3 className="font-bold text-ryvynn-cyan">Shadow</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {entry.confession}
                </p>
              </div>

              {/* Right: Light/Transformation */}
              <div className="p-8 bg-gradient-to-br from-black to-gray-900">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-bold text-ryvynn-purple">Light</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {entry.transformation}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-800 px-8 py-4 flex items-center justify-between bg-black/50">
              <button
                onClick={() => handleVote(entry.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
              >
                <span className="text-xl group-hover:scale-125 transition-transform">
                  🔥
                </span>
                <span className="font-bold text-ryvynn-purple">
                  {entry.votes}
                </span>
              </button>

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
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
