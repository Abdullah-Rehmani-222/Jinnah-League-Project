import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Users, MapPin, Calendar, Star, Gamepad2, Code, Cpu } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'

const editions = [
  {
    year: '2022',
    title: "JL'22 — THE GENESIS",
    stats: { participants: '200+', competitions: 5, universities: 8 },
    desc: 'The very first Jinnah League — a bold experiment that proved the demand for a student-led national tech festival. What started as a dream became a reality.',
    highlights: ['First-ever inter-university esports tournament at MAJU', 'Competitive programming debut', 'Campus-wide tech exhibition'],
  },
  {
    year: '2023',
    title: "JL'23 — BUILDING MOMENTUM",
    stats: { participants: '500+', competitions: 10, universities: 15 },
    desc: 'The second edition expanded in every dimension — more competitions, more universities, and more industry partnerships. The foundation was set.',
    highlights: ['Hackathon introduced', 'Industry mentorship sessions', 'Multi-day event format launched'],
  },
  {
    year: '2024',
    title: "JL'24 — NATIONAL EXPANSION",
    stats: { participants: '1100+', competitions: 18, universities: 30 },
    desc: 'Jinnah League went national. Universities from across Pakistan joined in, and the event became a landmark on the national tech calendar.',
    highlights: ['Pan-Pakistan university participation', 'Corporate sponsorship program', 'Live-streamed esports finals'],
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LegacyPage() {
  return (
    <>
      <HeroSection
        title="OUR LEGACY"
        subtitle="THE JOURNEY SO FAR"
        description="FROM A VISION TO PAKISTAN'S PREMIER TECH & GAMING FESTIVAL"
      />

      {editions.map((edition, idx) => (
        <div key={edition.year}>
          <section className="py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-3xl md:text-4xl gradient-text-pink mb-2">
                  {edition.title}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed mt-4 max-w-2xl">
                  {edition.desc}
                </p>

                <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                  <div className="bg-jl-card border border-jl-card-border rounded-lg p-4 text-center">
                    <Users size={20} className="text-jl-purple mx-auto mb-2" />
                    <p className="font-heading font-bold text-lg text-white">{edition.stats.participants}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Participants</p>
                  </div>
                  <div className="bg-jl-card border border-jl-card-border rounded-lg p-4 text-center">
                    <Trophy size={20} className="text-jl-purple mx-auto mb-2" />
                    <p className="font-heading font-bold text-lg text-white">{edition.stats.competitions}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Competitions</p>
                  </div>
                  <div className="bg-jl-card border border-jl-card-border rounded-lg p-4 text-center">
                    <MapPin size={20} className="text-jl-purple mx-auto mb-2" />
                    <p className="font-heading font-bold text-lg text-white">{edition.stats.universities}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Universities</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-2">
                  {edition.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-gray-400">
                      <Star size={14} className="text-jl-pink flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </section>
          <SectionDivider />
        </div>
      ))}

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <SectionHeading subtitle="JL'26 is set to be the biggest edition yet. Be part of history.">THE LEGACY CONTINUES</SectionHeading>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/jl26" className="btn-primary">EXPLORE JL'26</Link>
            <Link to="/contact" className="btn-outline">REGISTER NOW</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
