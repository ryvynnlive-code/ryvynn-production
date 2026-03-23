'use client'
// components/MiracleReveal.tsx
// 3-beat transformation: Validation → The Flip → The Anchor
// Blur-reveal mechanic — dopamine of relief
// Soul Print appears 2.5s after reveal

import { useState, useCallback } from 'react'
import { SoulPrint } from './SoulPrint'

interface MiracleRevealProps {
  miracle: string
  loading: boolean
  persona: string
  onSessionClose: () => void
}

// 3-beat structure enforced in system prompt; rendered per-beat here
function renderBeats(text: string) {
  const beats = text.split('\n').filter(Boolean)
  return beats.map((beat, i) => (
    <p
      key={i}
      className={`leading-relaxed ${
        i === 0
          ? 'text-gray-300 italic'           // Beat 1 — Validation (softer)
          : i === beats.length - 1
          ? 'text-[#00D9FF] font-medium'     // Beat 3 — Anchor (action, cyan)
          : 'text-white'                      // Beat 2 — The Flip (truth, white)
      }`}
    >
      {beat}
    </p>
  ))
}

export function MiracleReveal({ miracle, loading, persona, onSessionClose }: MiracleRevealProps) {
  const [revealed,        setRevealed]        = useState(false)
  const [showSoulPrint,   setShowSoulPrint]   = useState(false)

  const handleReveal = useCallback(() => {
    setRevealed(true)
    setTimeout(() => setShowSoulPrint(true), 2500) // user reads miracle first
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#00D9FF]/5 to-[#8B5CF6]/5 border border-[#00D9FF]/20 rounded-2xl rounded-tl-sm p-5">
        <p className="text-[#00D9FF]/60 text-xs mb-2">RYVYNN</p>
        <div className="flex gap-1 items-center h-6">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 bg-[#00D9FF] rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <div className="relative bg-gradient-to-br from-[#00D9FF]/8 to-[#8B5CF6]/8 border border-[#00D9FF]/20 rounded-2xl rounded-tl-sm p-5">
        <p className="text-[#00D9FF]/60 text-xs mb-3">RYVYNN</p>

        {/* Blurred content */}
        <div
          className={`transition-all duration-700 space-y-3 ${
            !revealed ? 'blur-sm select-none pointer-events-none' : ''
          }`}
        >
          {renderBeats(miracle)}
        </div>

        {/* Reveal overlay */}
        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
            <button
              onClick={handleReveal}
              className="px-6 py-3 bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-black font-bold rounded-full text-sm shadow-[0_0_20px_rgba(0,217,255,0.4)] hover:shadow-[0_0_30px_rgba(0,217,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-200"
            >
              🔥 Reveal the Miracle
            </button>
          </div>
        )}
      </div>

      {/* Soul Print — appears 2.5s after reveal, only if session had depth */}
      {revealed && miracle.length > 80 && (
        <SoulPrint
          miracleResponse={miracle}
          persona={persona}
          onSessionClose={onSessionClose}
          visible={showSoulPrint}
        />
      )}
    </div>
  )
}

// ─── Demo carousel for homepage — static pairs ───────────────────────

const DEMO_PAIRS = [
  {
    confession: "I feel like I'm drowning and no one gets it...",
    miracle: `That weight is real and heavy. You reached out — that took more strength than you know.\n\nBut here's what you just proved: you found words for it. That's not drowning. That's swimming.\n\nHand on your chest. Feel that heartbeat? Still here. In for 4... hold... out for 6.`,
  },
  {
    confession: "Everything feels numb and pointless lately",
    miracle: `Numb isn't empty — it's your nervous system protecting you from too much at once.\n\nThe fact that you noticed the numbness means something in you is still watching, still waiting for the feeling to come back. It will.\n\nName 5 things you can see right now. Just list them. I'll wait.`,
  },
  {
    confession: "I'm so angry I can't think straight",
    miracle: `That anger is real information. Something important to you was violated — your nervous system is not wrong.\n\nBut anger at this intensity is fire without direction. Right now it's burning you first.\n\nJaw unclenched. Shoulders down. One slow exhale through your mouth. All the way out.`,
  },
]

export function MiracleDemoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [revealed,    setRevealed]    = useState(false)

  const pair  = DEMO_PAIRS[activeIndex]
  const beats = pair.miracle.split('\n').filter(Boolean)

  function goTo(i: number) { setActiveIndex(i); setRevealed(false) }

  return (
    <div className="space-y-4">
      {/* Confession bubble */}
      <div className="ml-auto max-w-xs bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm p-4">
        <p className="text-white/40 text-xs mb-2">You</p>
        <p className="text-white text-sm">{pair.confession}</p>
      </div>

      {/* Miracle bubble */}
      <div className="mr-auto max-w-sm relative bg-gradient-to-br from-[#00D9FF]/8 to-[#8B5CF6]/8 border border-[#00D9FF]/20 rounded-2xl rounded-tl-sm p-4">
        <p className="text-[#00D9FF]/60 text-xs mb-3">RYVYNN</p>
        <div className={`space-y-2 transition-all duration-700 ${!revealed ? 'blur-sm select-none' : ''}`}>
          {beats.map((beat, i) => (
            <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-gray-300 italic' : i === beats.length - 1 ? 'text-[#00D9FF]' : 'text-white'}`}>
              {beat}
            </p>
          ))}
        </div>
        {!revealed && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
            <button
              onClick={() => setRevealed(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-black font-bold rounded-full text-sm hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(0,217,255,0.3)]"
            >
              🔥 Reveal
            </button>
          </div>
        )}
      </div>

      {/* Carousel dots */}
      <div className="flex gap-2 justify-center pt-2">
        {DEMO_PAIRS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-5 h-2 bg-[#00D9FF]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
