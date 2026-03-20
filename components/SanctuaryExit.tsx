'use client'
import { useState, useEffect } from 'react'

interface SanctuaryExitProps {
  userId: string
  isPlusUser?: boolean
  onComplete: () => void
  onCancel: () => void
}

export default function SanctuaryExit({ userId, isPlusUser = false, onComplete, onCancel }: SanctuaryExitProps) {
  const [reflection, setReflection] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [purging, setPurging] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/sanctuary-exit')
      .then(r => r.json())
      .then(d => { setReflection(d.reflection); setLoading(false); })
      .catch(() => { setReflection('You carried something real here today. The space releases it now — and you — gently.'); setLoading(false); })
  }, [])

  const handleRelease = async () => {
    setPurging(true)
    try {
      await fetch('/api/sanctuary-exit', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isPlusUser }),
      })
    } catch (e) { /* silent */ }
    
    setDone(true)
    setTimeout(() => {
      onComplete()
    }, 2500)
  }

  if (done) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-zinc-500 text-xs tracking-widest uppercase">Released</div>
          <p className="text-zinc-400 font-light italic text-lg">The space is clear.</p>
          <div className="w-px h-12 bg-zinc-800 mx-auto" />
          <p className="text-zinc-600 text-xs">Returning you now…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 z-50">
      <div className="max-w-md w-full text-center space-y-10">

        {/* Parting Reflection */}
        <div className="space-y-4">
          <div className="text-zinc-600 text-xs tracking-widest uppercase">Parting Reflection</div>
          {loading ? (
            <div className="h-16 flex items-center justify-center">
              <div className="w-1 h-1 bg-zinc-600 rounded-full animate-pulse" />
            </div>
          ) : (
            <p className="text-zinc-200 font-light italic text-lg leading-relaxed">
              {reflection}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-zinc-800 mx-auto" />

        {/* Actions */}
        <div className="space-y-5">
          <p className="text-zinc-600 text-xs">
            This session and all encrypted traces will be permanently erased.
          </p>

          <button
            onClick={handleRelease}
            disabled={purging || loading}
            className="group relative w-full py-4 bg-transparent border border-zinc-800 hover:border-zinc-500 rounded-full transition-all duration-700 overflow-hidden disabled:opacity-40"
          >
            <span className="relative z-10 text-zinc-400 group-hover:text-white transition-colors duration-500 text-sm tracking-wide">
              {purging ? 'Releasing…' : 'Release & Close Space'}
            </span>
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-[1500ms]" />
          </button>

          <button
            onClick={onCancel}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            Wait, keep this session
          </button>
        </div>
      </div>
    </div>
  )
}
