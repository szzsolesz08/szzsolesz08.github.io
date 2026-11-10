export interface Spring {
  value: number
  velocity: number
  target: number
}

export interface SpringConfig {
  /** Stiffness (k). */
  stiffness: number
  /** Damping (c). */
  damping: number
  mass?: number
}

export const createSpring = (value = 0): Spring => ({ value, velocity: 0, target: value })

/**
 * Semi-implicit Euler step of a damped harmonic oscillator.
 * dt is in seconds and is sub-stepped so large frames stay stable.
 */
export function stepSpring(s: Spring, dt: number, { stiffness, damping, mass = 1 }: SpringConfig): Spring {
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)))
  const h = dt / steps
  for (let i = 0; i < steps; i++) {
    const force = -stiffness * (s.value - s.target) - damping * s.velocity
    s.velocity += (force / mass) * h
    s.value += s.velocity * h
  }
  return s
}

export const isSettled = (s: Spring, epsilon = 0.001) =>
  Math.abs(s.value - s.target) < epsilon && Math.abs(s.velocity) < epsilon

/** Shortest signed angular difference, radians. */
export function angleDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}
