import { useEffect, useRef, useState } from 'react'
import { scrambleFrame } from '../lib/scramble'
import { useReducedMotion } from '../lib/motion'

interface Props {
  text: string
  delay?: number
  duration?: number
  className?: string
}

/** Resolves text out of glyph noise once. The accessible name is always the real text. */
export function ScrambleText({ text, delay = 0, duration = 1200, className }: Props) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(reduced ? text : scrambleFrame(text, 0, 0))
  const seed = useRef(0)

  useEffect(() => {
    if (reduced) return
    let raf = 0
    seed.current = Math.random() * 100
    const t0 = performance.now() + delay
    const loop = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / duration))
      setShown(scrambleFrame(text, p, seed.current + Math.floor(now / 60)))
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [text, delay, duration, reduced])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{reduced ? text : shown}</span>
    </span>
  )
}
