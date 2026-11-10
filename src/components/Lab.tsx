import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import { sourceUrl } from '../lib/site'
import { Icon } from './Icon'
import '../lab/lab.css'

interface Specimen {
  id: string
  title: string
  body: string
  how: string
  file: string
  layout: 'wide' | 'split' | 'split-rev' | 'bare'
  Demo: LazyExoticComponent<ComponentType>
}

export const SPECIMENS: Specimen[] = [
  {
    id: 'filings',
    title: 'Iron filings',
    body: 'A field of needles, each on its own spring, turning to face whatever pulls them. Move your pointer through it, or tab in and steer the magnet with the arrow keys.',
    how: 'Canvas 2D, one damped spring per needle, shortest-path angle maths. It stops drawing when it scrolls out of view.',
    file: 'src/lab/IronFilings.tsx',
    layout: 'wide',
    Demo: lazy(() => import('../lab/IronFilings')),
  },
  {
    id: 'liquid',
    title: 'Liquid type',
    body: 'Every letter measures its distance to you and eases its own weight and width. One font file, two variable axes, no images.',
    how: 'Variable font axes (weight 220–900, width 75–125%) set per glyph each frame, with a slow wave when nobody is near.',
    file: 'src/lab/LiquidType.tsx',
    layout: 'bare',
    Demo: lazy(() => import('../lab/LiquidType')),
  },
  {
    id: 'light',
    title: 'Light card',
    body: 'A business card under a point light. The highlight and the shadow come from the same light vector, so they never disagree.',
    how: 'CSS 3D transforms on springs and custom properties for the light. Focus the card and use the arrow keys.',
    file: 'src/lab/LightCard.tsx',
    layout: 'split',
    Demo: lazy(() => import('../lab/LightCard')),
  },
  {
    id: 'sequencer',
    title: 'Six-note sequencer',
    body: 'Six notes, eight steps, one small instrument. Toggle the pads, press play, and watch the ring listen.',
    how: 'Web Audio oscillators fed by a look-ahead scheduler, so the beat never drifts with the frame rate.',
    file: 'src/lab/Sequencer.tsx',
    layout: 'split-rev',
    Demo: lazy(() => import('../lab/Sequencer')),
  },
  {
    id: 'springs',
    title: 'A list with weight',
    body: 'Drag to reorder. Every row is a spring, so the list settles like something real. It works fully from the keyboard and talks to screen readers.',
    how: 'Pointer capture, springs and an aria-live region. Space to pick up, arrows to move, Space to drop.',
    file: 'src/lab/SpringList.tsx',
    layout: 'split',
    Demo: lazy(() => import('../lab/SpringList')),
  },
]

export function Lab() {
  return (
    <section id="lab" className="lab" aria-labelledby="lab-title">
      <div className="wrap lab__intro">
        <h2 id="lab-title" className="section-title">
          The Lab
        </h2>
        <p className="lede">
          Small things I build to keep my hands sharp. Each one runs live on this page, and the source is one click away.
        </p>
      </div>

      <div className="lab__list">
        {SPECIMENS.map(({ id, title, body, how, file, layout, Demo }) => (
          <article key={id} id={`lab-${id}`} className={`specimen specimen--${layout}`} aria-labelledby={`lab-${id}-title`}>
            <header className="specimen__text">
              <h3 id={`lab-${id}-title`} className="specimen__title">
                {title}
              </h3>
              <p className="specimen__body">{body}</p>
              <p className="specimen__how">{how}</p>
              <a className="specimen__source" href={sourceUrl(file)} target="_blank" rel="noreferrer">
                <Icon name="code" />
                View source
                <span className="sr-only"> for {title} (opens GitHub)</span>
              </a>
            </header>
            <div className="specimen__stage">
              <Suspense fallback={<div className="specimen__loading" aria-hidden="true" />}>
                <Demo />
              </Suspense>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
