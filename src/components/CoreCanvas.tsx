import { useEffect, useRef, useState } from 'react'
import { coreState } from '../lib/coreState'
import { useReducedMotion } from '../lib/motion'
import { FRAG, VERT } from './core.frag'
import './CoreCanvas.css'

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)
  if (!sh) throw new Error('shader alloc failed')
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error(log ?? 'shader compile failed')
  }
  return sh
}

export function CoreCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' })
    if (!gl) {
      setFailed(true)
      return
    }

    let program: WebGLProgram
    try {
      program = gl.createProgram()!
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link failed')
    } catch (err) {
      console.warn('[core] falling back to static core:', err)
      setFailed(true)
      return
    }

    gl.useProgram(program)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const u = {
      res: gl.getUniformLocation(program, 'uRes'),
      time: gl.getUniformLocation(program, 'uTime'),
      mouse: gl.getUniformLocation(program, 'uMouse'),
      descent: gl.getUniformLocation(program, 'uDescent'),
      ret: gl.getUniformLocation(program, 'uReturn'),
      energy: gl.getUniformLocation(program, 'uEnergy'),
      pulse: gl.getUniformLocation(program, 'uPulse'),
    }

    let scale = 1
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Pointer: target position plus a smoothed speed that becomes "energy".
    const target = { x: 0, y: 0 }
    let lastMove = { x: 0, y: 0, t: performance.now() }
    let speed = 0
    const onMove = (e: PointerEvent) => {
      const h = window.innerHeight
      const x = (e.clientX - window.innerWidth / 2) / h
      const y = -(e.clientY - h / 2) / h
      const now = performance.now()
      const dt = Math.max(1, now - lastMove.t)
      const v = Math.hypot(x - lastMove.x, y - lastMove.y) / dt
      speed = Math.min(1, speed + v * 12)
      lastMove = { x, y, t: now }
      target.x = x
      target.y = y
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let raf = 0
    let running = true
    const start = performance.now()
    let prev = start
    let frames = 0
    let fpsClock = start
    const frozenTime = 12.0
    let quality = 1
    let slow = 0

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.1, (now - prev) / 1000)
      prev = now

      const s = coreState
      const k = 1 - Math.exp(-dt * 4)
      s.mouse.x += (target.x - s.mouse.x) * k
      s.mouse.y += (target.y - s.mouse.y) * k
      speed *= Math.exp(-dt * 2.5)
      s.energy += (speed - s.energy) * (1 - Math.exp(-dt * 6))
      s.pulse *= Math.exp(-dt * 1.8)

      // Render the tunnel at a lower resolution; it is all soft noise anyway.
      // `quality` drops on slow GPUs so the page stays smooth instead of pretty.
      const wantScale = Math.round((s.descent > 0.35 && s.descent < 0.95 ? 0.6 : 1) * quality * 100) / 100
      if (wantScale !== scale) {
        scale = wantScale
        resize()
      }

      gl.uniform2f(u.res, canvas.width, canvas.height)
      gl.uniform1f(u.time, reduced ? frozenTime : (now - start) / 1000)
      gl.uniform2f(u.mouse, reduced ? 0 : s.mouse.x, reduced ? 0 : s.mouse.y)
      gl.uniform1f(u.descent, reduced ? 0 : s.descent)
      gl.uniform1f(u.ret, reduced ? 0 : s.ret)
      gl.uniform1f(u.energy, reduced ? 0 : s.energy)
      gl.uniform1f(u.pulse, reduced ? 0 : s.pulse)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      frames++
      if (now - fpsClock >= 500) {
        s.fps = Math.round((frames * 1000) / (now - fpsClock))
        frames = 0
        fpsClock = now
        if (!reduced && now - start > 1500) {
          if (s.fps < 45) slow++
          else slow = 0
          if (slow >= 2 && quality > 0.45) {
            quality = Math.max(0.45, quality - 0.15)
            slow = 0
          }
        }
      }

      if (reduced) {
        // One still frame is enough; resume only on resize.
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        running = false
      } else if (!running || !raf) {
        running = true
        prev = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const onResizeStill = () => {
      if (reduced && !raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('resize', onResizeStill)

    coreState.live = true
    resize()
    raf = requestAnimationFrame(frame)

    return () => {
      coreState.live = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResizeStill)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteProgram(program)
      gl.deleteBuffer(buf)
    }
  }, [reduced])

  return (
    <div className={`core-layer${reduced ? ' core-layer--still' : ''}`} aria-hidden="true">
      {failed ? <div className="core-fallback" /> : <canvas ref={canvasRef} className="core-canvas" />}
    </div>
  )
}
