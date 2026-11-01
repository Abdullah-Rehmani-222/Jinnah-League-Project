import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import CmsSections from '../components/CmsSections'
import { fileUrl, usePage, usePublic } from '../lib/publicApi'

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

export default function GalleryPage() {
  const { data, loading, error } = usePublic('/gallery?limit=100')
  const { sections } = usePage('gallery')
  const items = data ?? []
  const [open, setOpen] = useState(null)

  const close = useCallback(() => setOpen(null), [])
  const move = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length])

  return (
    <>
      <HeroSection title="GALLERY" subtitle="CAPTURED MOMENTS" description="RELIVE THE BEST MOMENTS FROM JINNAH LEAGUE EVENTS" />

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && <p role="status" className="text-center text-sm text-gray-400">Loading photos…</p>}
          {error && <p role="alert" className="text-center text-sm text-gray-400">We could not load the gallery right now. Please try again later.</p>}
          {!loading && !error && items.length === 0 && (
            <div className="text-center text-gray-400">
              <ImageIcon size={40} className="mx-auto mb-3 text-gray-600" aria-hidden="true" />
              <p className="text-sm">Photos are coming soon.</p>
            </div>
          )}

          {items.length > 0 && (
            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
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
        </div>
      </section>

      <CmsSections sections={sections} />
      <AnimatePresence>{open !== null && items[open] && <Lightbox items={items} index={open} onClose={close} onMove={move} />}</AnimatePresence>
    </>
  )
}
