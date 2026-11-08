import { Code, Trophy, Users, Globe, Handshake, Star } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'
import { card, Stagger, Item, CtaButton, Section, CtaSection } from './shared'

const pillars = [
  { icon: Code, title: 'TECHNICAL EXCELLENCE', desc: 'Workshops, seminars and competitions that sharpen real-world technical skills.' },
  { icon: Trophy, title: 'FLAGSHIP EVENTS', desc: 'Jinnah League is our flagship, bringing universities across Pakistan together each year.' },
  { icon: Users, title: 'COMMUNITY BUILDING', desc: 'A welcoming network of students who learn, build and grow together.' },
  { icon: Globe, title: 'GLOBAL NETWORK', desc: 'Part of the Association for Computing Machinery, the world’s largest computing society.' },
  { icon: Handshake, title: 'INDUSTRY PARTNERSHIPS', desc: 'Close ties with companies that mentor students and open career pathways.' },
  { icon: Star, title: 'STUDENT LEADERSHIP', desc: 'Students run everything, building leadership and management experience.' },
]

const journey = [
  { year: '2022', tag: "JL'22", title: 'FIRST EDITION', desc: 'The first Jinnah League launched on campus, proving the demand for a student-led tech festival.' },
  { year: '2023', tag: "JL'23", title: 'GROWING INTER-UNIVERSITY', desc: 'More competitions, more universities and the first industry partnerships.' },
  { year: '2024', tag: "JL'24", title: 'NATIONAL SCALE', desc: 'Participation from universities across Pakistan and a corporate sponsorship programme.' },
  { year: '2026', tag: "JL'26", title: 'NEXT CHAPTER', desc: 'The most ambitious edition yet: bigger, bolder, better.' },
]

export default function AboutAcmPage() {
  return (
    <>
      <HeroSection
        title="ACM MAJU"
        subtitle="MOHAMMAD ALI JINNAH UNIVERSITY STUDENT CHAPTER"
        description="THE ORGANIZING BODY BEHIND JINNAH LEAGUE — EMPOWERING STUDENTS THROUGH TECHNOLOGY, COMPETITION AND COMMUNITY"
        primaryBtn={<CtaButton to="/jl26">REGISTER FOR JL'26</CtaButton>}
        secondaryBtn={<CtaButton to="/about/tenures" variant="outline">MEET OUR TEAM</CtaButton>}
      />

      <Section>
        <SectionHeading>WHO WE ARE</SectionHeading>
        <div className="mt-10 grid md:grid-cols-2 gap-8 text-sm text-gray-300 leading-relaxed">
          <div className="space-y-4">
            <p>ACM MAJU is the Association for Computing Machinery Student Chapter at Mohammad Ali Jinnah University, Karachi. We are a student-run organization dedicated to fostering technology and talent through events, workshops and competitions.</p>
            <p>As part of ACM, the world’s largest and most prestigious computing society, our chapter connects MAJU students to a global network of professionals, researchers and innovators.</p>
          </div>
          <div className="space-y-4 text-gray-400">
            <p>Everything we do is led by students: our executives, department heads and volunteers are all MAJU students who bring passion, creativity and dedication to every event.</p>
            <p>Jinnah League is our flagship initiative, a national platform that connects tech enthusiasts and gamers from universities across Pakistan.</p>
          </div>
        </div>
      </Section>

      <SectionDivider />

      <Section>
        <SectionHeading subtitle="The pillars that define our chapter and everything we organize.">WHAT WE STAND FOR</SectionHeading>
        <Stagger className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p) => (
            <Item key={p.title} className={card}>
              <p.icon size={24} className="text-jl-purple mb-3" strokeWidth={1.5} />
              <h3 className="font-heading font-bold text-xs tracking-widest uppercase text-white mb-2">{p.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{p.desc}</p>
            </Item>
          ))}
        </Stagger>
      </Section>

      <SectionDivider />

      <Section width="max-w-3xl">
        <SectionHeading>OUR JOURNEY</SectionHeading>
        <ol className="mt-10 relative border-l border-jl-purple/30 ml-3 space-y-8">
          {journey.map((j) => (
            <li key={j.tag} className="pl-8 relative">
              <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-jl-purple ring-4 ring-jl-darker" aria-hidden="true" />
              <p className="text-xs text-gray-500 font-heading tracking-widest">{j.year}</p>
              <p className="font-heading font-bold text-sm text-white tracking-wider">
                <span className="text-jl-pink">{j.tag}</span> {j.title}
              </p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">{j.desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      <SectionDivider />

      <CtaSection
        title="BE PART OF THE STORY"
        subtitle="Whether you’re competing, sponsoring or partnering, Jinnah League welcomes everyone who believes in the power of technology and community."
        primary={{ to: '/jl26', label: "REGISTER FOR JL'26" }}
        secondary={{ to: '/sponsors', label: 'PARTNER WITH US' }}
      />
    </>
  )
}
