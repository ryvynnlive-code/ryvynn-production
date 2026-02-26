"use client"

export type AudioProfile = {
  bpm: number
  lowFreqHz: number
  highFreqHz: number
}

let activeCtx: AudioContext | null = null
let activeOsc: OscillatorNode | null = null
let activeGain: GainNode | null = null

export function playRegulationAudio(profile: AudioProfile) {
  // Stop any previously playing audio first
  stopRegulationAudio()

  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()

  // Add a subtle high shelf for warmth — not "healing", just less clinical
  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = profile.highFreqHz

  osc.type = "sine"
  osc.frequency.value = profile.lowFreqHz

  // Gentle volume — never overwhelming
  gainNode.gain.value = 0.04

  osc.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.start()

  // Soft fade-in over 3 seconds
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 3)

  // Soft fade-out after 60 seconds
  gainNode.gain.setValueAtTime(0.04, ctx.currentTime + 57)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 60)
  osc.stop(ctx.currentTime + 61)

  activeCtx = ctx
  activeOsc = osc
  activeGain = gainNode

  return {
    stop: stopRegulationAudio,
    ctx,
  }
}

export function stopRegulationAudio() {
  try {
    if (activeGain && activeCtx) {
      activeGain.gain.setValueAtTime(activeGain.gain.value, activeCtx.currentTime)
      activeGain.gain.exponentialRampToValueAtTime(0.0001, activeCtx.currentTime + 1.5)
    }
    if (activeOsc && activeCtx) {
      activeOsc.stop(activeCtx.currentTime + 1.5)
    }
    setTimeout(() => {
      activeCtx?.close()
      activeCtx = null
      activeOsc = null
      activeGain = null
    }, 2000)
  } catch {
    // Already stopped — no-op
  }
}

export function isAudioPlaying(): boolean {
  return activeCtx !== null && activeCtx.state === "running"
}
