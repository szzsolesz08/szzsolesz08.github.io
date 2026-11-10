const GLYPHS = '▲◆●■◢◣◤◥/<>[]{}=+*#%01'

/**
 * Text at a given reveal progress (0..1). Characters left of the reveal front
 * are final; the next few flicker through glyphs; the rest are hidden.
 */
export function scrambleFrame(text: string, progress: number, seed: number, spread = 6): string {
  const front = progress * (text.length + spread)
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    if (ch === ' ') {
      out += ' '
      continue
    }
    if (i < front - spread) out += ch
    else if (i < front) out += GLYPHS[Math.abs(Math.floor(Math.sin((i + 1) * 97.13 + seed) * 1000)) % GLYPHS.length]
    else out += '\u00a0'
  }
  return out
}
