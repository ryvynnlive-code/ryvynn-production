'use client'
// components/SoulPrint.tsx
// Transient visual artifact — generated from session miracle text
// useMemo ensures data is tied to React lifecycle — GC clears on unmount
// Nothing is persisted. Ever.

import { useState, useMemo, useEffect } from 'react'
import { analyzeSession }                from '@/lib/soulPrintGenerator'
import { buildSoulPrintSvg, downloadSoulPrint, exportSoulPrintAsPng } from '@/lib/soulPrintSvg'

interface SoulPrintProps {
  miracleResponse: string
  persona: string // 'feminine' | 'masculine' | 'neutral'
  onSessionClose: () => void
  visible?: boolean
}

export function SoulPrint({
  miracleResponse,
  persona,
  onSessionClose,
  visible = false,
}: SoulPrintProps) {
  const [entered,     setEntered]     = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloaded,  setDownloaded]  = useState(false)

  // Computed ONCE, tied to component lifecycle — zero persistence
  const params    = useMemo(() => analyzeSession(miracleResponse, persona), [miracleResponse, persona])
  const svgString = useMemo(() => buildSoulPrintSvg(params), [params])

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setEntered(true), 80)
      return () => clearTimeout(t)
    }
  }, [visible])

  async function handleDownloadSvg() {
    setDownloading(true)
    try { downloadSoulPrint(params); setDownloaded(true) }
    finally { setDownloading(false) }
  }

  async function handleDownloadPng() {
    setDownloading(true)
    try { await exportSoulPrintAsPng(params) }
    finally { setDownloading(false) }
  }

  async function handleCopyClipboard() {
    try {
      // Convert SVG to PNG blob then copy
      const img    = new Image()
      const blob   = new Blob([svgString], { type: 'image/svg+xml' })
      const url    = URL.createObjectURL(blob)
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url })
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 600
      canvas.getContext('2d')!.drawImage(img, 0, 0, 600, 600)
      URL.revokeObjectURL(url)
      canvas.toBlob(async (pngBlob) => {
        if (!pngBlob) return
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })])
          setDownloaded(true)
        } catch { /* clipboard API not available, fallback */ }
      }, 'image/png')
    } catch { /* ignore */ }
  }

  if (!visible) return null

  const glowColor = `hsl(${params.primaryHsl[0]},${params.primaryHsl[1]}%,${params.primaryHsl[2]}%)`

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="border-t border-white/5 pt-8 mt-6">

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <p className="text-[10px] font-mono uppercase tracking-[4px] text-[#00D9FF] opacity-70">
            Soul Print Generated
          </p>
          <h4 className="text-xl font-bold text-white">Your Transient Artifact</h4>
          <p className="text-gray-500 text-sm max-w-[260px] mx-auto leading-relaxed">
            A visual refraction of this session&apos;s breakthrough. Only you will ever see this.
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-center gap-3 mb-6 text-[10px] font-mono text-gray-600 uppercase tracking-wider">
          <span>{params.label}</span>
          <span className="text-white/15">·</span>
          <span>{params.structureLabel}</span>
          <span className="text-white/15">·</span>
          <span>C{params.complexity}</span>
        </div>

        {/* SVG Preview */}
        <div className="relative w-52 h-52 mx-auto mb-6">
          <div
            className="absolute inset-[-8px] rounded-full animate-[pulse_4s_ease-in-out_infinite] opacity-25"
            style={{
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
              filter: 'blur(10px)',
            }}
          />
          {/* dangerouslySetInnerHTML is safe here:
              svgString is our own deterministic generated string
              No user input is injected into it — only analyzed emotion parameters */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden border border-white/10 bg-[#020208]"
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
        </div>

        {/* Download actions */}
        <div className="space-y-2.5 max-w-[220px] mx-auto mb-6">
          <button
            onClick={handleDownloadSvg}
            disabled={downloading}
            className={`flex items-center justify-center gap-2 w-full py-3 border rounded-xl font-semibold text-sm transition-all duration-200 ${
              downloaded
                ? 'border-green-500/40 text-green-400 bg-green-500/8'
                : 'border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10 hover:border-[#00D9FF]/55'
            } disabled:opacity-40`}
          >
            {downloaded ? '✓ Saved' : '💾 Download .svg'}
          </button>

          <button
            onClick={handleDownloadPng}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 text-white/50 rounded-xl text-sm hover:border-white/20 hover:text-white/70 transition-all duration-200 disabled:opacity-40"
          >
            🖼️ Download .png (share)
          </button>

          {'clipboard' in navigator && 'write' in navigator.clipboard && (
            <button
              onClick={handleCopyClipboard}
              disabled={downloading}
              className="flex items-center justify-center gap-2 w-full py-3 border border-white/10 text-white/40 rounded-xl text-sm hover:border-white/20 hover:text-white/60 transition-all duration-200 disabled:opacity-40"
            >
              📋 Copy to clipboard
            </button>
          )}

          <p className="text-center text-[10px] text-gray-700 pt-1">No data lives in this file — just light.</p>
        </div>

        {/* Session wipe */}
        <div className="text-center pt-2 pb-1">
          <button
            onClick={onSessionClose}
            className="text-[11px] text-gray-600 hover:text-white/40 underline underline-offset-4 transition-colors"
          >
            Close &amp; wipe session memory now
          </button>
        </div>
      </div>
    </div>
  )
}
