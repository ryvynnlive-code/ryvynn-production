"use client"

import { useEffect, useRef } from "react"

type Props = {
  active: boolean
  bpm?: number
  lowFreqHz?: number
  mood?: string
}

const MOOD_COLORS: Record<string, [string, string]> = {
  calm:    ["rgba(147,197,253,", "rgba(186,230,253,"],
  steady:  ["rgba(134,239,172,", "rgba(187,247,208,"],
  release: ["rgba(249,168,212,", "rgba(251,207,232,"],
  heavy:   ["rgba(167,139,250,", "rgba(196,181,253,"],
  anxious: ["rgba(252,211,77,",  "rgba(253,230,138,"],
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function CornerLight({ active, bpm = 60, lowFreqHz = 80, mood = "calm" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)
  const startRef  = useRef<number>(0)
  const beatRef   = useRef<number>(0)
  const beatPhaseRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    cancelAnimationFrame(rafRef.current)

    if (!active) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    const [c1, c2] = MOOD_COLORS[mood] ?? MOOD_COLORS.calm
    const beatInterval = (60 / bpm) * 1000
    const freqNorm = Math.min(lowFreqHz / 200, 1)
    const maxR = Math.hypot(canvas.width, canvas.height)

    startRef.current  = Date.now()
    beatRef.current   = Date.now()
    beatPhaseRef.current = 0

    const draw = () => {
      const now     = Date.now()
      const elapsed = now - startRef.current
      const prog    = Math.min(elapsed / 62000, 1)
      const eased   = easeInOutCubic(prog)

      if (now - beatRef.current >= beatInterval) {
        beatRef.current = now
        beatPhaseRef.current = 1
      }
      beatPhaseRef.current = Math.max(0, beatPhaseRef.current - 0.04)
      const bp = beatPhaseRef.current

      // Light starts bottom-right corner, slowly drifts toward center-upper
      const cx = canvas.width  * (1 - 0.75 * eased) + Math.sin(elapsed / 4000) * 25 * (1 - eased * 0.6)
      const cy = canvas.height * (1 - 0.70 * eased) + Math.cos(elapsed / 5500) * 18 * (1 - eased * 0.6)

      const baseR = 50 + maxR * 0.6 * eased
      const r     = baseR + bp * 35 * freqNorm

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Ambient haze
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.2)
      g1.addColorStop(0, c1 + "0.05)")
      g1.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = g1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Mid glow
      const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g2.addColorStop(0,   c1 + "0.22)")
      g2.addColorStop(0.5, c2 + "0.09)")
      g2.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.fillStyle = g2
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Bright core
      const coreR = 28 + bp * 18 + prog * 22
      const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
      g3.addColorStop(0,   "rgba(255,255,255,0.95)")
      g3.addColorStop(0.4, c1 + "0.85)")
      g3.addColorStop(1,   "rgba(0,0,0,0)")
      ctx.fillStyle = g3
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Beat rays
      if (bp > 0.25) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.globalAlpha = bp * 0.14
        for (let i = 0; i < 6; i++) {
          const angle  = (i / 6) * Math.PI * 2 + elapsed / 9000
          const rayLen = r * 0.65 * bp
          const gr = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLen, Math.sin(angle) * rayLen)
          gr.addColorStop(0, "rgba(255,255,255,0.7)")
          gr.addColorStop(1, "rgba(255,255,255,0)")
          ctx.strokeStyle = gr
          ctx.lineWidth   = 2.5
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(Math.cos(angle) * rayLen, Math.sin(angle) * rayLen)
          ctx.stroke()
        }
        ctx.restore()
        ctx.globalAlpha = 1
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, bpm, lowFreqHz, mood])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5, mixBlendMode: "screen" }}
    />
  )
}
