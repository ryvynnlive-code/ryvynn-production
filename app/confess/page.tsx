'use client';

import { useState } from 'react';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';

export default function ConfessPage() {
  const [confession, setConfession] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [miracle, setMiracle] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCrisis(false);
    setMiracle(null);

    try {
      const res = await fetch('/api/confession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confession,
          userId: `anon-${Date.now()}`
        })
      });

      const data = await res.json();

      if (data.crisis) {
        setCrisis(true);
      } else if (data.success) {
        setMiracle(data.miracle.content);
        setConfession('');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <CrisisBanner />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            🔥 RYVYNN
          </h1>
          <p className="text-gray-400 text-lg">
            From our darkest hours to our brightest days
          </p>
          <p className="text-sm text-gray-500 mt-2">
            🔒 Zero surveillance · Radical anonymity
          </p>
        </div>

        {crisis && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              ⚠️ Crisis Detected
            </h2>
            <p className="text-gray-300 mb-4">
              We're here for you. Please reach out for immediate support:
            </p>
            <div className="space-y-3">
              <a
                href="tel:988"
                className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg text-center text-xl"
              >
                📞 Call 988 - Suicide & Crisis Lifeline
              </a>
              <a
                href="sms:741741"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center"
              >
                💬 Text 741741 - Crisis Text Line
              </a>
              <a
                href="https://988lifeline.org/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center"
              >
                💻 Chat Online
              </a>
            </div>
          </div>
        )}

        {miracle && (
          <div className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border border-cyan-500/50 rounded-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              ✨ Your Miracle
            </h2>
            <p className="text-gray-200 text-lg leading-relaxed italic">
              "{miracle}"
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Your confession transformed. Now in the miracle feed.
            </p>
            <button
              onClick={() => setMiracle(null)}
              className="mt-4 text-cyan-400 hover:text-cyan-300"
            >
              Share another →
            </button>
          </div>
        )}

        {!miracle && !crisis && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Your Anonymous Confession
              </label>
              <textarea
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                placeholder="Share what's on your heart... 100% anonymous."
                className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={loading}
                required
                minLength={10}
              />
              <p className="text-xs text-gray-600 mt-2">
                Minimum 10 characters · Never stored · Only miracles saved
              </p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || confession.length < 10}
              className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg"
            >
              {loading ? '🔥 Transforming...' : '🔥 Transform to Miracle'}
            </button>
          </form>
        )}

        <div className="mt-12 text-center">
          <a href="/feed" className="text-cyan-400 hover:text-cyan-300">
            View Miracle Feed →
          </a>
        </div>
      </div>
    </div>
  );
}
