import { Link } from 'react-router-dom'

/**
 * Renders CMS-provided links safely:
 *  - "#/jl26" or "/jl26"  -> in-site <Link>
 *  - "https://..."        -> external <a> opened in a new tab
 * Anything else (e.g. javascript:) is not rendered as a link.
 */
export default function SmartLink({ href, children, className, ...rest }) {
  if (!href) return null
  if (/^https?:\/\//i.test(href))
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>{children}</a>
  const to = href.startsWith('#/') ? href.slice(1) : href
  if (to.startsWith('/') && !to.startsWith('//')) return <Link to={to} className={className} {...rest}>{children}</Link>
  return null
}
