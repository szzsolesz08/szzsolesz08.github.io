import { SITE } from '../lib/site'
import { scrollToId } from '../lib/scroll'
import './Header.css'

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  return (
    <header className="site-header">
      <a
        className="site-header__mark"
        href="#top"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('top')
        }}
      >
        <span className="site-header__dot" aria-hidden="true" />
        <span>{SITE.name}</span>
      </a>
      <nav className="site-header__actions" aria-label="Site">
        <button type="button" className="site-header__menu" onClick={onOpenPalette} aria-haspopup="dialog">
          <span>Navigate</span>
          <span className="kbd">{isMac ? '⌘' : 'Ctrl'}</span>
          <span className="kbd">K</span>
        </button>
        <a
          className="btn btn--core site-header__cta"
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('contact')
          }}
        >
          Say hello
        </a>
      </nav>
    </header>
  )
}
