import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Filter, Image as ImageIcon, X } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import CmsSections from '../components/CmsSections'
import { fileUrl, publicApi, usePage } from '../lib/publicApi'
import { GALLERY_EDITIONS } from '../lib/galleryEditions'

function Lightbox({ items, index, onClose, onMove }) {
  const item = items[index]
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onMove(-1)
      if (e.key === 'ArrowRight') onMove(1)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onMove])

  return (
    <div role="dialog" aria-modal="true" aria-label={item.title || 'Gallery image'} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded p-2 text-gray-300 hover:text-white"><X size={24} /></button>
      {items.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onMove(-1) }} aria-label="Previous image" className="absolute left-2 rounded p-2 text-gray-300 hover:text-white sm:left-6"><ChevronLeft size={32} /></button>
          <button onClick={(e) => { e.stopPropagation(); onMove(1) }} aria-label="Next image" className="absolute right-2 rounded p-2 text-gray-300 hover:text-white sm:right-6"><ChevronRight size={32} /></button>
        </>
      )}
      <figure className="max-h-full max-w-5xl text-center" onClick={(e) => e.stopPropagation()}>
        <img src={fileUrl(item.mediaAsset)} alt={item.mediaAsset?.altText || item.title || ''} className="mx-auto max-h-[80vh] max-w-full rounded-lg object-contain" />
        {(item.title || item.description) && (
          <figcaption className="mt-3 text-sm text-gray-300">
            {item.title && <strong className="block font-heading tracking-wider text-white">{item.title}</strong>}
            {item.description}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

const PAGE_SIZE = 12
const ALL = 'ALL'

/** Loads gallery photos for one edition, a page at a time. Changing the edition restarts from page 1. */
function useGalleryFeed(edition) {
  const [state, setState] = useState({ items: [], total: 0, page: 0, loading: true, error: null })
  const reqId = useRef(0)

  const load = useCallback((page) => {
    const id = ++reqId.current
    setState((s) => ({ ...s, loading: true, error: null }))
    const filter = edition === ALL ? '' : `&edition=${encodeURIComponent(edition)}`
    publicApi
      .get(`/gallery?limit=${PAGE_SIZE}&page=${page}${filter}`)
      .then((r) => {
        if (id !== reqId.current) return // a newer request (e.g. another filter) superseded this one
        setState((s) => ({ items: page === 1 ? r.data : [...s.items, ...r.data], total: r.meta?.total ?? r.data.length, page, loading: false, error: null }))
      })
      .catch((error) => {
        if (id === reqId.current) setState((s) => ({ ...s, loading: false, error }))
      })
  }, [edition])

  useEffect(() => {
    setState({ items: [], total: 0, page: 0, loading: true, error: null })
    load(1)
    return () => { reqId.current += 1 }
  }, [load])

  return { ...state, loadMore: () => load(state.page + 1) }
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded px-4 py-2 text-xs font-heading font-semibold uppercase tracking-widest transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jl-purple ${
        active ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'border border-jl-card-border bg-jl-card text-gray-400 hover:border-jl-purple/40 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function GalleryPage() {
  const [edition, setEdition] = useState(ALL)
  const { items, total, loading, error, loadMore } = useGalleryFeed(edition)
  const { sections } = usePage('gallery')
  const [open, setOpen] = useState(null)

  const close = useCallback(() => setOpen(null), [])
  const move = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length])
  const firstLoad = loading && items.length === 0
  const canLoadMore = items.length < total

  return (
    <>
      <HeroSection title="GALLERY" subtitle="CAPTURED MOMENTS" description="RELIVE THE BEST MOMENTS FROM JINNAH LEAGUE EVENTS" />

      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-white">
              <Filter size={16} className="text-jl-purple" aria-hidden="true" /> FILTER GALLERY
            </h2>
            <p id="gallery-year-label" className="mb-2 text-[11px] font-heading uppercase tracking-widest text-gray-500">Year</p>
            <div role="group" aria-labelledby="gallery-year-label" className="flex flex-wrap gap-2">
              <FilterButton active={edition === ALL} onClick={() => setEdition(ALL)}>All years</FilterButton>
              {GALLERY_EDITIONS.map((e) => (
                <FilterButton key={e} active={edition === e} onClick={() => setEdition(e)}>{e}</FilterButton>
              ))}
            </div>
            {!error && !firstLoad && (
              <p role="status" aria-live="polite" className="mt-4 text-[11px] font-heading uppercase tracking-widest text-gray-500">
                Showing {items.length} of {total} {total === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>

          {firstLoad && <p role="status" className="text-center text-sm text-gray-400">Loading photos…</p>}
          {error && (
            <div role="alert" className="text-center text-sm text-gray-400">
              <p>We could not load the gallery right now.</p>
              <button type="button" onClick={loadMore} className="btn-outline mt-4 text-xs">TRY AGAIN</button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="text-center text-gray-400">
              <ImageIcon size={40} className="mx-auto mb-3 text-gray-600" aria-hidden="true" />
              <p className="text-sm">{edition === ALL ? 'Photos are coming soon.' : `No photos for ${edition} yet.`}</p>
            </div>
          )}

          {items.length > 0 && (
            <motion.ul key={edition} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item, i) => (
                <li key={item.id}>
                  <button
                    onClick={() => setOpen(i)}
                    className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-jl-card-border bg-jl-card transition-all duration-300 hover:border-jl-purple/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-jl-purple"
                    aria-label={`View ${item.title || 'image'} larger`}
                  >
                    <img src={fileUrl(item.mediaAsset)} alt={item.mediaAsset?.altText || item.title || ''} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {item.title && (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-left text-xs font-heading font-bold tracking-wider text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {item.title}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}

          {items.length > 0 && canLoadMore && (
            <div className="mt-10 text-center">
              <button type="button" onClick={loadMore} disabled={loading} className="btn-primary text-xs disabled:opacity-60">
                {loading ? 'LOADING…' : 'LOAD MORE PHOTOS'}
              </button>
            </div>
          )}
        </div>
      </section>

      <CmsSections sections={sections} />
      <AnimatePresence>{open !== null && items[open] && <Lightbox items={items} index={open} onClose={close} onMove={move} />}</AnimatePresence>
    </>
  )
}
