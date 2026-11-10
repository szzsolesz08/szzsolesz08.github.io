import { useEffect, useState } from 'react'
import { Built } from './components/Built'
import { CommandPalette } from './components/CommandPalette'
import { Contact } from './components/Contact'
import { CoreCanvas } from './components/CoreCanvas'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Lab } from './components/Lab'
import { Manifesto } from './components/Manifesto'
import { Toolkit } from './components/Toolkit'
import { pulseCore } from './lib/coreState'
import { useReducedMotion } from './lib/motion'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from './lib/scroll'
import { SITE } from './lib/site'

const SECRET = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [secret, setSecret] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    startSmoothScroll()
    ScrollTrigger.refresh()
    return () => stopSmoothScroll()
  }, [reduced])

  useEffect(() => {
    let i = 0
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const want = SECRET[i]
      if (e.key === want || e.key.toLowerCase() === want) {
        i++
        if (i === SECRET.length) {
          i = 0
          pulseCore(1.5)
          setSecret(true)
        }
      } else {
        i = e.key === SECRET[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!secret) return
    const id = window.setTimeout(() => setSecret(false), 9000)
    return () => window.clearTimeout(id)
  }, [secret])

  return (
    <>
      <a className="skip-link" href="#manifesto">
        Skip the intro
      </a>
      <CoreCanvas />
      <Header onOpenPalette={() => setPaletteOpen(true)} />
      <main>
        <Hero />
        <Manifesto />
        <Lab />
        <Built />
        <Toolkit />
        <Contact />
      </main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <div className={`secret${secret ? ' is-on' : ''}`} role="status" aria-live="polite">
        {secret && (
          <p>
            You looked closer than most people do. That&rsquo;s exactly who I like working with.{' '}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        )}
      </div>
    </>
  )
}
