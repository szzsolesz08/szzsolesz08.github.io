import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { pulseCore } from '../lib/coreState'
import { setReducedMotion, useReducedMotion } from '../lib/motion'
import { scrollToId } from '../lib/scroll'
import { SECTIONS, SITE } from '../lib/site'
import { copyEmail } from './Contact'
import { SPECIMENS } from './Lab'
import { Icon } from './Icon'
import './CommandPalette.css'

interface Command {
  id: string
  label: string
  group: 'Go to' | 'Lab' | 'Actions' | 'Elsewhere'
  hint?: string
  run: () => void | Promise<void>
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [toast, setToast] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const reduced = useReducedMotion()
  const listId = useId()

  const commands = useMemo<Command[]>(
    () => [
      ...SECTIONS.map((s) => ({ id: `go-${s.id}`, label: s.label, group: 'Go to' as const, run: () => scrollToId(s.id) })),
      ...SPECIMENS.map((s) => ({
        id: `lab-${s.id}`,
        label: s.title,
        group: 'Lab' as const,
        run: () => scrollToId(`lab-${s.id}`),
      })),
      {
        id: 'copy',
        label: 'Copy email address',
        group: 'Actions',
        hint: SITE.email,
        run: async () => {
          const ok = await copyEmail()
          setToast(ok ? 'Email copied.' : 'Clipboard blocked by the browser.')
        },
      },
      {
        id: 'motion',
        label: reduced ? 'Turn motion back on' : 'Reduce motion',
        group: 'Actions',
        run: () => setReducedMotion(!reduced),
      },
      { id: 'pulse', label: 'Wake the core', group: 'Actions', run: () => pulseCore(1.4) },
      { id: 'github', label: 'Open GitHub', group: 'Elsewhere', run: () => void window.open(SITE.github, '_blank', 'noopener') },
      {
        id: 'linkedin',
        label: 'Open LinkedIn',
        group: 'Elsewhere',
        run: () => void window.open(SITE.linkedin, '_blank', 'noopener'),
      },
      { id: 'source', label: 'View this site’s source', group: 'Elsewhere', run: () => void window.open(SITE.repo, '_blank', 'noopener') },
    ],
    [reduced],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => `${c.label} ${c.group} ${c.hint ?? ''}`.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null
      dialog.showModal()
      setQuery('')
      setActive(0)
      setToast('')
      requestAnimationFrame(() => inputRef.current?.focus())
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const run = async (c: Command | undefined) => {
    if (!c) return
    await c.run()
    if (c.id === 'copy') {
      window.setTimeout(onClose, 700)
      return
    }
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (results.length ? (a + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      void run(results[active])
    }
  }

  let lastGroup = ''
  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Command palette"
      onClose={() => {
        onClose()
        const target = returnFocus.current
        if (target && document.contains(target) && !target.closest('section[tabindex="-1"]')) target.focus()
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="palette__box">
        <div className="palette__search">
          <Icon name="search" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Where to?"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
            aria-autocomplete="list"
            spellCheck={false}
          />
          <span className="kbd">Esc</span>
        </div>
        <ul id={listId} className="palette__list" role="listbox" aria-label="Commands">
          {results.length === 0 && (
            <li className="palette__empty" role="presentation">
              Nothing matches &ldquo;{query}&rdquo;. Try &ldquo;lab&rdquo;, &ldquo;email&rdquo; or &ldquo;motion&rdquo;.
            </li>
          )}
          {results.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null
            lastGroup = c.group
            return (
              <li key={c.id} role="presentation">
                {header && (
                  <div className="palette__group" aria-hidden="true">
                    {header}
                  </div>
                )}
                <div
                  id={`cmd-${c.id}`}
                  role="option"
                  aria-selected={i === active}
                  className={`palette__item${i === active ? ' is-active' : ''}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => void run(c)}
                >
                  <span>{c.label}</span>
                  {c.hint && <span className="palette__hint">{c.hint}</span>}
                  {i === active && <Icon name="arrow" />}
                </div>
              </li>
            )
          })}
        </ul>
        <p className="palette__foot" role="status">
          {toast || (
            <>
              <span className="kbd">↑</span>
              <span className="kbd">↓</span> to move · <span className="kbd">Enter</span> to go
            </>
          )}
        </p>
      </div>
    </dialog>
  )
}
