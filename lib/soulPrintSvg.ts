// lib/soulPrintSvg.ts
// Generates SVG as pure string — no JSX, no React dependency
// Required for download AND dangerouslySetInnerHTML rendering

import { SoulPrintParams, createRng } from './soulPrintGenerator'

const W  = 500
const H  = 500
const CX = 250
const CY = 250

// ─── Color helpers ───────────────────────────────────────────────────

function hsl(h: number, s: number, l: number, a = 1): string {
  const hr = ((h % 360) + 360) % 360
  if (a >= 1) return `hsl(${hr.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%)`
  return `hsla(${hr.toFixed(0)},${s.toFixed(0)}%,${l.toFixed(0)}%,${a.toFixed(3)})`
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

function lerpHsl(
  [h1, s1, l1]: [number, number, number],
  [h2, s2, l2]: [number, number, number],
  t: number
): [number, number, number] {
  let dh = h2 - h1
  if (dh >  180) dh -= 360
  if (dh < -180) dh += 360
  return [h1 + dh * t, lerp(s1, s2, t), lerp(l1, l2, t)]
}

// ─── SVG defs ────────────────────────────────────────────────────────

function buildDefs(p: SoulPrintParams): string {
  const [ph, ps, pl] = p.primaryHsl
  const [sh, ss, sl] = p.secondaryHsl
  return `
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%"   stop-color="${hsl(ph, ps * 0.3, 11)}" />
      <stop offset="100%" stop-color="#020208" />
    </radialGradient>
    <radialGradient id="glowP" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${hsl(ph, ps, pl)}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${hsl(ph, ps, pl)}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowS" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${hsl(sh, ss, sl)}" stop-opacity="0.45" />
      <stop offset="100%" stop-color="${hsl(sh, ss, sl)}" stop-opacity="0" />
    </radialGradient>
    <filter id="bloom" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="bloom-strong" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="halo" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
    </filter>
    <clipPath id="clip">
      <circle cx="${CX}" cy="${CY}" r="232" />
    </clipPath>
  </defs>`
}

// ─── Dual Flame Core — sacred constant in every structure ────────────

function dualFlameCore(p: SoulPrintParams, x = CX, y = CY): string {
  const [ph, ps, pl] = p.primaryHsl
  const [sh, ss, sl] = p.secondaryHsl
  return `
  <circle cx="${x - 5}" cy="${y + 2}" r="11" fill="${hsl(ph, ps, pl)}" opacity="0.9" filter="url(#bloom-strong)" />
  <circle cx="${x + 5}" cy="${y + 2}" r="9"  fill="${hsl(sh, ss, sl)}" opacity="0.85" filter="url(#bloom-strong)" />
  <circle cx="${x}"     cy="${y}"     r="3.5" fill="white" opacity="0.95" filter="url(#bloom)" />`
}

// ════════════════════════════════════════════════════════════════════
// STRUCTURE 1: RADIANT — mandala/starburst (Calm)
// ════════════════════════════════════════════════════════════════════

function buildRadiant(p: SoulPrintParams): string {
  const rng = createRng(p.seed)
  const [ph, ps, pl] = p.primaryHsl
  const [sh, ss, sl] = p.secondaryHsl
  const c = p.complexity
  let out = ''

  out += `<circle cx="${CX}" cy="${CY}" r="210" fill="url(#glowP)" filter="url(#halo)" opacity="0.45" />`
  out += `<circle cx="${CX}" cy="${CY}" r="170" fill="url(#glowS)" filter="url(#halo)" opacity="0.3" />`

  const outerCount = 12 + Math.floor(c * 1.5)
  for (let i = 0; i < outerCount; i++) {
    const base  = (i / outerCount) * Math.PI * 2
    const a     = base + (rng() - 0.5) * 0.18
    const inner = 42 + rng() * 18
    const outer = 160 + rng() * 65
    const x1 = CX + Math.cos(a) * inner
    const y1 = CY + Math.sin(a) * inner
    const x2 = CX + Math.cos(a) * outer
    const y2 = CY + Math.sin(a) * outer
    const qa = a + 0.13
    const qr = (inner + outer) * 0.5
    const qx = CX + Math.cos(qa) * qr
    const qy = CY + Math.sin(qa) * qr
    const t = i / outerCount
    const [rh, rs, rl] = lerpHsl([ph, ps, pl], [sh, ss, sl], t)
    out += `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" `
    out += `stroke="${hsl(rh, rs, rl)}" stroke-width="${(0.4 + rng() * 0.9).toFixed(2)}" fill="none" opacity="${(0.12 + rng() * 0.22).toFixed(3)}" filter="url(#bloom)" />`
  }

  const midCount = 24 + c * 4
  for (let i = 0; i < midCount; i++) {
    const a     = (i / midCount) * Math.PI * 2 + (rng() - 0.5) * 0.05
    const inner = 22
    const outer = 75 + rng() * 90
    const x1 = CX + Math.cos(a) * inner, y1 = CY + Math.sin(a) * inner
    const x2 = CX + Math.cos(a) * outer, y2 = CY + Math.sin(a) * outer
    const color = i % 3 !== 0 ? hsl(ph, ps, pl + 12) : hsl(sh, ss, sl + 12)
    out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" `
    out += `stroke="${color}" stroke-width="0.4" opacity="${(0.25 + rng() * 0.3).toFixed(3)}" />`
  }

  const starCount = 6 + c
  for (let i = 0; i < starCount; i++) {
    const a     = (i / starCount) * Math.PI * 2 + Math.PI / starCount
    const x1 = CX + Math.cos(a) * 8,  y1 = CY + Math.sin(a) * 8
    const x2 = CX + Math.cos(a) * (32 + rng() * 14), y2 = CY + Math.sin(a) * (32 + rng() * 14)
    out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" `
    out += `stroke="white" stroke-width="0.7" opacity="${(0.4 + rng() * 0.35).toFixed(3)}" filter="url(#bloom)" />`
  }

  const ringCount = 3 + Math.floor(c / 3)
  for (let i = 0; i < ringCount; i++) {
    const r = 50 + (i / ringCount) * 165 + rng() * 15
    const [rh, rs, rl] = lerpHsl([ph, ps, pl], [sh, ss, sl], i / ringCount)
    const dash = i % 2 === 0 ? `stroke-dasharray="${(4 + rng() * 5).toFixed(1)} ${(7 + rng() * 9).toFixed(1)}"` : ''
    out += `<circle cx="${CX}" cy="${CY}" r="${r.toFixed(1)}" fill="none" `
    out += `stroke="${hsl(rh, rs, rl)}" stroke-width="0.5" opacity="${(0.08 + (1 - i / ringCount) * 0.18).toFixed(3)}" ${dash} />`
  }

  out += dualFlameCore(p)
  return out
}

// ════════════════════════════════════════════════════════════════════
// STRUCTURE 2: SPIRAL — Archimedean arms (Sadness)
// ════════════════════════════════════════════════════════════════════

function buildSpiral(p: SoulPrintParams): string {
  const rng = createRng(p.seed)
  const [ph, ps, pl] = p.primaryHsl
  const [sh, ss, sl] = p.secondaryHsl
  const c = p.complexity
  let out = ''

  out += `<circle cx="${CX}" cy="${CY}" r="200" fill="url(#glowS)" filter="url(#halo)" opacity="0.35" />`

  const armCount  = 2 + Math.floor(c / 4)
  const steps     = 120 + c * 12
  const rotations = 2.5 + c * 0.25
  const maxR      = 205

  for (let arm = 0; arm < armCount; arm++) {
    const phaseOffset = (arm / armCount) * Math.PI * 2
    const isPrimary   = arm % 2 === 0
    const [bh, bs, bl] = isPrimary ? [ph, ps, pl] as [number,number,number] : [sh, ss, sl] as [number,number,number]

    let pathD = '', isFirst = true
    for (let step = 0; step <= steps; step++) {
      const t     = step / steps
      const theta = t * Math.PI * 2 * rotations + phaseOffset
      const x     = CX + Math.cos(theta) * (t * maxR)
      const y     = CY + Math.sin(theta) * (t * maxR)
      if (isFirst) { pathD = `M${x.toFixed(1)},${y.toFixed(1)}`; isFirst = false }
      else          pathD += ` L${x.toFixed(1)},${y.toFixed(1)}`
    }
    const opacity = (0.3 + rng() * 0.25).toFixed(3)
    const width   = (0.55 + rng() * 0.4).toFixed(2)
    out += `<path d="${pathD}" stroke="${hsl(bh, bs, bl)}" stroke-width="${width}" fill="none" opacity="${opacity}" filter="url(#bloom)" />`

    let mirrorD = ''; isFirst = true
    for (let step = 0; step <= steps; step++) {
      const t     = step / steps
      const theta = -(t * Math.PI * 2 * rotations) + phaseOffset + Math.PI
      const x     = CX + Math.cos(theta) * (t * maxR)
      const y     = CY + Math.sin(theta) * (t * maxR)
      if (isFirst) { mirrorD = `M${x.toFixed(1)},${y.toFixed(1)}`; isFirst = false }
      else          mirrorD += ` L${x.toFixed(1)},${y.toFixed(1)}`
    }
    const mirColor = isPrimary ? hsl(sh, ss, sl) : hsl(ph, ps, pl)
    out += `<path d="${mirrorD}" stroke="${mirColor}" stroke-width="${(parseFloat(width) * 0.6).toFixed(2)}" fill="none" opacity="${(parseFloat(opacity) * 0.55).toFixed(3)}" />`
  }

  const dotCount = 6 + c
  for (let i = 0; i < dotCount; i++) {
    const t     = i / dotCount
    const theta = t * Math.PI * 2 * rotations
    const x     = CX + Math.cos(theta) * (t * 185) + (rng() - 0.5) * 12
    const y     = CY + Math.sin(theta) * (t * 185) + (rng() - 0.5) * 12
    const color = rng() > 0.5 ? hsl(ph, ps, pl + 20) : hsl(sh, ss, sl + 20)
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + rng() * 2.5).toFixed(1)}" `
    out += `fill="${color}" opacity="${(0.5 + rng() * 0.4).toFixed(3)}" filter="url(#bloom)" />`
  }

  for (let i = 0; i < 3; i++) {
    out += `<circle cx="${CX}" cy="${CY}" r="${65 + i * 60}" fill="none" `
    out += `stroke="${hsl(sh, ss, sl)}" stroke-width="0.3" opacity="0.1" stroke-dasharray="3 14" />`
  }

  out += dualFlameCore(p)
  return out
}

