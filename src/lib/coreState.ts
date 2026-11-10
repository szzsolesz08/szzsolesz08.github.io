/**
 * Shared, mutable state read by the WebGL render loop every frame.
 * Kept outside React on purpose: scroll and pointer updates must not re-render.
 */
export const coreState = {
  /** 0 = core in front of you, 1 = you are through it. */
  descent: 0,
  /** 0 = gone, 1 = the core has come back (contact section). */
  ret: 0,
  /** Pointer in aspect-corrected clip space, y up. */
  mouse: { x: 0, y: 0 },
  /** Smoothed pointer speed, 0..1. */
  energy: 0,
  /** Click / easter-egg pulse, decays to 0. */
  pulse: 0,
  /** Measured frames per second, written by the renderer. */
  fps: 0,
  /** Whether the WebGL renderer is running. */
  live: false,
}

export function pulseCore(amount = 1) {
  coreState.pulse = Math.min(1.5, coreState.pulse + amount)
}
