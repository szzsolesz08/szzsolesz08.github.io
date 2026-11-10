import { useLayoutEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/motion'
import { gsap } from '../lib/scroll'
import './Manifesto.css'

const LINES = [
  {
    big: 'Speed is a feature. Then it’s a feeling.',
    small: 'I measure before I optimise, and I build pages that are quick on a cheap phone, not only on my laptop.',
  },
  {
    big: 'Motion should explain, not decorate.',
    small: 'Every transition answers a question: where did that come from, and where did it go?',
  },
  {
    big: 'Accessible is the baseline, not the extra.',
    small: 'Keyboard, screen reader, reduced motion. Try any of them on this page.',
  },
  {
    big: 'The details nobody notices are the ones everyone feels.',
    small: 'Focus rings, selection colour, scrollbars, empty states. I design the parts nobody asked for.',
  },
]

export function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    if (reduced || !root.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.manifesto__item').forEach((item) => {
        const words = item.querySelectorAll('.manifesto__word')
        gsap.fromTo(
          words,
          { opacity: 0.12 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: { trigger: item, start: 'top 85%', end: 'top 35%', scrub: true },
          },
        )
        gsap.fromTo(
          item.querySelector('.manifesto__small'),
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: { trigger: item, start: 'top 45%', toggleActions: 'play none none reverse' },
          },
        )
      })
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="manifesto" ref={root} className="manifesto" aria-labelledby="manifesto-title">
      <div className="wrap">
        <h2 id="manifesto-title" className="sr-only">
          How I work
        </h2>
        <ol className="manifesto__list">
          {LINES.map((line) => (
            <li key={line.big} className="manifesto__item">
              <p className="manifesto__big">
                {line.big.split(' ').map((w, i) => (
                  <span key={i} className="manifesto__word">
                    {w}{' '}
                  </span>
                ))}
              </p>
              <p className="manifesto__small">{line.small}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
