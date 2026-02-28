"use client"

import { useState, useEffect } from "react"
import { playRegulationAudio, stopRegulationAudio } from "@/lib/audioEngine"
import CornerLight from "@/components/healing/CornerLight"

type Props = {
  mood: string
  confessionText?: string
  onClose?: () => void
}

type SongResult = {
  ok: boolean
  profile: { name: string; bpm: number; description: string; lowFreqHz: number; highFreqHz: number }
  lyrics: string
  disclaimer: string
  blocked?: boolean
  message?: string
  resources?: { crisis: string; text: string }
}

export default function SoundPlayer({ mood, confessionText, onClose }: Props) {
  const [loading, setLoading]     = useState(false)
  const [result,  setResult]      = useState<SongResult | null>(null)
  const [playing, setPlaying]     = useState(false)
  const [error,   setError]       = useState<string | null>(null)
  const [elapsed, setElapsed]     = useState(0)

  // Tick elapsed time while playing
  useEffect(() => {
    if (!playing) { setElapsed(0); return }
    const iv = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(iv)
  }, [playing])

  // Auto-stop after 60s
  useEffect(() => {
    if (elapsed >= 60 && playing) {
      stopRegulationAudio()
      setPlaying(false)
    }
  }, [elapsed, playing])

  useEffect(() => {
    return () => { stopRegulationAudio() }
  }, [])

  async function generateSong() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch("/api/story-to-song", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: confessionText || "I need a moment of peace", mood }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  function toggleAudio() {
    if (!result?.profile) return
    if (playing) {
      stopRegulationAudio()
      setPlaying(false)
    } else {
      playRegulationAudio(result.profile)
      setPlaying(true)
    }
  }

  // ---- Crisis block ----
  if (result?.blocked) {
    return (
      <div className="rounded-xl bg-zinc-900 border border-red-900/50 p-6 space-y-4">
        <p className="text-zinc-300 text-sm leading-relaxed">{result.message}</p>
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">🆘 <strong className="text-zinc-300">988</strong> — call or text 988</p>
          <p className="text-xs text-zinc-500">💬 Crisis Text — text <strong className="text-zinc-300">HOME to 741741</strong></p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
        )}
      </div>
    )
  }

  const profile = result?.profile

  return (
    <>
      {/* Corner light — only visible when playing */}
      <CornerLight
        active={playing}
        bpm={profile?.bpm ?? 60}
        lowFreqHz={profile?.lowFreqHz ?? 80}
        mood={mood}
      />

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">🎵 Sound & Healing</h3>
          {onClose && (
            <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">✕</button>
          )}
        </div>

        {!result ? (
          <>
            <p className="text-xs text-zinc-500">Your pain becomes sound. A frequency matched to this moment — just for you.</p>
            <button
              onClick={generateSong}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Composing your frequency..." : "Transform Pain into Sound"}
            </button>
          </>
        ) : (
          <div className="space-y-4">
            {/* Profile info */}
            <div className="rounded-lg bg-zinc-800 p-4 space-y-1">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                {profile?.name} · {profile?.bpm} BPM · {profile?.lowFreqHz}Hz
              </p>
              <p className="text-xs text-zinc-500">{profile?.description}</p>
            </div>

            {/* Lyrics */}
            {result.lyrics && (
              <div className="rounded-lg bg-zinc-800/50 p-4 border border-zinc-700/40">
                <p className="text-sm text-zinc-300 leading-relaxed italic whitespace-pre-wrap">{result.lyrics}</p>
              </div>
            )}

            {/* Play/Stop */}
            <button
              onClick={toggleAudio}
              className="w-full py-3.5 rounded-lg text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{
                background: playing
                  ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                  : "linear-gradient(135deg,#be185d,#a21caf)",
                boxShadow: playing ? "0 0 20px rgba(167,139,250,0.35)" : "none",
              }}
            >
              {playing ? (
                <>
                  <span className="w-3 h-3 border-2 border-white rounded-sm inline-block" />
                  Stop · {60 - elapsed}s remaining
                </>
              ) : (
                <>
                  <span className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white inline-block" />
                  Play Healing Frequency
                </>
              )}
            </button>

            {playing && (
              <p className="text-center text-xs text-zinc-600 animate-pulse">
                Watch the light… it grows with you 🔥
              </p>
            )}

            <p className="text-xs text-zinc-600 text-center">{result.disclaimer}</p>

            <button
              onClick={() => { setResult(null); stopRegulationAudio(); setPlaying(false) }}
              className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Try a different mood
            </button>
          </div>
        )}

        {error && <p className="text-xs text-fuchsia-400">{error}</p>}
      </div>
    </>
  )
}
