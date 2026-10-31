import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Newspaper, Download, ExternalLink } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'

const pressItems = [
  { title: "Jinnah League '24 Sets New Records", source: 'Tech Tribune Pakistan', date: 'March 2024', excerpt: 'The third edition of Jinnah League attracted over 1,100 participants from 30+ universities across Pakistan.' },
  { title: 'ACM MAJU Chapter Leads Innovation', source: 'University Herald', date: 'January 2024', excerpt: 'How a student chapter is reshaping the inter-university competition landscape in Pakistan.' },
  { title: "From Campus to National Stage", source: 'Digital Pakistan', date: 'November 2023', excerpt: 'The story of Jinnah League\'s rapid growth from a university event to a national tech festival.' },
  { title: 'Gaming Meets Technology at JL', source: 'GamerzPak', date: 'August 2023', excerpt: 'Jinnah League bridges the gap between competitive gaming and tech innovation.' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function MediaPage() {
  return (
    <>
      <HeroSection
        title="MEDIA & PRESS"
        subtitle="IN THE SPOTLIGHT"
        description="NEWS, COVERAGE, AND MEDIA RESOURCES"
      />

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>PRESS COVERAGE</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 space-y-5"
          >
            {pressItems.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="bg-jl-card border border-jl-card-border rounded-lg p-6 hover:border-jl-purple/40 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <Newspaper size={24} className="text-jl-purple flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-white group-hover:text-jl-pink transition-colors">
                        {item.title}
                      </h3>
                      <ExternalLink size={14} className="text-gray-600 flex-shrink-0 mt-1" />
                    </div>
                    <p className="text-xs text-jl-purple mt-1">{item.source} — {item.date}</p>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">{item.excerpt}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <SectionHeading subtitle="Need logos, brand assets, or press materials? Download our media kit.">MEDIA KIT</SectionHeading>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <button className="btn-primary inline-flex items-center gap-2">
              <Download size={14} />
              DOWNLOAD MEDIA KIT
            </button>
            <Link to="/contact" className="btn-outline">PRESS INQUIRIES</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
