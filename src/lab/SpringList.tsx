import { useEffect, useRef, useState } from 'react'
import { createSpring, isSettled, stepSpring, type Spring } from '../lib/spring'
import { useReducedMotion } from '../lib/motion'

const ITEMS = ['Make it work', 'Make it right', 'Make it fast', 'Make it accessible', 'Make it feel alive']
const START = [2, 4, 0, 3, 1].map((i) => ITEMS[i]!)
const SLOT = 68
const CFG = { stiffness: 420, damping: 30 }

/**
 * Drag to reorder, with every row on its own spring.
 * Keyboard: Space picks a row up, arrows move it, Space drops, Escape cancels.
 */
export default function SpringList() {
  const [order, setOrder] = useState(START)
  const [grabbed, setGrabbed] = useState<string | null>(null)
  const [announce, setAnnounce] = useState('')
  const orderRef = useRef(order)
  const rows = useRef(new Map<string, HTMLElement>())
  const springs = useRef(new Map<string, Spring>(ITEMS.map((it) => [it, createSpring(START.indexOf(it) * SLOT)])))
  const scale = useRef(new Map<string, Spring>(ITEMS.map((it) => [it, createSpring(1)])))
  const drag = useRef<{ id: string; offset: number; y: number; pointer: number } | null>(null)
  const keyStart = useRef<string[] | null>(null)
  const raf = useRef(0)
  const reduced = useReducedMotion()
  const reducedRef = useRef(reduced)

  useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  const run = () => {
    if (raf.current) return
    let prev = -1
    const loop = (now: number) => {
      if (prev < 0) prev = now
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      let busy = false
      for (const id of ITEMS) {
        const s = springs.current.get(id)!
        const sc = scale.current.get(id)!
        const d = drag.current
        if (d && d.id === id) {
          s.value = d.y
          s.velocity = 0
        } else if (reducedRef.current) {
          s.value = s.target
        } else {
          stepSpring(s, dt, CFG)
        }
        if (reducedRef.current) sc.value = sc.target
        else stepSpring(sc, dt, { stiffness: 300, damping: 22 })
        const el = rows.current.get(id)
        if (el) el.style.transform = `translate3d(0, ${s.value.toFixed(2)}px, 0) scale(${sc.value.toFixed(4)})`
        if ((d && d.id === id) || !isSettled(s, 0.05) || !isSettled(sc, 0.0005)) busy = true
      }
      raf.current = busy ? requestAnimationFrame(loop) : 0
    }
    raf.current = requestAnimationFrame(loop)
  }

  const commit = (next: string[]) => {
    orderRef.current = next
    setOrder(next)
    next.forEach((id, i) => {
      springs.current.get(id)!.target = i * SLOT
    })
    run()
  }

  useEffect(() => {
    run()
    const r = raf
    return () => {
      cancelAnimationFrame(r.current)
      r.current = 0
    }
  }, [])

  const lift = (id: string, on: boolean) => {
    scale.current.get(id)!.target = on ? 1.035 : 1
    run()
  }

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    const s = springs.current.get(id)!
    drag.current = { id, offset: e.clientY, y: s.value, pointer: s.value }
    setGrabbed(id)
    lift(id, true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    d.y = d.pointer + (e.clientY - d.offset)
    const cur = orderRef.current
    const from = cur.indexOf(d.id)
    const to = Math.max(0, Math.min(cur.length - 1, Math.round(d.y / SLOT)))
    if (to !== from) {
      const next = [...cur]
      next.splice(from, 1)
      next.splice(to, 0, d.id)
      commit(next)
    }
    run()
  }

  const onPointerUp = () => {
    const d = drag.current
    if (!d) return
    drag.current = null
    const s = springs.current.get(d.id)!
    s.target = orderRef.current.indexOf(d.id) * SLOT
    setGrabbed(null)
    lift(d.id, false)
    setAnnounce(`${d.id}, dropped at position ${orderRef.current.indexOf(d.id) + 1} of ${ITEMS.length}.`)
  }

  const onKeyDown = (e: React.KeyboardEvent, id: string) => {
    const cur = orderRef.current
    const i = cur.indexOf(id)
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (grabbed === id) {
        setGrabbed(null)
        lift(id, false)
        keyStart.current = null
        setAnnounce(`${id}, dropped at position ${i + 1} of ${ITEMS.length}.`)
      } else {
        setGrabbed(id)
        lift(id, true)
        keyStart.current = cur
        setAnnounce(`${id}, picked up. Position ${i + 1} of ${ITEMS.length}. Use the arrow keys to move, Space to drop.`)
      }
    } else if (grabbed === id && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      const to = e.key === 'ArrowUp' ? i - 1 : i + 1
      if (to < 0 || to >= cur.length) return
      const next = [...cur]
      next.splice(i, 1)
      next.splice(to, 0, id)
      commit(next)
      setAnnounce(`${id}, position ${to + 1} of ${ITEMS.length}.`)
      requestAnimationFrame(() => rows.current.get(id)?.focus())
    } else if (grabbed === id && e.key === 'Escape') {
      e.preventDefault()
      const original = keyStart.current ?? cur
      commit(original)
      keyStart.current = null
      setGrabbed(null)
      lift(id, false)
      setAnnounce(`Move cancelled. ${id} is back at position ${original.indexOf(id) + 1}.`)
      requestAnimationFrame(() => rows.current.get(id)?.focus())
    }
  }

  return (
    <div className="springs">
      <p id="springs-help" className="springs__help">
        Put them in the order you&rsquo;d ship them.
      </p>
      <ul className="springs__list" style={{ height: ITEMS.length * SLOT }} aria-describedby="springs-help">
        {ITEMS.map((id) => {
          const pos = order.indexOf(id)
          return (
            <li
              key={id}
              ref={(el) => {
                if (el) rows.current.set(id, el)
              }}
              className={`springs__row${grabbed === id ? ' is-grabbed' : ''}`}
              tabIndex={0}
              aria-roledescription="sortable item"
              aria-label={`${id}, position ${pos + 1} of ${ITEMS.length}. Press Space to pick up.`}
              onPointerDown={(e) => onPointerDown(e, id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={(e) => onKeyDown(e, id)}
            >
              <span className="springs__pos mono" aria-hidden="true">
                {pos + 1}
              </span>
              <span className="springs__label">{id}</span>
              <span className="springs__grip" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </li>
          )
        })}
      </ul>
      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>
    </div>
  )
}
