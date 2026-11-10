import { useEffect, useRef } from 'react'
import { SITE } from '../lib/site'
import { createSpring, isSettled, stepSpring } from '../lib/spring'
import { useReducedMotion } from '../lib/motion'

const CFG = { stiffness: 160, damping: 16 }
const MAX_TILT = 16

/**
 * A card lit by a point light that follows the pointer. Tilt runs on springs;
 * the specular highlight and the cast shadow are derived from the same light vector.
 */
export default function LightCard() {
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const stage = stageRef.current
    const card = cardRef.current
    if (!stage || !card) return
    const rx = createSpring(0)
    const ry = createSpring(0)
    const lx = createSpring(0.3)
    const ly = createSpring(0.25)
    let raf = 0
    let prev = performance.now()

    const apply = () => {
      card.style.setProperty('--rx', `${rx.value.toFixed(3)}deg`)
      card.style.setProperty('--ry', `${ry.value.toFixed(3)}deg`)
      card.style.setProperty('--lx', `${(lx.value * 100).toFixed(2)}%`)
      card.style.setProperty('--ly', `${(ly.value * 100).toFixed(2)}%`)
      // Shadow falls away from the light.
      card.style.setProperty('--sx', `${((0.5 - lx.value) * 60).toFixed(1)}px`)
      card.style.setProperty('--sy', `${((0.5 - ly.value) * 60 + 30).toFixed(1)}px`)
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      for (const s of [rx, ry, lx, ly]) {
        if (reduced) s.value = s.target
        else stepSpring(s, dt, CFG)
      }
      apply()
      if ([rx, ry, lx, ly].every((s) => isSettled(s, 0.0005))) {
        raf = 0
        return
      }
      raf = requestAnimationFrame(loop)
    }
    const kick = () => {
      if (!raf) {
        prev = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }

    const setFrom = (nx: number, ny: number) => {
      // nx, ny in 0..1 across the stage
      ry.target = (nx - 0.5) * 2 * MAX_TILT
      rx.target = -(ny - 0.5) * 2 * MAX_TILT
      lx.target = nx
      ly.target = ny
      kick()
    }

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      setFrom((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
    }
    const onLeave = () => {
      rx.target = 0
      ry.target = 0
      lx.target = 0.3
      ly.target = 0.25
      kick()
    }
    let kx = 0.5
    let ky = 0.5
    const onKey = (e: KeyboardEvent) => {
      const d = 0.08
      if (e.key === 'ArrowLeft') kx -= d
      else if (e.key === 'ArrowRight') kx += d
      else if (e.key === 'ArrowUp') ky -= d
      else if (e.key === 'ArrowDown') ky += d
      else if (e.key === 'Escape') {
        kx = 0.5
        ky = 0.5
        onLeave()
        return
      } else return
      e.preventDefault()
      kx = Math.min(1, Math.max(0, kx))
      ky = Math.min(1, Math.max(0, ky))
      setFrom(kx, ky)
    }

    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', onLeave)
    card.addEventListener('keydown', onKey)
    apply()
    return () => {
      cancelAnimationFrame(raf)
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', onLeave)
      card.removeEventListener('keydown', onKey)
    }
  }, [reduced])

  return (
    <div ref={stageRef} className="lightcard">
      <div
        ref={cardRef}
        className="lightcard__card"
        tabIndex={0}
        role="group"
        aria-label="Business card. Use the arrow keys to move the light; Escape resets it."
      >
        <div className="lightcard__face">
          <span className="lightcard__core" aria-hidden="true" />
          <div className="lightcard__id">
            <strong>{SITE.name}</strong>
            <span>{SITE.role}</span>
          </div>
          <span className="lightcard__mail">{SITE.email}</span>
          <span className="lightcard__glare" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
