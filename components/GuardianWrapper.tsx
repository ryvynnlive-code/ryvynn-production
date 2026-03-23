'use client'
// components/GuardianWrapper.tsx
// C-SSRS Soft-Landing Safety Hub
// High/Critical: Full Safety Blue takeover with embedded 988 dialer
// Moderate: Grounding overlay (non-blocking, agency-respecting)

import { useState, useEffect, useRef } from 'react'
import { assessCrisis, CrisisLevel, GuardianSessionTracker } from '@/lib/guardianProtocol'
import { GroundingRoutine } from './GroundingRoutine'

interface GuardianWrapperProps {
  children: React.ReactNode
  lastInput: string
  onLevelChange?: (level: CrisisLevel) => void
}

const tracker = new GuardianSessionTracker()

export function GuardianWrapper({ children, lastInput, onLevelChange }: GuardianWrapperProps) {
  const [level, setLevel]               = useState<CrisisLevel>('none')
  const [showGrounding, setShowGrounding] = useState(false)
  const [groundingDone, setGroundingDone] = useState(false)
  const previousInput                   = useRef('')

  useEffect(() => {
    if (!lastInput || lastInput === previousInput.current) return
    previousInput.current = lastInput

    const raw    = assessCrisis(lastInput)
    const signal = tracker.track(raw)

    if (signal.level !== 'none' && signal.level !== level) {
      setLevel(signal.level)
      onLevelChange?.(signal.level)
      if ((signal.level === 'moderate' || signal.level === 'low') && !groundingDone) {
        setShowGrounding(true)
      }
    }
  }, [lastInput, level, groundingDone, onLevelChange])

  // No crisis — render normally
  if (level === 'none') return <>{children}</>

  // Low — children + grounding overlay
  if (level === 'low') {
    return (
      <>
        {children}
        {showGrounding && (
          <GroundingRoutine
            level={level}
            onComplete={() => { setShowGrounding(false); setGroundingDone(true) }}
            onExit={() => { setShowGrounding(false); setLevel('none') }}
          />
        )}
      </>
    )
  }

  // Moderate — children behind + grounding overlay
  if (level === 'moderate' && showGrounding) {
    return (
      <>
        {children}
        <GroundingRoutine
          level={level}
          onComplete={() => { setShowGrounding(false); setGroundingDone(true); setLevel('low') }}
          onExit={() => { setShowGrounding(false); setLevel('none') }}
        />
      </>
    )
  }

  // Moderate after grounding — back to normal
  if (level === 'moderate' && groundingDone) return <>{children}</>

  // HIGH / CRITICAL — Full Safety Hub
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 transition-all duration-1000 ease-in-out bg-gradient-to-b from-[#030820] via-[#051030] to-[#030820]">
      <div
        className="absolute inset-0 opacity-20"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #1E3A8A 0%, transparent 65%)' }}
      />

      {/* Dual Flame — safety blue shift, never removed */}
      <div className="relative mb-8 z-10">
        <div
          className="w-20 h-20 rounded-full animate-[pulse_3s_ease-in-out_infinite]"
          style={{
            background: 'radial-gradient(circle, #60A5FA 0%, #1E3A8A 60%, transparent 100%)',
            boxShadow: '0 0 40px rgba(96, 165, 250, 0.4), 0 0 80px rgba(30, 58, 138, 0.2)',
          }}
        />
        <img
          src="/assets/dual-flame-logo.png"
          alt="RYVYNN"
          className="absolute inset-0 w-full h-full object-contain opacity-60"
          style={{ filter: 'hue-rotate(200deg) brightness(1.4)' }}
        />
      </div>

      <div className="relative z-10 max-w-sm w-full text-center space-y-5">
        <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">
          {level === 'critical' ? 'Stay with me.' : "Stay with me."}
        </h2>

        <p className="text-blue-100/80 leading-relaxed text-base">
          You&apos;ve shared something very heavy. I&apos;m an AI — I want to make sure you have a real person
          to hold onto right now. You are not in this alone.
        </p>

        <a
          href="tel:988"
          className="flex items-center justify-center gap-3 w-full py-5 bg-white text-[#030820] font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          📞 Call or Text 988
        </a>

        <a
          href="sms:741741&body=HOME"
          className="flex items-center justify-center gap-3 w-full py-4 border border-blue-400/30 text-blue-100 font-bold rounded-2xl hover:bg-blue-900/30 hover:border-blue-400/50 transition-all duration-200"
        >
          💬 Text HOME to 741741
        </a>

        <button
          onClick={() => window.open('https://988lifeline.org/chat/', '_blank')}
          className="flex items-center justify-center gap-2 w-full py-4 border border-white/10 text-white/70 font-semibold rounded-2xl hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          🌐 Online Chat (24/7, anonymous)
        </button>

        {!showGrounding && (
          <button
            onClick={() => setShowGrounding(true)}
            className="w-full py-3 text-blue-300/70 text-sm hover:text-blue-300 transition-colors border border-blue-400/10 rounded-xl hover:border-blue-400/30"
          >
            🌬️ I need to breathe first — guide me
          </button>
        )}

        <button
          onClick={() => { setLevel('none'); setShowGrounding(false); tracker.reset() }}
          className="text-white/30 text-sm hover:text-white/60 underline underline-offset-4 transition-colors pt-2"
        >
          I&apos;m safe now — take me back to RYVYNN
        </button>
      </div>

      <p className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-white/20 uppercase tracking-widest px-8">
        This safety layer runs entirely in your browser. No data was logged or stored. Your privacy remains absolute — even here.
      </p>

      {showGrounding && (
        <GroundingRoutine
          level={level}
          onComplete={() => setShowGrounding(false)}
          onExit={() => setShowGrounding(false)}
        />
      )}
    </div>
  )
}
