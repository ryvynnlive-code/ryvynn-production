'use client';

import { motion } from 'framer-motion';

interface SacredGeometryProps {
  pattern: 'flower-of-life' | 'metatrons-cube' | 'seed-of-life' | 'vesica-piscis' | 'sri-yantra';
  size?: number;
  opacity?: number;
  color?: string;
  className?: string;
  animate?: boolean;
  strokeWidth?: number;
}

function FlowerOfLife({ size, color, strokeWidth }: { size: number; color: string; strokeWidth: number }) {
  const r = size * 0.15;
  const cx = size / 2;
  const cy = size / 2;
  const circles: { x: number; y: number }[] = [{ x: cx, y: cy }];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    circles.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    circles.push({ x: cx + r * 2 * Math.cos(angle), y: cy + r * 2 * Math.sin(angle) });
  }

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6;
    circles.push({ x: cx + r * Math.sqrt(3) * Math.cos(angle), y: cy + r * Math.sqrt(3) * Math.sin(angle) });
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none">
      {circles.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={r} stroke={color} strokeWidth={strokeWidth} />
      ))}
    </svg>
  );
}

function MetatronsCube({ size, color, strokeWidth }: { size: number; color: string; strokeWidth: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.4;
  const rInner = size * 0.2;

  const outerPoints: { x: number; y: number }[] = [];
  const innerPoints: { x: number; y: number }[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    outerPoints.push({ x: cx + rOuter * Math.cos(angle), y: cy + rOuter * Math.sin(angle) });
    innerPoints.push({ x: cx + rInner * Math.cos(angle + Math.PI / 6), y: cy + rInner * Math.sin(angle + Math.PI / 6) });
  }

  const allPoints = [{ x: cx, y: cy }, ...outerPoints, ...innerPoints];
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  for (let i = 0; i < allPoints.length; i++) {
    for (let j = i + 1; j < allPoints.length; j++) {
      lines.push({ x1: allPoints[i].x, y1: allPoints[i].y, x2: allPoints[j].x, y2: allPoints[j].y });
    }
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none">
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={strokeWidth * 0.5} />
      ))}
      {allPoints.map((p, i) => (
        <circle key={`c-${i}`} cx={p.x} cy={p.y} r={size * 0.03} stroke={color} strokeWidth={strokeWidth} />
      ))}
    </svg>
  );
}

function SeedOfLife({ size, color, strokeWidth }: { size: number; color: string; strokeWidth: number }) {
  const r = size * 0.18;
  const cx = size / 2;
  const cy = size / 2;
  const circles: { x: number; y: number }[] = [{ x: cx, y: cy }];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    circles.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none">
      <circle cx={cx} cy={cy} r={r * 2.15} stroke={color} strokeWidth={strokeWidth * 0.7} />
      {circles.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={r} stroke={color} strokeWidth={strokeWidth} />
      ))}
    </svg>
  );
}

function VesicaPiscis({ size, color, strokeWidth }: { size: number; color: string; strokeWidth: number }) {
  const r = size * 0.3;
  const offset = r * 0.5;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none">
      <circle cx={cx - offset} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} />
      <circle cx={cx + offset} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

function SriYantra({ size, color, strokeWidth }: { size: number; color: string; strokeWidth: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * 0.35;

  const upTriangles = [
    { scale: 1, yOffset: 0 },
    { scale: 0.68, yOffset: s * 0.12 },
    { scale: 0.42, yOffset: s * 0.22 },
  ];

  const downTriangles = [
    { scale: 0.88, yOffset: -s * 0.05 },
    { scale: 0.56, yOffset: s * 0.08 },
  ];

  const paths: string[] = [];

  upTriangles.forEach(({ scale, yOffset }) => {
    const h = s * scale;
    const base = h * 1.15;
    const tipY = cy - h * 0.6 + yOffset;
    const baseY = cy + h * 0.4 + yOffset;
    paths.push(`M ${cx} ${tipY} L ${cx - base / 2} ${baseY} L ${cx + base / 2} ${baseY} Z`);
  });

  downTriangles.forEach(({ scale, yOffset }) => {
    const h = s * scale;
    const base = h * 1.15;
    const tipY = cy + h * 0.6 + yOffset;
    const baseY = cy - h * 0.4 + yOffset;
    paths.push(`M ${cx} ${tipY} L ${cx - base / 2} ${baseY} L ${cx + base / 2} ${baseY} Z`);
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} fill="none">
      <circle cx={cx} cy={cy} r={s * 1.1} stroke={color} strokeWidth={strokeWidth * 0.6} />
      <circle cx={cx} cy={cy} r={s * 1.25} stroke={color} strokeWidth={strokeWidth * 0.4} />
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth={strokeWidth * 0.7} />
      ))}
      <circle cx={cx} cy={cy} r={s * 0.08} fill={color} fillOpacity={0.4} />
    </svg>
  );
}

const PATTERN_MAP = {
  'flower-of-life': FlowerOfLife,
  'metatrons-cube': MetatronsCube,
  'seed-of-life': SeedOfLife,
  'vesica-piscis': VesicaPiscis,
  'sri-yantra': SriYantra,
};

export function SacredGeometry({
  pattern,
  size = 300,
  opacity = 0.06,
  color = 'rgba(249,115,22,1)',
  className = '',
  animate = true,
  strokeWidth = 0.8,
}: SacredGeometryProps) {
  const PatternComponent = PATTERN_MAP[pattern];

  const content = (
    <PatternComponent size={size} color={color} strokeWidth={strokeWidth} />
  );

  if (!animate) {
    return (
      <div className={`pointer-events-none select-none ${className}`} style={{ opacity }}>
        {content}
      </div>
    );
  }

  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
      animate={{ rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
    >
      {content}
    </motion.div>
  );
}

export function SacredDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 py-2 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <SacredGeometry
        pattern="vesica-piscis"
        size={32}
        opacity={0.12}
        animate={false}
        strokeWidth={0.6}
      />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
    </div>
  );
}
