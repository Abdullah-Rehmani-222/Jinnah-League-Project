import { GraduationCap, Monitor, FlaskConical, Briefcase, Globe, BookOpen } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'
import { card, Stagger, Item, CtaButton, Section, CtaSection } from './shared'

const reasons = [
  { icon: GraduationCap, title: 'PREMIER COMPUTER SCIENCE EDUCATION', desc: 'A strong computing faculty with programmes built around current industry needs.' },
  { icon: Monitor, title: 'STATE-OF-THE-ART FACILITIES', desc: 'Modern labs, classrooms and event spaces on a well-equipped Karachi campus.' },
  { icon: FlaskConical, title: 'RESEARCH & INNOVATION', desc: 'Students and faculty are encouraged to research, prototype and publish.' },
  { icon: Briefcase, title: 'INDUSTRY-LINKED CURRICULUM', desc: 'Coursework and internships shaped by partnerships with employers.' },
  { icon: Globe, title: 'INTERNATIONAL LINKAGES', desc: 'Academic collaborations that give students a global perspective.' },
  { icon: BookOpen, title: 'DIVERSE ACADEMIC OFFERINGS', desc: 'Programmes across computing, business, media and social sciences.' },
]

// Edit these lists to match MAJU's current programmes.
const faculties = [
  { name: 'FACULTY OF COMPUTER SCIENCE', programmes: ['BS Computer Science', 'BS Software Engineering', 'BS Artificial Intelligence', 'BS Data Science', 'BS Cyber Security'] },
  { name: 'FACULTY OF BUSINESS ADMINISTRATION', programmes: ['BBA', 'MBA', 'Executive programmes'] },
  { name: 'FACULTY OF MEDIA SCIENCES', programmes: ['BS Media Sciences', 'Digital media', 'Journalism'] },
  { name: 'FACULTY OF SOCIAL SCIENCES', programmes: ['BS Psychology', 'Social sciences', 'Humanities'] },
]

export default function AboutMajuPage() {
  return (
    <>
      <HeroSection
        title="MAJU"
        subtitle="MOHAMMAD ALI JINNAH UNIVERSITY"
        description="HOME OF JINNAH LEAGUE — WHERE STUDENTS, LEADERS AND INNOVATORS CONNECT AND GROW"
        primaryBtn={<CtaButton to="/jl26">REGISTER FOR JL'26</CtaButton>}
        secondaryBtn={<CtaButton href="https://jinnah.edu" variant="outline">VISIT MAJU</CtaButton>}
      />

      <Section width="max-w-4xl">
        <SectionHeading className="!text-left">ABOUT THE UNIVERSITY</SectionHeading>
        <div className="mt-8 grid md:grid-cols-2 gap-8 text-sm text-gray-300 leading-relaxed">
          <div className="space-y-4">
            <p>Mohammad Ali Jinnah University (MAJU) is a leading private university in Karachi, Pakistan, committed to quality education in computing, business and the social sciences.</p>
            <p>The campus is home to a lively student community that takes part in competitions, societies and large-scale events throughout the year.</p>
          </div>
          <div className="space-y-4 text-gray-400">
            <p>MAJU’s focus on academic excellence, innovation and industry engagement prepares graduates for careers in Pakistan and beyond.</p>
            <p>Its support for student-led initiatives is what makes events like Jinnah League possible.</p>
          </div>
        </div>
      </Section>

      <SectionDivider />

      <Section>
        <SectionHeading subtitle="What makes MAJU the right home for Pakistan’s premier inter-university tech festival.">WHY MAJU</SectionHeading>
        <Stagger className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((r) => (
            <Item key={r.title} className={card}>
              <r.icon size={22} className="text-jl-purple mb-3" strokeWidth={1.5} />
              <h3 className="font-heading font-bold text-xs tracking-widest uppercase text-white mb-2">{r.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{r.desc}</p>
            </Item>
          ))}
        </Stagger>
      </Section>

      <SectionDivider />

      <Section width="max-w-4xl">
        <SectionHeading>FACULTIES &amp; PROGRAMMES</SectionHeading>
        <Stagger className="mt-10 grid sm:grid-cols-2 gap-5">
          {faculties.map((f) => (
            <Item key={f.name} className={card}>
              <h3 className="font-heading font-bold text-xs tracking-widest uppercase text-white mb-3">{f.name}</h3>
              <ul className="space-y-1.5">
                {f.programmes.map((p) => (
                  <li key={p} className="text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-jl-pink" aria-hidden="true" />{p}
                  </li>
                ))}
              </ul>
            </Item>
          ))}
        </Stagger>
      </Section>

      <SectionDivider />

      <Section width="max-w-3xl" className="text-center">
        <SectionHeading>THE HOME OF JINNAH LEAGUE</SectionHeading>
        <div className="mt-8 space-y-4 text-sm leading-relaxed">
          <p className="text-gray-300">Every edition of Jinnah League is hosted on the MAJU campus, with the university’s leadership, faculty and facilities backing the event.</p>
          <p className="text-gray-400">That institutional support gives participants and partners a credible, well-organized and welcoming place to compete.</p>
        </div>
      </Section>

      <SectionDivider />

      <CtaSection
        title="COME TO MAJU FOR JL'26"
        subtitle="Experience one of the best campuses in Karachi as it hosts the next edition of Jinnah League."
        primary={{ to: '/jl26', label: "REGISTER FOR JL'26" }}
        secondary={{ to: '/contact', label: 'GET IN TOUCH' }}
      />
    </>
  )
}
