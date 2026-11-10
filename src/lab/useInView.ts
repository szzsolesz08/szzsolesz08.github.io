import { useEffect, useState, type RefObject } from 'react'

/** True while the element is near the viewport. Used to pause offscreen experiments. */
export function useInView(ref: RefObject<Element | null>, rootMargin = '200px') {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, rootMargin])
  return inView
}
