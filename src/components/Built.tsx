import { useEffect, useRef, useState } from 'react'
import { coreState } from '../lib/coreState'
import { useInView } from '../lab/useInView'
import './Built.css'

interface Metrics {
  fps: number | null
  fcp: number | null
  lcp: number | null
  transfer: number | null
  js: number | null
  nodes: number | null
}

const kb = (b: number) => (b / 1024).toFixed(0)

function measureTransfer() {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  const res = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  let total = nav?.transferSize ?? 0
  let js = 0
  for (const r of res) {
    total += r.transferSize
    if (r.initiatorType === 'script' || r.name.endsWith('.js')) js += r.transferSize
  }
  // transferSize is 0 when everything came from cache; fall back to encoded size.
  if (total === 0) {
    total = (nav?.encodedBodySize ?? 0) + res.reduce((s, r) => s + r.encodedBodySize, 0)
    js = res.filter((r) => r.name.endsWith('.js')).reduce((s, r) => s + r.encodedBodySize, 0)
  }
  return { total, js }
}

const FACTS = [
  ['Graphics', 'One hand-written WebGL2 fragment shader. No 3D library.'],
  ['Framework', 'React 19 and TypeScript in strict mode, built with Vite.'],
  ['Motion', 'GSAP ScrollTrigger for the choreography, Lenis for scrolling.'],
  ['Respect', 'Honours reduced motion: the core holds still and the descent is skipped.'],
  ['Keyboard', 'Every experiment works without a mouse. Press Ctrl K anywhere.'],
  ['Shipping', 'Linted, tested and deployed by GitHub Actions on every push.'],
] as const

export function Built() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, '0px')
  const [m, setM] = useState<Metrics>({ fps: null, fcp: null, lcp: null, transfer: null, js: null, nodes: null })
  const lcpRef = useRef<number | null>(null)

  useEffect(() => {
    let po: PerformanceObserver | null = null
    // LCP is only meaningful up to the first interaction; later reveals are not "loading".
    const stop = () => {
      po?.disconnect()
      po = null
    }
    try {
      po = new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1)
        if (last) lcpRef.current = last.startTime
      })
      po.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {
      /* not supported in this browser */
    }
    const opts = { once: true, passive: true, capture: true } as const
    window.addEventListener('scroll', stop, opts)
    window.addEventListener('pointerdown', stop, opts)
    window.addEventListener('keydown', stop, opts)
    return () => {
      stop()
      window.removeEventListener('scroll', stop, opts)
      window.removeEventListener('pointerdown', stop, opts)
      window.removeEventListener('keydown', stop, opts)
    }
  }, [])

  useEffect(() => {
    if (!inView) return
    const read = () => {
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null
      const { total, js } = measureTransfer()
      setM({
        fps: coreState.live ? coreState.fps : null,
        fcp,
        lcp: lcpRef.current,
        transfer: total || null,
        js: js || null,
        nodes: document.getElementsByTagName('*').length,
      })
    }
    read()
    const id = window.setInterval(read, 1000)
    return () => window.clearInterval(id)
  }, [inView])

  const cells: { label: string; value: string; unit: string }[] = [
    { label: 'Shader frame rate', value: m.fps ? String(m.fps) : '—', unit: 'fps' },
    { label: 'First paint', value: m.fcp ? String(Math.round(m.fcp)) : '—', unit: 'ms' },
    { label: 'Largest paint', value: m.lcp ? String(Math.round(m.lcp)) : '—', unit: 'ms' },
    { label: 'Downloaded so far', value: m.transfer ? kb(m.transfer) : '—', unit: 'KB' },
    { label: 'Of which JavaScript', value: m.js ? kb(m.js) : '—', unit: 'KB' },
    { label: 'Elements on the page', value: m.nodes ? String(m.nodes) : '—', unit: '' },
  ]

  return (
    <section id="built" ref={ref} className="built" aria-labelledby="built-title">
      <div className="wrap built__grid">
        <div className="built__head">
          <h2 id="built-title" className="section-title">
            How this site was built
          </h2>
          <p className="lede">
            No template, no page builder. These numbers are measured in your browser, right now, while you read.
          </p>
        </div>

        <dl className="built__metrics">
          {cells.map((c) => (
            <div key={c.label} className="built__metric">
              <dt>{c.label}</dt>
              <dd>
                <span className="built__value">{c.value}</span>
                {c.unit && <span className="built__unit">{c.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <dl className="built__facts">
          {FACTS.map(([k, v]) => (
            <div key={k} className="built__fact">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
