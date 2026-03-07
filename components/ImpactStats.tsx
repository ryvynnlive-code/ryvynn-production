'use client';

import { useEffect, useState } from 'react';
import { IMPACT, SPACE, TYPE } from '@/lib/sacred-geometry';

export function ImpactStats() {
  const [lives, setLives] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    // Animate numbers on mount
    const duration = 2000;
    const steps = 60;
    const livesStep = IMPACT.livesSaved / steps;
    const revenueStep = IMPACT.revenueGenerated / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setLives(Math.floor(livesStep * currentStep));
      setRevenue(Math.floor(revenueStep * currentStep));
      
      if (currentStep >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    return num.toLocaleString();
  };

  return (
    <div className="border-y border-gray-800 py-16 bg-gradient-to-r from-black via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          {/* Lives Saved */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-ryvynn-cyan/20 to-transparent blur-3xl"></div>
            <div className="relative">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-ryvynn-cyan via-white to-ryvynn-cyan bg-clip-text text-transparent mb-2">
                {formatNumber(lives)}
              </div>
              <div className="text-gray-400 text-lg">Lives Saved by 2030</div>
              <div className="text-ryvynn-cyan text-sm mt-2">🔥 Mission Target</div>
            </div>
          </div>

          {/* Revenue for Good */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-ryvynn-purple/20 to-transparent blur-3xl"></div>
            <div className="relative">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-ryvynn-purple via-white to-ryvynn-purple bg-clip-text text-transparent mb-2">
                {formatNumber(revenue)}+
              </div>
              <div className="text-gray-400 text-lg">For Greater Good</div>
              <div className="text-ryvynn-purple text-sm mt-2">💎 Impact Capital</div>
            </div>
          </div>

          {/* Global Reach */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-ryvynn-cyan/20 via-ryvynn-purple/20 to-transparent blur-3xl"></div>
            <div className="relative">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan bg-clip-text text-transparent mb-2">
                {IMPACT.globalReach}
              </div>
              <div className="text-gray-400 text-lg">Countries Served</div>
              <div className="text-ryvynn-purple text-sm mt-2">🌍 Global Platform</div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <div className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            Privacy-first AI mental wellness platform building the foundation for 
            <span className="text-ryvynn-cyan font-bold"> billion-dollar impact </span>
            across crisis intervention, addiction recovery, and 
            <span className="text-ryvynn-purple font-bold"> high-impact AI causes worldwide</span>.
          </div>
          <div className="mt-6 text-sm text-gray-500 italic">
            70% of users access crisis support free, forever. Premium revenue fuels the mission.
          </div>
        </div>
      </div>
    </div>
  );
}
