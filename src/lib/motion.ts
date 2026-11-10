import { useSyncExternalStore } from 'react'

const query = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

let override: boolean | null = null
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
