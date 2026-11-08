import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Zap, Calendar } from 'lucide-react'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'
import HeroSlider from '../components/HeroSlider'
import CmsSections from '../components/CmsSections'
import { usePage, usePublic, fileUrl } from '../lib/publicApi'

const evolutionCards = [
  {
    year: "JL'22",
    title: 'THE BEGINNING',
    desc: 'Where it all started — our inaugural event that laid the foundation.',
    // color: 'from-pink-500 to-rose-600',
  },
  {
    year: "JL'23",
    title: 'FOUNDATION',
    desc: 'Building on success with expanded competitions and partnerships.',
    // color: 'from-purple-500 to-violet-600',
  },
  {
    year: "JL'24",
    title: 'EXPANSION',
    desc: 'Growing nationally with inter-university collaborations across Pakistan.',
    // color: 'from-fuchsia-500 to-purple-600',
  },
  {
    year: "JL'26",
    title: 'THE LEGACY CONTINUES',
    desc: 'Bigger. Bolder. Better. The most ambitious edition yet.',
    // color: 'from-pink-500 to-purple-600',
  },
]

const impactStats = [
  { icon: Users, value: '1800+', label: 'TOTAL PARTICIPANTS', desc: '' },
  { icon: TrendingUp, value: 'Growing', label: 'EACH YEAR', desc: '' },
  { icon: Zap, value: 'National', label: 'SCALE', desc: '' },
  { icon: Calendar, value: 'Since 2022', label: 'YEARS STRONG', desc: '' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HomePage() {
  const { sections } = usePage('home')
  const logos = (usePublic('/sponsors').data ?? []).filter((t) => t.logoMedia)
  return (
    <>
      {/* Hero (CMS slides, built-in fallback) */}
      <HeroSlider />

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading>ABOUT JINNAH LEAGUE</SectionHeading>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 space-y-5"
          >
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              Jinnah League is Pakistan&apos;s premier inter-university tech and gaming festival,
              organized by the ACM MAJU Student Chapter. What began as a vision to create a
              platform for university students to compete, collaborate, and celebrate technology
              has grown into a national movement.
            </p>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              From competitive programming and hackathons to esports tournaments and tech expos,
              Jinnah League brings together the brightest minds from universities across Pakistan.
              Our mission is to foster innovation, recognize talent, and build a thriving tech
              community that bridges the gap between academia and industry.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Link to="/about" className="btn-outline text-xs">
              LEARN MORE ABOUT US
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Evolution Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>OUR EVOLUTION</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {evolutionCards.map((card) => (
              <motion.div
                key={card.year}
                variants={itemVariants}
                className="bg-jl-card border border-jl-card-border rounded-lg p-6 text-center hover:border-jl-purple/40 transition-all duration-300 group"
              >
                <span className="font-display font-bold text-jl-purple text-2xl">
                  {card.year}
                </span>
                <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-white mt-1 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Link to="/legacy" className="btn-outline text-xs">
              EXPLORE OUR LEGACY
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>IMPACT AT A GLANCE</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {impactStats.map((stat) => (
              <motion.div
                key={stat.value}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="flex justify-center mb-3">
                  <stat.icon
                    size={40}
                    className="text-jl-purple group-hover:text-jl-pink transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="font-heading font-semibold text-2xl md:text-3xl text-white">
                  {stat.value}
                </p>
                <p className="font-heading text-xs tracking-widest uppercase text-gray-400 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CmsSections sections={sections} leadingDivider />

      {/* Partners Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading subtitle="Powered by the trust and support of our valued partners.">OUR PARTNERS</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
          >
            {logos.length > 0
              ? logos.map((t) => (
                <motion.div key={t.id} variants={itemVariants} className="flex aspect-square items-center justify-center rounded-lg border border-jl-card-border bg-jl-card p-3 transition-colors duration-300 hover:border-jl-purple/40">
                  <img src={fileUrl(t.logoMedia)} alt={t.logoMedia.altText || t.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                </motion.div>
              ))
              : Array.from({ length: 6 }).map((_, i) => (
                <motion.div key={i} variants={itemVariants} className="aspect-video bg-jl-card border border-jl-card-border rounded-lg flex items-center justify-center hover:border-jl-purple/40 transition-colors duration-300">
                  <span className="text-gray-600 text-xs font-heading tracking-wider">Partner {i + 1}</span>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <SectionHeading subtitle="Register now for Pakistan's most anticipated inter-university tech and gaming festival.">READY TO JOIN JL'26?</SectionHeading>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="btn-primary">
              REGISTER NOW
            </Link>
            <Link to="/sponsors" className="btn-outline">
              BECOME A SPONSOR
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
