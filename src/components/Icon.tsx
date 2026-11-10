const paths = {
  github:
    'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
  linkedin:
    'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.82 2.67 4.82 6.14v5.42h-4v-4.8c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.54v4.89h-4v-11Z',
} as const

type Filled = keyof typeof paths
type Stroked = 'arrow' | 'copy' | 'check' | 'mail' | 'search' | 'play' | 'stop' | 'code' | 'down'

export function Icon({ name, title }: { name: Filled | Stroked; title?: string }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const }
  if (name in paths) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" {...a11y}>
        <path d={paths[name as Filled]} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...a11y}>
      {name === 'arrow' && <path d="M5 12h14M13 6l6 6-6 6" />}
      {name === 'down' && <path d="M12 5v14M6 13l6 6 6-6" />}
      {name === 'copy' && (
        <>
          <rect x="9" y="9" width="11" height="11" rx="2.5" />
          <path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" />
        </>
      )}
      {name === 'check' && <path d="M5 12.5l4.5 4.5L19 7.5" />}
      {name === 'mail' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M4 7l8 6 8-6" />
        </>
      )}
      {name === 'search' && (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-4.2-4.2" />
        </>
      )}
      {name === 'play' && <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" />}
      {name === 'stop' && <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor" />}
      {name === 'code' && <path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5" />}
    </svg>
  )
}
