// A soft synthesized tone, so no audio assets are needed.
let ctx: AudioContext | undefined

// WebKit only lets audio start after a user gesture, so call this from one (the first keystroke).
export function unlockAudio(): void {
  ctx ??= new AudioContext()
  void ctx.resume()
}

export function chime(): void {
  if (!ctx) return
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 660
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.15, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 1.8)
}
