'use client';

import { motion } from 'framer-motion';
import { SacredGeometry } from '@/components/sacred/SacredGeometry';

interface FlameAvatarProps {
  level: 1 | 2 | 3 | 4 | 5;
  xp?: number;
  maxXp?: number;
}

const STAGES = {
  1: { name: 'Ember', size: 48, color1: '#9a8478', color2: '#c2764a', glow: 'rgba(194,118,74,0.15)', pulseScale: 1.02, pattern: 'vesica-piscis' as const },
  2: { name: 'Spark', size: 64, color1: '#b91c1c', color2: '#dc2626', glow: 'rgba(220,38,38,0.25)', pulseScale: 1.05, pattern: 'seed-of-life' as const },
  3: { name: 'Flame', size: 80, color1: '#b91c1c', color2: '#ef4444', glow: 'rgba(220,38,38,0.35)', pulseScale: 1.08, pattern: 'seed-of-life' as const },
  4: { name: 'Blaze', size: 100, color1: '#dc2626', color2: '#f59e0b', glow: 'rgba(245,158,11,0.4)', pulseScale: 1.1, pattern: 'flower-of-life' as const },
  5: { name: 'Sovereign', size: 120, color1: '#fbbf24', color2: '#fefce8', glow: 'rgba(254,252,232,0.45)', pulseScale: 1.12, pattern: 'metatrons-cube' as const },
};

export function FlameAvatar({ level, xp = 0, maxXp = 100 }: FlameAvatarProps) {
  const stage = STAGES[level];
  const progress = Math.min((xp / maxXp) * 100, 100);
  const geometrySize = stage.size + 80;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Flame Orb */}
      <div className="relative flex items-center justify-center" style={{ width: stage.size + 60, height: stage.size + 60 }}>

        {/* Sacred geometry ring behind the orb -- spins slowly */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SacredGeometry
            pattern={stage.pattern}
            size={geometrySize}
            opacity={0.04 + level * 0.015}
            color={stage.color2}
            strokeWidth={0.5 + level * 0.1}
          />
        </div>

        {/* Outer glow rings for level 5 */}
        {level >= 5 && (
          <>
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.05, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{
                width: stage.size + 50,
                height: stage.size + 50,
                background: `radial-gradient(circle, ${stage.glow}, transparent 70%)`,
              }}
            />
            <motion.div
              animate={{ scale: [1.1, 1.5, 1.1], opacity: [0.1, 0.03, 0.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute rounded-full"
              style={{
                width: stage.size + 80,
                height: stage.size + 80,
                background: `radial-gradient(circle, ${stage.glow}, transparent 70%)`,
              }}
            />
          </>
        )}

        {/* Outer glow for level 4+ */}
        {level >= 4 && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full"
            style={{
              width: stage.size + 30,
              height: stage.size + 30,
              background: `radial-gradient(circle, ${stage.glow}, transparent 70%)`,
            }}
          />
        )}

        {/* Main orb */}
        <motion.div
          animate={{
            scale: [1, stage.pulseScale, 1],
          }}
          transition={{
            duration: level >= 3 ? 2 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="rounded-full relative z-10"
          style={{
            width: stage.size,
            height: stage.size,
            background: `radial-gradient(circle at 35% 35%, ${stage.color2}, ${stage.color1})`,
            boxShadow: `0 0 ${20 + level * 8}px ${stage.glow}, inset 0 0 ${10 + level * 5}px rgba(255,255,255,${0.05 + level * 0.04})`,
          }}
        >
          {/* Inner bright core for level 3+ */}
          {level >= 3 && (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: stage.size * 0.35,
                height: stage.size * 0.35,
                background: `radial-gradient(circle, ${level >= 5 ? '#ffffff' : stage.color2}, transparent)`,
              }}
            />
          )}

          {/* Second flame element for level 4+ */}
          {level >= 4 && (
            <motion.div
              animate={{ y: [-2, 2, -2], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: stage.size * 0.4,
                height: stage.size * 0.5,
                background: `radial-gradient(ellipse, ${stage.color2}80, transparent)`,
                filter: 'blur(4px)',
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-accent">
          Flame Level {level}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest">
          {stage.name}
        </p>
      </div>

      {/* XP Progress Bar */}
      <div className="w-48">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${stage.color1}, ${stage.color2})`,
              boxShadow: `0 0 8px ${stage.glow}`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-center">
          {xp} / {maxXp} XP
        </p>
      </div>
    </div>
  );
}
