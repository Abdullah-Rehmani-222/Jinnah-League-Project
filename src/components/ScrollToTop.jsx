import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Restores scroll position on navigation.
 * - New page: jump to the top instantly. (`html { scroll-behavior: smooth }`
 *   would otherwise animate the whole way up across the new page.)
 * - `#hash` link: scroll to that element, smoothly when staying on the same page.
 * - Unknown hash: fall back to the top instead of silently doing nothing.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    const samePage = prevPathname.current === pathname
    prevPathname.current = pathname

    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView({ behavior: samePage ? 'smooth' : 'instant', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
