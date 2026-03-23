'use client'
// components/GroundingRoutine.tsx
// 4-7-8 breathing routine with Dual Flame visual sync
// Activates parasympathetic nervous system — clinical grounding intervention

import { useState, useEffect, useCallback } from 'react'
import { CrisisLevel } from '@/lib/guardianProtocol'

type Phase = 'intro' | 'inhale' | 'hold' | 'exhale' | 'rest' | 'complete'

interface GroundingRoutineProps {
  level: CrisisLevel
  onComplete: () => void
  onExit: () => void
}

const PHASE_CONFIG = {
  inhale: { duration: 4000, label: 'Breathe in...',  instruction: 'Through your nose, slow and steady', color: '#00D9FF' },
  hold:   { duration: 7000, label: 'Hold...',         instruction: 'Gently — no force needed',           color: '#8B5CF6' },
  exhale: { duration: 8000, label: 'Breathe out...', instruction: 'All the way out, through your mouth', color: '#60A5FA' },
  rest:   { duration: 1000, label: '...',             instruction: '',                                   color: '#1E3A8A' },
}

const TOTAL_CYCLES = 4

export function GroundingRoutine({ level, onComplete, onExit }: GroundingRoutineProps) {
  const [phase, setPhase]     = useState<Phase>('intro')
  const [cycle, setCycle]     = useState(0)
  const [progress, setProgress] = useState(0)
  const [scale, setScale]     = useState(1)

  const runPhase = useCallback((currentPhase: Phase, currentCycle: number) => {
    if (currentPhase === 'complete') return

    const sequence: Phase[] = ['inhale', 'hold', 'exhale', 'rest']
    const config = PHASE_CONFIG[currentPhase as keyof typeof PHASE_CONFIG]
    if (!config) return

    const { duration } = config
    const startTime    = Date.now()

    if (currentPhase === 'inhale')       setScale(1.6)
    else if (currentPhase === 'hold')    setScale(1.5)
    else                                 setScale(1.0)

    const progressInterval = setInterval(() => {
      const pct = Math.min(((Date.now() - startTime) / duration) * 100, 100)
      setProgress(pct)
      if (pct >= 100) clearInterval(progressInterval)
    }, 50)

    const nextTimer = setTimeout(() => {
      clearInterval(progressInterval)
      const idx       = sequence.indexOf(currentPhase as typeof sequence[number])
      const nextPhase = sequence[(idx + 1) % sequence.length] as Phase

      if (nextPhase === 'inhale') {
        const nextCycle = currentCycle + 1
        if (nextCycle >= TOTAL_CYCLES) { setPhase('complete'); return }
        setCycle(nextCycle)
        setPhase(nextPhase)
        runPhase(nextPhase, nextCycle)
      } else {
        setPhase(nextPhase)
        runPhase(nextPhase, currentCycle)
      }
    }, duration)

    return () => { clearInterval(progressInterval); clearTimeout(nextTimer) }
  }, [])

  function startRoutine() {
    setPhase('inhale')
    setCycle(0)
    setProgress(0)
    runPhase('inhale', 0)
  }

  const currentConfig = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#030820]/95 backdrop-blur-sm p-6">
      <button
        onClick={onExit}
        className="absolute top-6 right-6 text-white/30 hover:text-white/60 transition-colors text-2xl leading-none"
        aria-label="Close"
      >
        ×
      </button>

      {phase === 'intro' && (
        <div className="text-center space-y-6 max-w-sm">
          <div className="text-5xl">🌬️</div>
          <h3 className="text-2xl font-bold text-white">
            {level === 'moderate' ? "Let's ground you first." : "Let's slow your nervous system down."}
          </h3>
          <p className="text-blue-100/70 leading-relaxed">
            This is a 4-7-8 breathing exercise. It activates your parasympathetic
            nervous system — the one that signals &quot;you&apos;re safe.&quot; Takes 2 minutes.
          </p>
          <button
            onClick={startRoutine}
            className="w-full py-4 bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-black font-bold rounded-2xl text-lg hover:scale-[1.02] transition-transform"
          >
            I&apos;m ready
          </button>
          <button onClick={onExit} className="text-white/30 text-sm hover:text-white/50 transition-colors">
            Skip — take me back
          </button>
        </div>
      )}

      {phase !== 'intro' && phase !== 'complete' && (
        <div className="flex flex-col items-center space-y-8 w-full max-w-xs">
          <div className="flex gap-2">
            {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i < cycle ? 'bg-[#00D9FF]' : i === cycle ? 'bg-[#00D9FF] scale-125' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            <div
              className="absolute rounded-full transition-all duration-[4000ms] ease-in-out"
              style={{
                width:  `${140 * scale}px`,
                height: `${140 * scale}px`,
                background: `radial-gradient(circle, ${currentConfig?.color || '#00D9FF'}30 0%, transparent 70%)`,
                filter: 'blur(20px)',
              }}
            />
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width:  `${100 * scale}px`,
                height: `${100 * scale}px`,
                background: `radial-gradient(circle at 40% 40%, ${currentConfig?.color || '#00D9FF'} 0%, ${phase === 'inhale' ? '#8B5CF6' : '#1E3A8A'} 60%)`,
                boxShadow: `0 0 30px ${currentConfig?.color || '#00D9FF'}60`,
                transition: `all ${phase === 'inhale' ? '4000ms' : phase === 'exhale' ? '8000ms' : '300ms'} ease-in-out`,
              }}
            >
              <img
                src="/assets/dual-flame-logo.png"
                alt=""
                className="w-12 h-12 object-contain opacity-80"
                style={{
                  filter: phase === 'inhale' ? 'brightness(1.4)' : phase === 'exhale' ? 'brightness(0.8) hue-rotate(180deg)' : 'brightness(1) hue-rotate(200deg)',
                  transition: 'filter 1s ease-in-out',
                }}
              />
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-3xl font-bold transition-all duration-500" style={{ color: currentConfig?.color || 'white' }}>
              {currentConfig?.label || ''}
            </p>
            <p className="text-white/50 text-sm">{currentConfig?.instruction || ''}</p>
          </div>

          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(to right, ${currentConfig?.color || '#00D9FF'}, #8B5CF6)`,
              }}
            />
          </div>

          <p className="text-white/30 text-xs tracking-widest uppercase">Cycle {cycle + 1} of {TOTAL_CYCLES}</p>
        </div>
      )}

      {phase === 'complete' && (
        <div className="text-center space-y-6 max-w-sm">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite]"
            style={{ background: 'radial-gradient(circle, #00D9FF40 0%, #8B5CF640 50%, transparent 100%)', boxShadow: '0 0 40px rgba(0,217,255,0.2)' }}
          >
            <img src="/assets/dual-flame-logo.png" alt="" className="w-12 h-12 object-contain" />
          </div>

          <div>
            <p className="text-[#00D9FF] text-sm font-mono uppercase tracking-widest mb-2">You made it through</p>
            <h3 className="text-2xl font-bold text-white mb-3">Your nervous system just shifted.</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              That wasn&apos;t small. 4-7-8 breathing activates your vagus nerve — your body&apos;s built-in reset switch.
              You&apos;re still here. That&apos;s everything.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-white/50 text-xs mb-3">If you&apos;re still hurting, a real person is one text away:</p>
            <a
              href="sms:741741&body=HOME"
              className="block w-full py-3 border border-[#00D9FF]/30 text-[#00D9FF] font-semibold rounded-xl text-center text-sm hover:bg-[#00D9FF]/10 transition-colors"
            >
              Text HOME to 741741
            </a>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-4 bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-black font-bold rounded-2xl hover:scale-[1.02] transition-transform"
          >
            Back to RYVYNN
          </button>
        </div>
      )}
    </div>
  )
}
