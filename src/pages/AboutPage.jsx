import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Target, Compass, Award, Users } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'

const whyItems = [
  {
    icon: Compass,
    title: 'BRIDGE THE GAP',
    desc: 'We connect university students with industry professionals, bridging the gap between academic learning and real-world tech applications through hands-on competitions and networking.',
  },
  {
    icon: Award,
    title: 'RECOGNIZE TALENT',
    desc: 'Jinnah League provides a national stage for emerging tech talent to showcase their skills, compete against the best, and earn recognition across Pakistan\'s university ecosystem.',
  },
  {
    icon: Users,
    title: 'BUILD COMMUNITY',
    desc: 'More than a competition, Jinnah League fosters a vibrant community of tech enthusiasts, gamers, developers, and innovators who collaborate and grow together.',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <HeroSection
        title="ABOUT JINNAH LEAGUE"
        description="PAKISTAN'S PREMIER INTER-UNIVERSITY TECH & GAMING FESTIVAL"
        primaryBtn={
          <Link to="/jl26" className="btn-primary text-xs">
            JOIN JL'26
          </Link>
        }
        secondaryBtn={
          <Link to="/sponsors" className="btn-outline text-xs">
            BECOME A PARTNER
          </Link>
        }
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-xs tracking-widest uppercase text-gray-400 font-heading"
        >
          BY ACM MAJU STUDENT CHAPTER
        </motion.p>
      </HeroSection>

      {/* What is Jinnah League */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>WHAT IS JINNAH LEAGUE?</SectionHeading>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 grid md:grid-cols-2 gap-8"
          >
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>
                Jinnah League is a national inter-university tech and gaming festival organized
                annually by the ACM MAJU Student Chapter. Established in 2022, it has rapidly
                grown into one of Pakistan&apos;s most anticipated university-level tech events,
                attracting participants from leading institutions across the country.
              </p>
              <p>
                The festival features a diverse range of competitions spanning competitive
                programming, hackathons, game development, UI/UX design, esports tournaments,
                and tech exhibitions. Each edition pushes boundaries to deliver a bigger, bolder,
                and better experience for participants and attendees.
              </p>
            </div>
            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>
                Our commitment is to provide a platform that nurtures innovation, celebrates
                technical excellence, and fosters meaningful connections between students,
                industry professionals, and academic institutions. Jinnah League represents
                more than just competitions — it&apos;s a movement to empower Pakistan&apos;s
                next generation of tech leaders.
              </p>
              <p>
                With each passing year, Jinnah League expands its reach, impact, and ambition.
                From our humble beginnings to a nationally recognized festival, the journey has
                been fueled by passion, dedication, and an unwavering belief in the potential
                of Pakistani university students.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Vision */}
            <motion.div
              variants={itemVariants}
              className="bg-jl-card border border-jl-card-border rounded-lg p-8 hover:border-jl-purple/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Eye size={28} className="text-jl-pink" strokeWidth={1.5} />
                <h3 className="font-display text-xl gradient-text-pink">OUR VISION</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                To establish Jinnah League as Pakistan&apos;s most prestigious inter-university
                tech and gaming festival, setting new standards for innovation, competition,
                and community building. We envision a platform where every university student
                in Pakistan can showcase their potential and connect with opportunities that
                shape their future.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div
              variants={itemVariants}
              className="bg-jl-card border border-jl-card-border rounded-lg p-8 hover:border-jl-purple/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target size={28} className="text-jl-pink" strokeWidth={1.5} />
                <h3 className="font-display text-xl gradient-text-pink">OUR MISSION</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                To provide a competitive platform that brings together university students
                from across Pakistan, fostering innovation, technical excellence, and community
                engagement. Through diverse competitions and collaborative events, we aim to
                bridge the gap between academic learning and real-world tech applications,
                empowering students to become industry-ready professionals.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* Why Jinnah League Exists */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading>WHY JINNAH LEAGUE EXISTS</SectionHeading>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-12 grid md:grid-cols-3 gap-8"
          >
            {whyItems.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="flex justify-center mb-4">
                  <item.icon
                    size={36}
                    className="text-jl-purple group-hover:text-jl-pink transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ACM MAJU Section */}
      <section id="acm-maju" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading>ABOUT ACM MAJU STUDENT CHAPTER</SectionHeading>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-4"
          >
            <p className="text-gray-300 text-sm leading-relaxed">
              The ACM MAJU Student Chapter is one of the most active and prestigious student
              chapters at Mohammad Ali Jinnah University. Established with the vision of
              promoting technological excellence and innovation, the chapter has been a driving
              force behind numerous tech initiatives, workshops, and events.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              As the organizing body behind Jinnah League, ACM MAJU brings together passionate
              students who are committed to elevating Pakistan&apos;s tech ecosystem. The chapter
              serves as a bridge between academic institutions and the tech industry, fostering
              a culture of innovation, learning, and professional growth.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Link to="/contact" className="btn-outline text-xs">
              LEARN MORE
            </Link>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* Institutional Backing */}
      <section id="maju" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading>INSTITUTIONAL BACKING</SectionHeading>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-4"
          >
            <p className="text-gray-300 text-sm leading-relaxed">
              Jinnah League is formally backed by the leadership and support of Mohammad Ali
              Jinnah University. This institutional commitment to inter-university tech and
              gaming competitions ensures organizational credibility and sustainability.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              MAJU&apos;s backing provides Jinnah League with access to academic infrastructure
              and resources, strengthening its position as a nationally recognized platform for
              university students across Pakistan.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            <Link to="/jl26" className="btn-primary text-xs">
              JOIN US
            </Link>
            <Link to="/sponsors" className="btn-outline text-xs">
              EXPLORE PARTNERSHIPS
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
