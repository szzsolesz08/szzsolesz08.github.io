import { useLayoutEffect, useRef, useState } from 'react'
import { coreState, pulseCore } from '../lib/coreState'
import { useReducedMotion } from '../lib/motion'
import { gsap } from '../lib/scroll'
import { SITE } from '../lib/site'
import { Icon } from './Icon'
import './Contact.css'

export async function copyEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(SITE.email)
    return true
  } catch {
    return false
  }
}

export function Contact() {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle')

  useLayoutEffect(() => {
    if (reduced || !root.current) return
    const ctx = gsap.context(() => {
      gsap.to(coreState, {
        ret: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current!.querySelector('.contact__stage'),
          start: 'top bottom',
          end: 'top top',
          scrub: 0.6,
        },
      })
      gsap.fromTo(
        '.contact__title',
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 55%', toggleActions: 'play none none reverse' },
        },
      )
    }, root)
    return () => {
      ctx.revert()
      coreState.ret = 0
    }
  }, [reduced])

  const onCopy = async () => {
    const ok = await copyEmail()
    setCopied(ok ? 'done' : 'failed')
    if (ok) pulseCore(0.8)
    window.setTimeout(() => setCopied('idle'), 2600)
  }

  return (
    <section id="contact" ref={root} className="contact" aria-labelledby="contact-title">
      <div className="contact__stage">
        <div className="contact__top">
          <h2 id="contact-title" className="contact__title">
            Say hello.
          </h2>
          <p className="contact__lede">
            Building something that should feel alive? I&rsquo;d like to hear about it.
          </p>
        </div>

        {reduced && <div className="contact__still-core" aria-hidden="true" />}

        <div className="contact__bottom">
          <div className="contact__email">
            <a className="contact__address" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
            <button type="button" className="btn" onClick={onCopy}>
              <Icon name={copied === 'done' ? 'check' : 'copy'} />
              {copied === 'done' ? 'Copied' : 'Copy email'}
            </button>
          </div>
          <p className="contact__status" role="status">
            {copied === 'done' && 'Email copied to your clipboard. Talk soon.'}
            {copied === 'failed' && 'Your browser blocked the clipboard. The address is right there to select.'}
          </p>
          <ul className="contact__links">
            <li>
              <a className="btn" href={SITE.github} target="_blank" rel="noreferrer">
                <Icon name="github" />
                GitHub
              </a>
            </li>
            <li>
              <a className="btn" href={SITE.linkedin} target="_blank" rel="noreferrer">
                <Icon name="linkedin" />
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} {SITE.name}</p>
        <p>
          Built by hand with React, TypeScript and one shader.{' '}
          <a href={SITE.repo} target="_blank" rel="noreferrer">
            Read the source
          </a>
          .
        </p>
      </footer>
    </section>
  )
}
