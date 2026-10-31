import { motion } from 'framer-motion'
import { Image as ImageIcon } from 'lucide-react'
import HeroSection from '../components/HeroSection'

const galleryCategories = ['All', 'JL\'22', 'JL\'23', 'JL\'24', 'Events', 'Teams']

const galleryItems = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  category: ['JL\'22', 'JL\'23', 'JL\'24', 'Events', 'Teams'][i % 5],
  title: `Event Highlight ${i + 1}`,
}))

import { useState } from 'react'

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeFilter)

  return (
    <>
      <HeroSection
        title="GALLERY"
        subtitle="CAPTURED MOMENTS"
        description="RELIVE THE BEST MOMENTS FROM JINNAH LEAGUE EVENTS"
      />

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 text-xs font-heading font-semibold tracking-widest uppercase rounded transition-all duration-200 ${
                  activeFilter === cat
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                    : 'bg-jl-card border border-jl-card-border text-gray-400 hover:text-white hover:border-jl-purple/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="aspect-square bg-jl-card border border-jl-card-border rounded-lg overflow-hidden flex items-center justify-center group cursor-pointer hover:border-jl-purple/40 transition-all duration-300 relative"
              >
                <ImageIcon size={32} className="text-gray-700 group-hover:text-jl-purple transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div>
                    <p className="text-white text-xs font-heading font-bold tracking-wider">{item.title}</p>
                    <p className="text-gray-300 text-[10px] uppercase tracking-wider">{item.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
