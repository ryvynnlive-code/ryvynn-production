'use client';

import { CrisisBanner } from '@/components/crisis/CrisisBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <CrisisBanner />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              🔥 RYVYNN
            </span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-300">
            From our darkest hours to our brightest days
          </p>
          
          <p className="text-xl text-gray-500">
            🔒 ZERO SURVEILLANCE · RADICAL ANONYMITY
          </p>

          <div className="max-w-2xl mx-auto space-y-6 text-left py-12">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-cyan-400 font-bold text-xl mb-2">
                🔥 Transform Darkness to Light
              </h3>
              <p className="text-gray-400">
                Share anonymous confessions. AI transforms them into poetic miracles that inspire others.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-cyan-400 font-bold text-xl mb-2">
                🔒 Zero Data Collection
              </h3>
              <p className="text-gray-400">
                Confessions NEVER stored. Only miracles live on, completely anonymized.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-cyan-400 font-bold text-xl mb-2">
                ⚡ Crisis Detection
              </h3>
              <p className="text-gray-400">
                Automatic detection connects you to 988 Lifeline when needed most.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <a
              href="/confess"
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg"
            >
              🔥 Share Anonymous Confession
            </a>
            <a
              href="/feed"
              className="w-full sm:w-auto border border-cyan-500 text-cyan-400 hover:bg-cyan-900/20 font-bold py-4 px-8 rounded-lg text-lg"
            >
              ✨ View Miracle Feed
            </a>
          </div>

          <div className="pt-12 text-gray-600 text-sm">
            <p>No accounts. No tracking. No surveillance.</p>
            <p className="mt-2">100% anonymous, 100% free (forever).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