// ════════════════════════════════════════════════════════════════════
// STRUCTURE 3: ROOTED — recursive branching tree (Growth)
// ════════════════════════════════════════════════════════════════════

function buildRooted(p: SoulPrintParams): string {
  const rng = createRng(p.seed)
  const [ph, ps, pl] = p.primaryHsl
  const [sh, ss, sl] = p.secondaryHsl
  const c = p.complexity
  let branches = ''
  let leaves   = ''

  branches += `<ellipse cx="${CX}" cy="485" rx="110" ry="25" fill="${hsl(sh, ss, sl)}" opacity="0.09" filter="url(#halo)" />`

  function drawBranch(x: number, y: number, angle: number, length: number, width: number, depth: number, base: [number,number,number]): void {
    if (depth <= 0 || length < 5 || width < 0.15) return
    const endX = x + Math.sin(angle) * length
    const endY = y - Math.cos(angle) * length
    const t = 1 - depth / (7 + Math.floor(c / 3))
    const [bh, bs, bl] = base
    const col = hsl(bh, bs, lerp(bl, bl + 22, t))
    branches += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${endX.toFixed(1)}" y2="${endY.toFixed(1)}" `
    branches += `stroke="${col}" stroke-width="${width.toFixed(2)}" stroke-linecap="round" opacity="${(0.38 + t * 0.45).toFixed(3)}" />`
    if (depth === 1) {
      leaves += `<circle cx="${endX.toFixed(1)}" cy="${endY.toFixed(1)}" r="${(2.5 + rng() * 3.5).toFixed(1)}" `
      leaves += `fill="${hsl(ph, ps, pl + 28)}" opacity="${(0.55 + rng() * 0.35).toFixed(3)}" filter="url(#bloom)" />`
    }
    const childCount = rng() > 0.25 ? 2 : 3
    for (let i = 0; i < childCount; i++) {
      const side = i === 0 ? -1 : (i === 1 ? 1 : 0)
      drawBranch(endX, endY, angle + (0.28 + rng() * 0.28) * side + (rng() - 0.5) * 0.1, length * (0.58 + rng() * 0.22), width * 0.62, depth - 1, [bh + (ph - bh) * 0.15, bs, bl])
    }
  }

  const maxDepth = 5 + Math.floor(c / 3)
  drawBranch(CX, 468, 0, 95 + c * 5, 5.5, maxDepth, [sh, ss, sl])
  if (c >= 5) {
    drawBranch(CX - 18, 475, -0.14, (95 + c * 5) * 0.72, 3.5, maxDepth - 1, [sh, ss * 0.85, sl])
    drawBranch(CX + 18, 475,  0.14, (95 + c * 5) * 0.72, 3.5, maxDepth - 1, [sh, ss * 0.85, sl])
  }

  const seedCount = 10 + c * 2
  for (let i = 0; i < seedCount; i++) {
    const sx = CX + (rng() - 0.5) * 310
    const sy = 40  + rng() * 370
    if (Math.hypot(sx - CX, sy - CY) > 225) continue
    const scol = rng() > 0.5 ? hsl(ph, ps, pl + 18) : hsl(sh, ss, sl + 18)
    branches += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(0.7 + rng() * 1.8).toFixed(1)}" fill="${scol}" opacity="${(0.25 + rng() * 0.45).toFixed(3)}" />`
  }

  branches += `<circle cx="${CX}" cy="${CY - 40}" r="55" fill="url(#glowP)" opacity="0.18" filter="url(#halo)" />`

  return branches + leaves + dualFlameCore(p, CX, CY - 45)
}

