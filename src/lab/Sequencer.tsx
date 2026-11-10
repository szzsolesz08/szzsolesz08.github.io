import { useCallback, useEffect, useRef, useState } from 'react'
import { pulseCore } from '../lib/coreState'
import { useReducedMotion } from '../lib/motion'
import { Icon } from '../components/Icon'

const STEPS = 8
// A minor pentatonic, top row highest.
const NOTES = [
  { name: 'A4', hz: 440 },
  { name: 'G4', hz: 392 },
  { name: 'E4', hz: 329.63 },
  { name: 'D4', hz: 293.66 },
  { name: 'C4', hz: 261.63 },
  { name: 'A3', hz: 220 },
]
const BPM = 112
const STEP_SEC = 60 / BPM / 2

const START: boolean[][] = NOTES.map((_, r) =>
  Array.from({ length: STEPS }, (_, s) =>
    [
      [2, 6],
      [4],
      [1, 5],
      [3, 7],
      [0, 4],
      [0, 2, 4, 6],
    ][r]!.includes(s),
  ),
)

interface Engine {
  ctx: AudioContext
  out: GainNode
  analyser: AnalyserNode
}

export default function Sequencer() {
  const [grid, setGrid] = useState(START)
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(-1)
  const gridRef = useRef(grid)
  const engine = useRef<Engine | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    gridRef.current = grid
  }, [grid])

  const ensureEngine = useCallback(() => {
    if (engine.current) return engine.current
    const ctx = new AudioContext()
    const out = ctx.createGain()
    out.gain.value = 0.16
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 1024
    out.connect(analyser)
    analyser.connect(ctx.destination)
    engine.current = { ctx, out, analyser }
    return engine.current
  }, [])

  const voice = (e: Engine, hz: number, at: number) => {
    const osc = e.ctx.createOscillator()
    const sub = e.ctx.createOscillator()
    const filter = e.ctx.createBiquadFilter()
    const amp = e.ctx.createGain()
    osc.type = 'triangle'
    sub.type = 'sine'
    osc.frequency.value = hz
    sub.frequency.value = hz / 2
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3200, at)
    filter.frequency.exponentialRampToValueAtTime(500, at + 0.35)
    amp.gain.setValueAtTime(0.0001, at)
    amp.gain.exponentialRampToValueAtTime(0.9, at + 0.008)
    amp.gain.exponentialRampToValueAtTime(0.0001, at + 0.45)
    osc.connect(filter)
    sub.connect(filter)
    filter.connect(amp)
    amp.connect(e.out)
    osc.start(at)
    sub.start(at)
    osc.stop(at + 0.5)
    sub.stop(at + 0.5)
  }

  // Look-ahead scheduler: schedules audio slightly ahead, drives the playhead from audio time.
  useEffect(() => {
    if (!playing) return
    const e = ensureEngine()
    void e.ctx.resume()
    let next = e.ctx.currentTime + 0.06
    let s = 0
    const queue: { s: number; at: number }[] = []
    const timer = window.setInterval(() => {
      while (next < e.ctx.currentTime + 0.12) {
        const col = s % STEPS
        let hits = 0
        gridRef.current.forEach((row, r) => {
          if (row[col]) {
            voice(e, NOTES[r]!.hz, next)
            hits++
          }
        })
        queue.push({ s: col, at: next })
        if (hits && col % 4 === 0) pulseCore(0.15)
        next += STEP_SEC
        s++
      }
    }, 25)
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now = e.ctx.currentTime
      while (queue.length > 1 && queue[1]!.at <= now) queue.shift()
      if (queue[0] && queue[0].at <= now) setStep(queue[0].s)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.clearInterval(timer)
      cancelAnimationFrame(raf)
      setStep(-1)
    }
  }, [playing, ensureEngine])

  // Visualiser: a waveform wrapped round a small core.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c2d = canvas.getContext('2d')
    if (!c2d) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    const data = new Uint8Array(1024)
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== Math.floor(w * dpr)) {
        canvas.width = Math.floor(w * dpr)
        canvas.height = Math.floor(h * dpr)
      }
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      c2d.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      const base = Math.min(w, h) * 0.22
      const a = engine.current?.analyser
      let level = 0
      if (a && playing) {
        a.getByteTimeDomainData(data)
        for (let i = 0; i < data.length; i++) level = Math.max(level, Math.abs(data[i]! - 128) / 128)
      }
      // Ring
      c2d.beginPath()
      const N = 256
      for (let i = 0; i <= N; i++) {
        const t = i / N
        const v = a && playing ? (data[Math.floor(t * 1023)]! - 128) / 128 : 0
        const r = base * 1.5 + v * base * (reduced ? 0.3 : 0.9)
        const ang = t * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(ang) * r
        const y = cy + Math.sin(ang) * r
        if (i === 0) c2d.moveTo(x, y)
        else c2d.lineTo(x, y)
      }
      c2d.strokeStyle = 'rgba(255, 90, 68, 0.85)'
      c2d.lineWidth = 1.6
      c2d.stroke()
      // Core
      const g = c2d.createRadialGradient(cx - base * 0.25, cy - base * 0.25, 0, cx, cy, base * (1 + level * 0.4))
      g.addColorStop(0, '#ffb199')
      g.addColorStop(0.4, '#ff3b26')
      g.addColorStop(1, '#5c0507')
      c2d.fillStyle = g
      c2d.beginPath()
      c2d.arc(cx, cy, base * (1 + level * 0.25), 0, Math.PI * 2)
      c2d.fill()
      if (!playing) {
        cancelAnimationFrame(raf)
      }
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [playing, reduced])

  useEffect(
    () => () => {
      void engine.current?.ctx.close()
      engine.current = null
    },
    [],
  )

  const toggle = (r: number, s: number) => {
    setGrid((g) => g.map((row, ri) => (ri === r ? row.map((v, si) => (si === s ? !v : v)) : row)))
    const e = engine.current
    if (e && !grid[r]![s]) voice(e, NOTES[r]!.hz, e.ctx.currentTime + 0.01)
  }

  return (
    <div className="seq">
      <div className="seq__viz">
        <canvas ref={canvasRef} className="seq__canvas" aria-hidden="true" />
      </div>
      <div className="seq__panel">
        <div className="seq__grid" role="grid" aria-label="Step sequencer, 6 notes by 8 steps">
          {grid.map((row, r) => (
            <div key={r} role="row" className="seq__row">
              {row.map((on, s) => (
                <span key={s} role="gridcell">
                  <button
                    type="button"
                    className={`seq__cell${on ? ' is-on' : ''}${s === step ? ' is-now' : ''}`}
                    aria-pressed={on}
                    aria-label={`${NOTES[r]!.name}, step ${s + 1}`}
                    onClick={() => toggle(r, s)}
                  />
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="seq__controls">
          <button type="button" className={`btn${playing ? '' : ' btn--core'}`} onClick={() => setPlaying((p) => !p)}>
            <Icon name={playing ? 'stop' : 'play'} />
            {playing ? 'Stop' : 'Play'}
          </button>
          <button type="button" className="btn" onClick={() => setGrid(NOTES.map(() => Array(STEPS).fill(false)))}>
            Clear
          </button>
          <span className="seq__note">Sound on · {BPM} bpm</span>
        </div>
      </div>
    </div>
  )
}
