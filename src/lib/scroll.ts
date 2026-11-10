import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from './motion'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function startSmoothScroll() {
  if (reducedMotion() || lenis) return
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
}

function tick(time: number) {
  lenis?.raf(time * 1000)
}

export function stopSmoothScroll() {
  gsap.ticker.remove(tick)
  lenis?.destroy()
  lenis = null
}

export function scrollToId(id: string) {
  const el = id === 'top' ? document.body : document.getElementById(id)
  if (!el) return
  if (lenis) {
    lenis.scrollTo(id === 'top' ? 0 : el, { duration: 1.4 })
  } else {
    if (id === 'top') window.scrollTo({ top: 0 })
    else el.scrollIntoView({ block: 'start' })
  }
  // Move keyboard focus with the jump so screen readers and Tab follow.
  const focusTarget = id === 'top' ? document.getElementById('top') : el
  if (focusTarget) {
    if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1')
    focusTarget.focus({ preventScroll: true })
  }
}

export { gsap, ScrollTrigger }