// ════════════════════════════════════════════════════════════════════
// STRUCTURE 4: FRAGMENTED — shattered glass/crystal (Tension)
// ════════════════════════════════════════════════════════════════════

function buildFragmented(p: SoulPrintParams): string {
  const rng = createRng(p.seed)
  const [ph, ps, pl] = p.primaryHsl
  const [sh, ss, sl] = p.secondaryHsl
  const c = p.complexity
  let out = ''

  const impactCount = c > 6 ? 2 : 1
  const impacts: [number, number][] = [[CX + (rng() - 0.5) * 28, CY + (rng() - 0.5) * 28]]
  if (impactCount > 1) impacts.push([CX + (rng() - 0.5) * 70, CY + (rng() - 0.5) * 70])

  type FractureLine = { x1: number; y1: number; x2: number; y2: number }
  const lines: FractureLine[] = []

  for (const [ix, iy] of impacts) {
    const rayCount = 10 + c * 2
    for (let r = 0; r < rayCount; r++) {
      const angle = (r / rayCount) * Math.PI * 2 + (rng() - 0.5) * 0.32
      const len   = 70 + rng() * 155
      lines.push({ x1: ix, y1: iy, x2: ix + Math.cos(angle) * len, y2: iy + Math.sin(angle) * len })
    }
  }

  const crossCount = 8 + c * 2
  for (let i = 0; i < crossCount; i++) {
    const cx2   = CX + (rng() - 0.5) * 380
    const cy2   = CY + (rng() - 0.5) * 380
    const angle = rng() * Math.PI * 2
    const half  = 50 + rng() * 110
    lines.push({ x1: cx2 - Math.cos(angle) * half, y1: cy2 - Math.sin(angle) * half, x2: cx2 + Math.cos(angle) * half, y2: cy2 + Math.sin(angle) * half })
  }

  for (const ln of lines) {
    const t = Math.hypot(ln.x2 - CX, ln.y2 - CY) / 220
    const [rh, rs, rl] = lerpHsl([ph, ps, pl], [sh, ss, sl], Math.min(t, 1))
    const isCrack = rng() > 0.62
    const opacity = (isCrack ? 0.38 + rng() * 0.5 : 0.06 + rng() * 0.14).toFixed(3)
    const width   = (isCrack ? 0.5  + rng() * 0.7 : 0.25).toFixed(2)
    const glow    = isCrack ? 'filter="url(#bloom)"' : ''
    const col     = isCrack ? hsl(rh, rs, rl + 22) : hsl(rh, rs, rl)
    out += `<line x1="${ln.x1.toFixed(1)}" y1="${ln.y1.toFixed(1)}" x2="${ln.x2.toFixed(1)}" y2="${ln.y2.toFixed(1)}" stroke="${col}" stroke-width="${width}" opacity="${opacity}" ${glow} />`
  }

  const dotCount = 10 + c
  for (let i = 0; i < dotCount; i++) {
    const dx = CX + (rng() - 0.5) * 370
    const dy = CY + (rng() - 0.5) * 370
    if (Math.hypot(dx - CX, dy - CY) > 222) continue
    const dcol = rng() > 0.5 ? hsl(ph, ps, pl + 30) : hsl(sh, ss, sl + 30)
    out += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${(0.9 + rng() * 2.2).toFixed(1)}" fill="${dcol}" opacity="${(0.45 + rng() * 0.45).toFixed(3)}" filter="url(#bloom)" />`
  }

  for (const [ix, iy] of impacts) {
    out += `<circle cx="${ix.toFixed(1)}" cy="${iy.toFixed(1)}" r="22" fill="${hsl(ph, ps, pl)}" opacity="0.14" filter="url(#halo)" />`
  }

  out += `<circle cx="${CX}" cy="${CY}" r="214" fill="none" stroke="${hsl(ph, ps, pl)}" stroke-width="0.3" opacity="0.13" />`
  out += dualFlameCore(p)
  return out
}

// ─────────────────────────────────────────────────────
// MASTER BUILDER
// ─────────────────────────────────────────────────────

const BUILDERS = {
  radiant:    buildRadiant,
  spiral:     buildSpiral,
  rooted:     buildRooted,
  fragmented: buildFragmented,
}

export function buildSoulPrintSvg(p: SoulPrintParams): string {
  const inner = BUILDERS[p.structure](p)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${buildDefs(p)}
  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <g clip-path="url(#clip)">
    ${inner}
  </g>
  <circle cx="${CX}" cy="${CY}" r="232" fill="none" stroke="${`hsl(${p.primaryHsl[0]},${p.primaryHsl[1]}%,${p.primaryHsl[2]}%)`}" stroke-width="0.4" opacity="0.18" />
  <text x="${CX}" y="492" text-anchor="middle" font-family="monospace" font-size="7" fill="white" opacity="0.12" letter-spacing="3">RYVYNN \u00B7 SOUL PRINT \u00B7 EPHEMERAL</text>
</svg>`
}

// ─────────────────────────────────────────────────────
// DOWNLOAD — complete, no placeholders
// ─────────────────────────────────────────────────────

export function downloadSoulPrint(p: SoulPrintParams): void {
  const svgStr = buildSoulPrintSvg(p)
  const blob   = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href     = url
  a.download = `ryvynn-soul-print-${p.emotion}-${Date.now()}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export async function exportSoulPrintAsPng(p: SoulPrintParams): Promise<void> {
  const svgStr = buildSoulPrintSvg(p)
  const SIZE   = 600
  const img    = new Image()
  const blob   = new Blob([svgStr], { type: 'image/svg+xml' })
  const url    = URL.createObjectURL(blob)

  await new Promise<void>((resolve, reject) => {
    img.onload  = () => resolve()
    img.onerror = reject
    img.src     = url
  })

  const canvas    = document.createElement('canvas')
  canvas.width    = SIZE
  canvas.height   = SIZE
  const ctx       = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, SIZE, SIZE)
  URL.revokeObjectURL(url)

  canvas.toBlob((pngBlob) => {
    if (!pngBlob) return
    const pngUrl = URL.createObjectURL(pngBlob)
    const a      = document.createElement('a')
    a.href     = pngUrl
    a.download = `ryvynn-soul-print-${p.emotion}-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(pngUrl), 100)
  }, 'image/png')
}
