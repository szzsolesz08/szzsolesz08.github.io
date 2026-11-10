import { useLayoutEffect, useRef } from 'react'
import { coreState, pulseCore } from '../lib/coreState'
import { useReducedMotion } from '../lib/motion'
import { gsap, scrollToId } from '../lib/scroll'
import { Icon } from './Icon'
import { ScrambleText } from './ScrambleText'
import './Hero.css'

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !root.current) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            coreState.descent = self.progress
          },
        },
      })
      tl.to('.hero__first', { xPercent: -60, opacity: 0, filter: 'blur(14px)', duration: 0.3 }, 0)
        .to('.hero__last', { xPercent: 60, opacity: 0, filter: 'blur(14px)', duration: 0.3 }, 0)
        .to('.hero__foot', { y: 40, opacity: 0, duration: 0.18 }, 0)
        .fromTo('.hero__whisper--1', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.1 }, 0.4)
        .to('.hero__whisper--1', { opacity: 0, scale: 1.08, filter: 'blur(8px)', duration: 0.1 }, 0.56)
        .fromTo('.hero__whisper--2', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.1 }, 0.64)
        .to('.hero__whisper--2', { opacity: 0, scale: 1.08, filter: 'blur(8px)', duration: 0.1 }, 0.84)
    }, root)
    return () => {
      ctx.revert()
      coreState.descent = 0
    }
  }, [reduced])

  return (
    <section id="top" ref={root} className={`hero${reduced ? ' hero--still' : ''}`} aria-labelledby="hero-title">
      <div className="hero__stage">
        <h1 id="hero-title" className="hero__name">
          <ScrambleText className="hero__first" text="Zsolt" delay={250} duration={1100} />
          <button
            type="button"
            className="hero__core-hit"
            aria-label="Touch the core"
            onClick={() => pulseCore(1)}
          />
          <ScrambleText className="hero__last" text="Szabó" delay={450} duration={1100} />
        </h1>

        <p className="hero__whisper hero__whisper--1" aria-hidden="true">
          You&rsquo;re inside now.
        </p>
        <p className="hero__whisper hero__whisper--2" aria-hidden="true">
          Let me show you how I build.
        </p>

        <div className="hero__foot">
          <p className="hero__tagline">
            Frontend developer.
            <br />I build interfaces that <em>feel alive</em>.
          </p>
          <button type="button" className="hero__scroll" onClick={() => scrollToId('manifesto')}>
            <span>{reduced ? 'Read on' : 'Scroll to go inside'}</span>
            <Icon name="down" />
          </button>
        </div>
      </div>
    </section>
  )
}
