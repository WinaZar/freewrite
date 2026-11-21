// Pure session model. Vocabulary follows GLOSSARY.md.

export const PRESET_MINUTES = [5, 10, 15, 20] as const
export const EXTEND_MS = 5 * 60_000

export type State =
  | { kind: 'blank'; durationMs: number }
  | { kind: 'session'; durationMs: number; deadline: number }

export type Phase = 'blank' | 'countdown' | 'overtime'

export function blank(durationMs: number): State {
  return { kind: 'blank', durationMs }
}

export function start(state: State, now: number): State {
  if (state.kind !== 'blank') return state
  return { kind: 'session', durationMs: state.durationMs, deadline: now + state.durationMs }
}

// In countdown this pushes the deadline back; in overtime it starts a new countdown from now.
export function extend(state: State, now: number): State {
  if (state.kind !== 'session') return state
  return { ...state, deadline: Math.max(state.deadline, now) + EXTEND_MS }
}

export function burn(state: State): State {
  return blank(state.durationMs)
}

export function phase(state: State, now: number): Phase {
  if (state.kind === 'blank') return 'blank'
  return now < state.deadline ? 'countdown' : 'overtime'
}

export function shouldChime(previous: Phase, next: Phase): boolean {
  return previous === 'countdown' && next === 'overtime'
}

export function formatClock(state: State, now: number): string {
  if (state.kind === 'blank') return mmss(state.durationMs / 1000)
  const remaining = state.deadline - now
  if (remaining > 0) return mmss(Math.ceil(remaining / 1000))
  return '+' + mmss(Math.floor(-remaining / 1000))
}

function mmss(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
