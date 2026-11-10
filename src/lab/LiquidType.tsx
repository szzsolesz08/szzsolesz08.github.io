import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/motion'
import { useInView } from './useInView'

const TEXT = 'Type that breathes'

/**
 * Each letter reads its distance to the pointer and eases its own weight and width
 * along the variable font's axes. With no pointer, a slow wave runs through it.
 * With reduced motion the wave holds still and letters follow the pointer without easing.
 */
export default function LiquidType() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(wrapRef)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !inView) return
    const letters = Array.from(wrap.querySelectorAll<HTMLSpanElement>('.liquid__ch'))
    const wght = letters.map(() => 400)
    const wdth = letters.map(() => 100)
    const pointer = { x: 0, y: 0, active: false }
    // A frozen moment of the wave, used when motion is reduced.
    const stillT = 2.2

    let raf = 0
    let prev = performance.now()

    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const k = reduced ? 1 : 1 - Math.exp(-dt * 9)
      const t = reduced ? stillT : now / 1000
      const rects = letters.map((l) => l.getBoundingClientRect())
      const size = rects[0]?.height ?? 100

      letters.forEach((el, i) => {
        const r = rects[i]!
        let p: number
        if (pointer.active) {
          const cx = r.left + r.width / 2
          const cy = r.top + r.height / 2
          const d = Math.hypot(pointer.x - cx, (pointer.y - cy) * 1.6)
          p = Math.max(0, 1 - d / (size * 1.6))
          p = p * p * (3 - 2 * p)
        } else {
          p = 0.5 + 0.5 * Math.sin(t * 1.6 - i * 0.42)
          p = p * p * 0.85
        }
        const tw = 220 + p * 680
        const ts = 75 + p * 50
        wght[i] = wght[i]! + (tw - wght[i]!) * k
        wdth[i] = wdth[i]! + (ts - wdth[i]!) * k
        el.style.fontWeight = wght[i]!.toFixed(1)
        el.style.fontStretch = `${wdth[i]!.toFixed(2)}%`
        el.style.color = p > 0.6 ? `rgb(255 ${Math.round(220 - p * 150)} ${Math.round(200 - p * 150)})` : ''
      })

      if (!reduced) raf = requestAnimationFrame(frame)
    }
    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
      request()
    }
    const onLeave = () => {
      pointer.active = false
      request()
    }
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)
    request()

    return () => {
      cancelAnimationFrame(raf)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
      letters.forEach((el) => {
        el.style.fontWeight = ''
        el.style.fontStretch = ''
        el.style.color = ''
      })
    }
  }, [inView, reduced])

  return (
    <div ref={wrapRef} className="liquid">
      <p className="liquid__text" aria-label={TEXT}>
        {TEXT.split('').map((ch, i) => (
          <span key={i} className="liquid__ch" aria-hidden="true">
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </p>
    </div>
  )
}
