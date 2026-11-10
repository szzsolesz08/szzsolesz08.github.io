import { useSyncExternalStore } from 'react'

const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

const KEY = 'motion-override'

// The visitor's own choice from the palette outlives a reload; the OS setting stays the default.
function loadOverride(): boolean | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'reduce' ? true : v === 'full' ? false : null
  } catch {
    return null
  }
}

let override: boolean | null = typeof window !== 'undefined' ? loadOverride() : null
const listeners = new Set<() => void>()

function read(): boolean {
  if (override !== null) return override
  return query?.matches ?? false
}

query?.addEventListener('change', () => listeners.forEach((l) => l()))

export function reducedMotion(): boolean {
  return read()
}

export function setReducedMotion(value: boolean | null) {
  override = value
  try {
    if (value === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, value ? 'reduce' : 'full')
  } catch {
    /* storage blocked; the choice lasts for this visit */
  }
  listeners.forEach((l) => l())
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => false,
  )
}
