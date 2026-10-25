import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code, Gamepad2, Cpu, Trophy, Palette, Shield, Mic, BrainCircuit } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'

const competitions = [
  { icon: Code, title: 'COMPETITIVE PROGRAMMING', desc: 'Algorithmic battles to find the sharpest coders across Pakistan.' },
  { icon: BrainCircuit, title: 'HACKATHON', desc: '24-hour innovation sprint — build solutions to real-world problems.' },
  { icon: Gamepad2, title: 'ESPORTS', desc: 'Multi-title gaming tournaments with national-level competition.' },
  { icon: Cpu, title: 'TECH EXHIBITION', desc: 'Showcase cutting-edge projects, research, and prototypes.' },
  { icon: Palette, title: 'UI/UX DESIGN', desc: 'Design challenges that test creativity, usability, and visual thinking.' },
  { icon: Shield, title: 'CTF CYBERSECURITY', desc: 'Capture the Flag challenges for aspiring security professionals.' },
  { icon: Mic, title: 'TECH TALKS', desc: 'Industry leaders sharing insights, trends, and career advice.' },
  { icon: Trophy, title: 'SPEED DEBUGGING', desc: 'Find and fix bugs faster than anyone else in the room.' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function JL26Page() {
  return (
    <>
      <HeroSection
        title="JL'26"
        subtitle="BIGGER. BOLDER. BETTER."
        description="THE MOST AMBITIOUS EDITION OF JINNAH LEAGUE YET"
        primaryBtn={<Link to="/contact" className="btn-primary">REGISTER NOW</Link>}
        secondaryBtn={<Link to="/sponsors" className="btn-outline">SPONSOR JL'26</Link>}
      />

      {/* About JL'26 */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading subtitle="JL'26 brings together the best of tech and gaming under one roof. With expanded competitions, industry partnerships, and a national reach, this edition promises an unforgettable experience for every participant.">WHAT AWAITS YOU</SectionHeading>
        </div>
      </section>

      <SectionDivider />

      {/* Competitions */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>COMPETITIONS & EVENTS</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {competitions.map((comp) => (
              <motion.div
                key={comp.title}
                variants={itemVariants}
                className="bg-jl-card border border-jl-card-border rounded-lg p-6 text-center hover:border-jl-purple/40 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex justify-center mb-4">
                  <comp.icon size={32} className="text-jl-purple group-hover:text-jl-pink transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-bold text-xs tracking-widest uppercase text-white mb-2">
                  {comp.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">{comp.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <SectionHeading subtitle="Spots are limited. Represent your university at the biggest tech and gaming festival in Pakistan.">DON'T MISS OUT</SectionHeading>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/contact" className="btn-primary">REGISTER YOUR TEAM</Link>
            <Link to="/about" className="btn-outline">LEARN MORE</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
