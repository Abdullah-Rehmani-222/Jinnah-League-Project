import bg from '../assets/site-background.webp'

/**
 * Site-wide background. Rendered once in <Layout /> so it never remounts on
 * route changes. A fixed element is used instead of `background-attachment:
 * fixed`, which is unreliable on iOS Safari and many mobile browsers.
 */
export default function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-jl-darker bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Subtle scrim keeps text readable over the lighter cloud areas */}
      <div className="absolute inset-0 bg-black/25" />
    </div>
  )
}
