import { describe, expect, it } from 'vitest'
import {
  EXTEND_MS,
  blank,
  burn,
  extend,
  formatClock,
  phase,
  shouldChime,
  start,
} from './session'

const MIN = 60_000
const T0 = 1_000_000

describe('blank page', () => {
  it('is in the blank phase and shows the selected duration', () => {
    const state = blank(10 * MIN)
    expect(phase(state, T0)).toBe('blank')
    expect(formatClock(state, T0)).toBe('10:00')
  })

  it('ignores extend', () => {
    const state = blank(10 * MIN)
    expect(extend(state, T0)).toEqual(state)
  })
})

describe('start', () => {
  it('begins a countdown of the selected duration', () => {
    const state = start(blank(5 * MIN), T0)
    expect(phase(state, T0)).toBe('countdown')
    expect(formatClock(state, T0)).toBe('05:00')
  })

  it('does nothing when a session is already running', () => {
    const running = start(blank(5 * MIN), T0)
    expect(start(running, T0 + MIN)).toEqual(running)
  })
})

describe('countdown', () => {
  const state = start(blank(10 * MIN), T0)

  it('rounds the remaining time up to whole seconds', () => {
    expect(formatClock(state, T0 + 1)).toBe('10:00')
    expect(formatClock(state, T0 + 2 * MIN + 18_000)).toBe('07:42')
    expect(formatClock(state, T0 + 10 * MIN - 1)).toBe('00:01')
  })

  it('switches to overtime exactly at the deadline', () => {
    expect(phase(state, T0 + 10 * MIN - 1)).toBe('countdown')
    expect(phase(state, T0 + 10 * MIN)).toBe('overtime')
  })
})

describe('overtime', () => {
  const state = start(blank(5 * MIN), T0)
  const deadline = T0 + 5 * MIN

  it('counts up from the deadline', () => {
    expect(formatClock(state, deadline)).toBe('+00:00')
    expect(formatClock(state, deadline + 12_500)).toBe('+00:12')
    expect(formatClock(state, deadline + 61 * MIN)).toBe('+61:00')
  })
})

describe('extend', () => {
  it('adds five minutes to a running countdown', () => {
    const state = extend(start(blank(5 * MIN), T0), T0 + MIN)
    expect(formatClock(state, T0 + MIN)).toBe('09:00')
  })

  it('starts a new five-minute countdown from overtime', () => {
    const overtimeAt = T0 + 5 * MIN + 30_000
    const state = extend(start(blank(5 * MIN), T0), overtimeAt)
    expect(phase(state, overtimeAt)).toBe('countdown')
    expect(formatClock(state, overtimeAt)).toBe('05:00')
    expect(phase(state, overtimeAt + EXTEND_MS)).toBe('overtime')
  })
})

describe('burn', () => {
  it('returns to a blank page with the same duration', () => {
    const state = burn(start(blank(15 * MIN), T0))
    expect(state).toEqual(blank(15 * MIN))
  })

  it('keeps the original duration even after extending', () => {
    const extended = extend(start(blank(15 * MIN), T0), T0)
    expect(burn(extended)).toEqual(blank(15 * MIN))
  })
})

describe('shouldChime', () => {
  it('chimes only when a countdown turns into overtime', () => {
    expect(shouldChime('countdown', 'overtime')).toBe(true)
    expect(shouldChime('countdown', 'countdown')).toBe(false)
    expect(shouldChime('overtime', 'overtime')).toBe(false)
    expect(shouldChime('overtime', 'countdown')).toBe(false)
    expect(shouldChime('blank', 'countdown')).toBe(false)
  })
})
