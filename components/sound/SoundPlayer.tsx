"use client"

import { useState, useEffect } from "react"
import { playRegulationAudio, stopRegulationAudio, isAudioPlaying } from "@/lib/audioEngine"
import { AUDIO_COPY } from "@/lib/soundProfiles"

type Props = {
  mood: string
  confessionText?: string
  onClose?: () => void
}

type SongResult = {
  ok: boolean
  profile: {
    name: string
    bpm: number
    description: string
    lowFreqHz: number
    highFreqHz: number
  }
  lyrics: string
  disclaimer: string
  blocked?: boolean
  message?: string
}

export default function SoundPlayer({ mood, confessionText, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SongResult | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      // Clean up audio on unmount
      stopRegulationAudio()
    }
  }, [])

  async function generateSong() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/story-to-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: confessionText || "I need a moment of peace",
          mood,
        }),
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
      // Auto-stop after 60s
      setTimeout(() => setPlaying(false), 61000)
    }
  }

  if (result?.blocked) {
    return (
      <div className="rounded-xl bg-zinc-900 border border-red-900/40 p-6 space-y-4">
        <p className="text-zinc-300 text-sm leading-relaxed">{result.message}</p>
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">🆘 988 Suicide &amp; Crisis Lifeline — call or text <strong className="text-zinc-300">988</strong></p>
          <p className="text-xs text-zinc-500">💬 Crisis Text Line — text <strong className="text-zinc-300">HOME to 741741</strong></p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            Close
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">🎵 Sound Regulation</h3>
        {onClose && (
          <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-zinc-500">{AUDIO_COPY.disclaimer}</p>

      {!result ? (
        <button
          onClick={generateSong}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate sound for this moment"}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-800 p-4 space-y-1">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{result.profile.name} · {result.profile.bpm} BPM</p>
            <p className="text-xs text-zinc-500">{result.profile.description}</p>
          </div>

          {result.lyrics && (
            <div className="rounded-lg bg-zinc-800/50 p-4 border border-zinc-700/40">
              <p className="text-sm text-zinc-300 leading-relaxed italic whitespace-pre-wrap">{result.lyrics}</p>
            </div>
          )}

          <button
            onClick={toggleAudio}
            className="w-full py-3 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {playing ? (
              <>
                <span className="w-3 h-3 border-2 border-white rounded-sm inline-block" />
                Stop Audio
              </>
            ) : (
              <>
                <span className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white inline-block" />
                Play Audio ({result.profile.bpm} BPM)
              </>
            )}
          </button>

          <button
            onClick={() => { setResult(null); stopRegulationAudio(); setPlaying(false) }}
            className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Try a different profile
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
