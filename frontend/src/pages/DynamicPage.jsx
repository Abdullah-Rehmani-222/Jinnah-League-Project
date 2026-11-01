import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import CmsSections from '../components/CmsSections'
import { usePage } from '../lib/publicApi'

/** Any page an administrator creates in the CMS (Pages module) is served at /#/<slug>. */
export default function DynamicPage() {
  const { slug } = useParams()
  const { page, sections, loading, missing, error } = usePage(slug)

  useEffect(() => {
    if (page?.metaTitle || page?.title) document.title = page.metaTitle || `${page.title} — Jinnah League`
  }, [page])

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center text-sm text-gray-400" role="status">Loading…</div>

  if (missing || error || !page)
    return (
      <HeroSection
        title="404"
        subtitle={missing ? 'PAGE NOT FOUND' : 'SOMETHING WENT WRONG'}
        description={missing ? "THE PAGE YOU'RE LOOKING FOR DOESN'T EXIST" : 'WE COULD NOT LOAD THIS PAGE. PLEASE TRY AGAIN LATER'}
        primaryBtn={<Link to="/" className="btn-primary">BACK HOME</Link>}
      />
    )

  return (
    <>
      <HeroSection title={page.title.toUpperCase()} description={page.description?.toUpperCase()} />
      <CmsSections sections={sections} />
    </>
  )
}
