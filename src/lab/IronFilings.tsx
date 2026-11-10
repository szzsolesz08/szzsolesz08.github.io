import { useEffect, useRef } from 'react'
import { angleDelta } from '../lib/spring'
import { useReducedMotion } from '../lib/motion'
import { useInView } from './useInView'

const SPACING = 26
const STIFFNESS = 140
const DAMPING = 11

/**
 * A field of needles that turn towards a magnet with spring physics.
 * The magnet is your pointer, the arrow keys, or an idle orbit.
 */
export default function IronFilings() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const inView = useInView(wrapRef)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas || !inView) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cols = 0
    let rows = 0
    let angle = new Float32Array(0)
    let vel = new Float32Array(0)
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const layout = () => {
      w = wrap.clientWidth
      h = wrap.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const nc = Math.ceil(w / SPACING)
      const nr = Math.ceil(h / SPACING)
      if (nc !== cols || nr !== rows) {
        cols = nc
        rows = nr
        angle = new Float32Array(cols * rows).map((_, i) => (i * 2.399) % (Math.PI * 2))
        vel = new Float32Array(cols * rows)
      }
    }
    layout()
    // Resizing a canvas wipes it, so a still (reduced-motion) field must repaint.
    const ro = new ResizeObserver(() => {
      layout()
      if (!raf) raf = requestAnimationFrame(draw)
    })
    ro.observe(wrap)

    const magnet = { x: w * 0.5, y: h * 0.5, active: false, keyX: w * 0.5, keyY: h * 0.5, keyed: false }

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      magnet.x = e.clientX - r.left
      magnet.y = e.clientY - r.top
      magnet.active = true
      magnet.keyed = false
    }
    const onLeave = () => {
      magnet.active = false
    }
    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 60 : 24
      const map: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }
      const d = map[e.key]
      if (!d) return
      e.preventDefault()
      if (!magnet.keyed) {
        magnet.keyX = magnet.x
        magnet.keyY = magnet.y
      }
      magnet.keyed = true
      magnet.keyX = Math.min(w, Math.max(0, magnet.keyX + d[0]))
      magnet.keyY = Math.min(h, Math.max(0, magnet.keyY + d[1]))
    }
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)
    wrap.addEventListener('keydown', onKey)

    let raf = 0
    let prev = performance.now()
    const t0 = prev

    const draw = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const t = (now - t0) / 1000

      let mx: number
      let my: number
      if (magnet.keyed) {
        mx = magnet.keyX
        my = magnet.keyY
      } else if (magnet.active) {
        mx = magnet.x
        my = magnet.y
      } else {
        // Idle orbit, a slow lissajous so the field is never dead.
        const tt = reduced ? 1.3 : t
        mx = w * (0.5 + 0.32 * Math.sin(tt * 0.45))
        my = h * (0.5 + 0.3 * Math.sin(tt * 0.7 + 1))
        magnet.x = mx
        magnet.y = my
      }

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      const maxD = Math.hypot(w, h) * 0.55

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c
          const x = c * SPACING + SPACING / 2
          const y = r * SPACING + SPACING / 2
          const dx = mx - x
          const dy = my - y
          const d = Math.hypot(dx, dy)
          const targetA = Math.atan2(dy, dx)
          if (reduced) {
            angle[i] = targetA
          } else {
            const force = STIFFNESS * angleDelta(angle[i]!, targetA) - DAMPING * vel[i]!
            vel[i] = vel[i]! + force * dt
            angle[i] = angle[i]! + vel[i]! * dt
          }
          const near = Math.max(0, 1 - d / maxD)
          const n3 = near * near * near
          const len = 4 + n3 * 13
          const a = angle[i]!
          const ca = Math.cos(a) * len
          const sa = Math.sin(a) * len
          ctx.strokeStyle =
            n3 > 0.25
              ? `rgba(255, ${Math.round(70 + 120 * (1 - n3))}, ${Math.round(48 + 80 * (1 - n3))}, ${0.5 + n3 * 0.5})`
              : `rgba(236, 232, 226, ${0.16 + near * 0.35})`
          ctx.lineWidth = 1.2 + n3 * 1.6
          ctx.beginPath()
          ctx.moveTo(x - ca, y - sa)
          ctx.lineTo(x + ca, y + sa)
          ctx.stroke()
        }
      }

      // The magnet itself.
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 22)
      g.addColorStop(0, 'rgba(255,170,140,1)')
      g.addColorStop(0.4, 'rgba(255,59,38,0.95)')
      g.addColorStop(1, 'rgba(255,59,38,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(mx, my, 22, 0, Math.PI * 2)
      ctx.fill()

      if (!reduced || magnet.active || magnet.keyed) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const kick = () => {
      if (reduced && !raf) raf = requestAnimationFrame(draw)
    }
    wrap.addEventListener('pointermove', kick)
    wrap.addEventListener('keydown', kick)

    return () => {
      cancelAnimationFrame(raf)
      raf = 0
      ro.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointermove', kick)
      wrap.removeEventListener('pointerleave', onLeave)
      wrap.removeEventListener('keydown', onKey)
      wrap.removeEventListener('keydown', kick)
    }
  }, [inView, reduced])

  return (
    <div
      ref={wrapRef}
      className="filings"
      tabIndex={0}
      role="application"
      aria-label="Iron filings field. Move your pointer, or use the arrow keys to move the magnet."
    >
      <canvas ref={canvasRef} className="filings__canvas" />
      <span className="filings__hint" aria-hidden="true">
        Move here · or focus and use arrow keys
      </span>
    </div>
  )
}
