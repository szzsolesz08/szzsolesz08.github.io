import { describe, expect, it } from 'vitest'
import { angleDelta, createSpring, isSettled, stepSpring } from './spring'
import { scrambleFrame } from './scramble'

describe('spring', () => {
  it('settles on its target', () => {
    const s = createSpring(0)
    s.target = 10
    for (let i = 0; i < 600; i++) stepSpring(s, 1 / 60, { stiffness: 170, damping: 26 })
    expect(s.value).toBeCloseTo(10, 3)
    expect(isSettled(s)).toBe(true)
  })

  it('stays stable with a huge frame', () => {
    const s = createSpring(0)
    s.target = 1
    stepSpring(s, 2, { stiffness: 400, damping: 30 })
    expect(Number.isFinite(s.value)).toBe(true)
    expect(Math.abs(s.value - 1)).toBeLessThan(0.05)
  })

  it('takes the short way round', () => {
    expect(angleDelta(0.1, Math.PI * 2 - 0.1)).toBeCloseTo(-0.2, 5)
    expect(angleDelta(Math.PI * 2 - 0.1, 0.1)).toBeCloseTo(0.2, 5)
  })
})

describe('scramble', () => {
  it('reveals the exact text at the end', () => {
    expect(scrambleFrame('ZSOLT SZABÓ', 1, 3)).toBe('ZSOLT SZABÓ')
  })
  it('hides everything at the start but keeps length', () => {
    const f = scrambleFrame('ABC DEF', 0, 1)
    expect(f.length).toBe(7)
    expect(f.replace(/\u00a0/g, '').trim()).toBe('')
  })
})
