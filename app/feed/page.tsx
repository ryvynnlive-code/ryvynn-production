'use client';

import { useEffect, useState } from 'react';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';

interface Miracle {
  id: string;
  content: string;
  createdAt: string;
  views: number;
  likes: number;
}

export default function FeedPage() {
  const [miracles, setMiracles] = useState<Miracle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/miracle/feed')
      .then(res => res.json())
      .then(data => {
        setMiracles(data.miracles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <CrisisBanner />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            ✨ Miracle Feed
          </h1>
          <p className="text-gray-400">
            Anonymous confessions transformed into light
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Loading miracles...
          </div>
        ) : miracles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No miracles yet</p>
            <a 
              href="/confess" 
              className="text-cyan-400 hover:text-cyan-300"
            >
              Be the first to share →
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {miracles.map((miracle) => (
              <div
                key={miracle.id}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
              >
                <p className="text-gray-200 text-lg leading-relaxed italic mb-4">
                  "{miracle.content}"
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {new Date(miracle.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-4">
                    <span>👁️ {miracle.views}</span>
                    <span>❤️ {miracle.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <a 
            href="/confess"
            className="inline-block bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            🔥 Share Your Story
          </a>
        </div>
      </div>
    </div>
  );
}
