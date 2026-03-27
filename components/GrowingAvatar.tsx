'use client';

// GrowingAvatar — pure SVG, zero server calls, evolves with streak days.
// Stage  1 (0-2d):  Ember      — dim glow, just starting
// Stage  2 (3-6d):  Spark      — single bright point
// Stage  3 (7-13d): Flame      — cyan flame appears
// Stage  4 (14-29d):Dual Flame — purple emerges alongside cyan
// Stage  5 (30-59d):Radiant    — both flames, outer ring fills
// Stage  6 (60-89d):Inferno    — full intensity, strong glow
// Stage  7 (90+d):  Eternal    — pulsing, gold sparks

interface Props {
  streakDays: number;
  tokens: number;
  size?: number;
  showLabel?: boolean;
}

function getStage(d: number) {
  if (d >= 90) return { name: 'Eternal',    level: 7 };
  if (d >= 60) return { name: 'Inferno',    level: 6 };
  if (d >= 30) return { name: 'Radiant',    level: 5 };
  if (d >= 14) return { name: 'Dual Flame', level: 4 };
  if (d >= 7)  return { name: 'Flame',      level: 3 };
  if (d >= 3)  return { name: 'Spark',      level: 2 };
  return             { name: 'Ember',       level: 1 };
}

export function GrowingAvatar({ streakDays, tokens, size = 120, showLabel = true }: Props) {
  const stage = getStage(streakDays);
  const cx = size / 2, cy = size / 2;

  const cyanAlpha   = Math.min(0.15 + stage.level * 0.12, 0.95);
  const purpleAlpha = stage.level >= 4 ? Math.min((stage.level - 3) * 0.25, 0.9) : 0;
  const goldAlpha   = stage.level >= 7 ? 0.85 : 0;
  const ringPct     = stage.level / 7;
  const flameH      = size * (0.26 + stage.level * 0.06);
  const flameW      = size * (0.14 + stage.level * 0.025);
  const circumference = Math.PI * 2 * (cx - 5);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`rg-c-${size}`} cx="50%" cy="65%" r="55%">
            <stop offset="0%" stopColor="#00C9E8" stopOpacity={cyanAlpha * 0.5} />
            <stop offset="100%" stopColor="#00C9E8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`rg-p-${size}`} cx="55%" cy="55%" r="45%">
            <stop offset="0%" stopColor="#7C5CBF" stopOpacity={purpleAlpha * 0.55} />
            <stop offset="100%" stopColor="#7C5CBF" stopOpacity="0" />
          </radialGradient>
          {stage.level >= 5 && (
            <filter id={`glow-${size}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>

        {/* Progress ring */}
        <circle cx={cx} cy={cy} r={cx - 5} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        <circle
          cx={cx} cy={cy} r={cx - 5} fill="none"
          stroke="#00C9E8" strokeWidth="2" strokeLinecap="round"
          strokeDasharray={`${circumference * ringPct} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          strokeOpacity={0.5 + stage.level * 0.07}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />

        {/* Background glows */}
        <circle cx={cx} cy={cy} r={cx * 0.85} fill={`url(#rg-c-${size})`} />
        {purpleAlpha > 0 && <circle cx={cx} cy={cy} r={cx * 0.7} fill={`url(#rg-p-${size})`} />}

        {/* Core */}
        <circle cx={cx} cy={cy} r={cx * 0.36}
          fill={`rgba(0,201,232,${0.04 + stage.level * 0.015})`}
          stroke="#00C9E8" strokeWidth="1" strokeOpacity={0.15 + stage.level * 0.07}
        />

        {/* Cyan flame */}
        <path
          filter={stage.level >= 5 ? `url(#glow-${size})` : undefined}
          d={`M ${cx} ${cy + size * 0.13}
              C ${cx - flameW} ${cy},
                ${cx - flameW * 0.5} ${cy - flameH * 0.75},
                ${cx} ${cy - flameH}
              C ${cx + flameW * 0.5} ${cy - flameH * 0.75},
                ${cx + flameW} ${cy},
                ${cx} ${cy + size * 0.13} Z`}
          fill="#00C9E8" fillOpacity={cyanAlpha}
        />

        {/* Purple flame — level 4+ */}
        {purpleAlpha > 0 && (
          <path
            d={`M ${cx + size * 0.05} ${cy + size * 0.1}
                C ${cx + flameW * 0.5} ${cy - size * 0.02},
                  ${cx + flameW * 1.1} ${cy - flameH * 0.5},
                  ${cx + flameW * 0.65} ${cy - flameH * 0.72}
                C ${cx + flameW * 1.2} ${cy - flameH * 0.28},
                  ${cx + flameW * 0.85} ${cy},
                  ${cx + size * 0.05} ${cy + size * 0.1} Z`}
            fill="#7C5CBF" fillOpacity={purpleAlpha}
          />
        )}

        {/* Gold sparks — eternal only */}
        {goldAlpha > 0 && ([-1, 1] as const).map((dir, i) => (
          <circle key={i} cx={cx + dir * size * 0.3} cy={cy - size * 0.2}
            r={size * 0.025} fill="#F59E0B" fillOpacity={goldAlpha} />
        ))}

        {/* Streak number */}
        <text x={cx} y={cy + 5} textAnchor="middle"
          fontSize={streakDays > 99 ? size * 0.13 : size * 0.17}
          fontWeight="500" fill={streakDays === 0 ? '#3a4352' : '#00C9E8'}
          fillOpacity={streakDays === 0 ? 0.5 : 0.95}
          fontFamily="system-ui,sans-serif">
          {streakDays}
        </text>
        <text x={cx} y={cy + size * 0.21} textAnchor="middle"
          fontSize={size * 0.09} fill="#3a4352" fontFamily="system-ui,sans-serif">
          {streakDays === 1 ? 'day' : 'days'}
        </text>
      </svg>

      {showLabel && (
        <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: stage.level >= 3 ? '#00C9E8' : '#636e84' }}>
            {stage.name}
          </div>
          <div style={{ fontSize: 11, color: '#3a4352' }}>{tokens} soul tokens</div>
        </div>
      )}
    </div>
  );
}
