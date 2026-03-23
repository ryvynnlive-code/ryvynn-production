'use client'
// components/BurnOnExit.tsx
// Ember dissolve animation — visual proof of zero storage
// Dual Flame cyan/purple embers float up on session clear

import { useState, useEffect, useRef } from 'react'

interface Ember {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
}

interface BurnOnExitProps {
  onComplete: () => void
  triggerBurn: boolean
}

export function BurnOnExit({ onComplete, triggerBurn }: BurnOnExitProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const [burning, setBurning] = useState(false)
  const animFrameRef  = useRef<number | undefined>(undefined)
  const embersRef     = useRef<Ember[]>([])

  useEffect(() => {
    if (!triggerBurn) return
    setBurning(true)
    startBurn()
  }, [triggerBurn]) // eslint-disable-line react-hooks/exhaustive-deps

  function createEmber(x: number, y: number): Ember {
    const colors = ['#00D9FF', '#8B5CF6', '#60A5FA', '#C084FC', '#FFFFFF']
    return {
      id:      Math.random(),
      x, y,
      vx:      (Math.random() - 0.5) * 3,
      vy:      -Math.random() * 4 - 1,
      size:    Math.random() * 4 + 1,
      opacity: 1,
      color:   colors[Math.floor(Math.random() * colors.length)],
      life:    1.0,
    }
  }

  function startBurn() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const initial: Ember[] = []
    for (let i = 0; i < 200; i++) {
      initial.push(createEmber(
        Math.random() * canvas.width,
        Math.random() * canvas.height * 0.8 + canvas.height * 0.1
      ))
    }
    embersRef.current = initial

    const startTime = Date.now()
    const DURATION  = 1800

    function animate() {
      if (!ctx || !canvas) return
      const elapsed  = Date.now() - startTime
      const progress = Math.min(elapsed / DURATION, 1)

      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (progress < 0.7) {
        for (let i = 0; i < 5; i++) {
          embersRef.current.push(createEmber(
            Math.random() * canvas.width,
            Math.random() * canvas.height * 0.8 + canvas.height * 0.1
          ))
        }
      }

      embersRef.current = embersRef.current.filter((e) => e.life > 0)
      embersRef.current.forEach((ember) => {
        ember.x   += ember.vx
        ember.vy  -= 0.05
        ember.y   += ember.vy
        ember.life -= 0.012
        ember.opacity = ember.life

        ctx.save()
        ctx.globalAlpha = ember.opacity
        ctx.fillStyle   = ember.color
        ctx.shadowColor = ember.color
        ctx.shadowBlur  = ember.size * 3
        ctx.beginPath()
        ctx.arc(ember.x, ember.y, ember.size * (0.5 + ember.life * 0.5), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      if (progress < 1 || embersRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        setTimeout(onComplete, 200)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [])

  if (!burning) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ background: 'transparent' }}
    />
  )
}

// ─── Drop-in Clear Button with burn effect ───────────────────────────

export function BurnClearButton({ onClear }: { onClear: () => void }) {
  const [triggered, setTriggered] = useState(false)

  return (
    <>
      <button
        onClick={() => setTriggered(true)}
        className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 transition-colors"
        title="Clear session — nothing remains"
      >
        🔥 Clear & Burn
      </button>
      <BurnOnExit
        triggerBurn={triggered}
        onComplete={() => { setTriggered(false); onClear() }}
      />
    </>
  )
}
