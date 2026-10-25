import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Handshake, Award, Star } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'

const tiers = [
  { name: 'TITLE SPONSOR', color: 'from-yellow-400 to-amber-500', perks: ['Maximum brand visibility', 'Event naming rights', 'Exclusive media coverage', 'VIP access & speaking opportunity'] },
  { name: 'GOLD SPONSOR', color: 'from-yellow-300 to-yellow-500', perks: ['Major brand placement', 'Social media features', 'Booth at the event', 'Branded competition'] },
  { name: 'SILVER SPONSOR', color: 'from-gray-300 to-gray-400', perks: ['Logo on all materials', 'Social media mentions', 'Shared booth space', 'Attendee database access'] },
  { name: 'PARTNER', color: 'from-purple-400 to-pink-400', perks: ['Logo placement', 'Social media recognition', 'Event passes', 'Networking access'] },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

export default function SponsorsPage() {
  return (
    <>
      <HeroSection
        title="SPONSORS & PARTNERS"
        subtitle="POWERING JINNAH LEAGUE"
        description="JOIN THE BRANDS THAT ARE SHAPING PAKISTAN'S TECH FUTURE"
        primaryBtn={<Link to="/contact" className="btn-primary">BECOME A SPONSOR</Link>}
      />

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading subtitle="Partner with Pakistan's fastest-growing inter-university tech festival. Reach 1800+ talented students, gain brand exposure across 30+ universities, and position your brand at the forefront of youth tech culture.">WHY SPONSOR JINNAH LEAGUE?</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-10 grid md:grid-cols-3 gap-6"
          >
            {[
              { icon: Handshake, title: 'DIRECT ACCESS', desc: 'Connect with top tech talent from universities across Pakistan.' },
              { icon: Award, title: 'BRAND VISIBILITY', desc: 'Extensive online and offline exposure to a tech-savvy audience.' },
              { icon: Star, title: 'CSR IMPACT', desc: 'Support education, innovation, and youth empowerment initiatives.' },
            ].map((item) => (
              <motion.div key={item.title} variants={itemVariants} className="text-center group">
                <item.icon size={32} className="text-jl-purple mx-auto mb-3 group-hover:text-jl-pink transition-colors" strokeWidth={1.5} />
                <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>SPONSORSHIP TIERS</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={itemVariants}
                className="bg-jl-card border border-jl-card-border rounded-lg p-6 hover:border-jl-purple/40 transition-all duration-300"
              >
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${tier.color} mb-4`}>
                  <span className="text-xs font-heading font-bold tracking-widest text-jl-darker">{tier.name}</span>
                </div>
                <ul className="space-y-2 mt-2">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-xs text-gray-300">
                      <Star size={10} className="text-jl-pink mt-1 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Link to="/contact" className="btn-primary">GET IN TOUCH</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
