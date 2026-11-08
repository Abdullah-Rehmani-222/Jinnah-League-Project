import { Users, Newspaper } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionDivider from '../components/SectionDivider'
import { card, Stagger, Item, CtaButton, Section, CtaSection, ProfileLink } from './shared'

// Placeholder data: replace with the real partners. Add `url` to show a "VIEW PROFILE" link.
const pt = (type, name, desc) => ({ type, name, desc, url: null })
const blurb = 'Short description of the partner and how they supported Jinnah League.'
const sections = [
  { label: "JL'24 OUTREACH PARTNERS", sub: 'SOCIETIES, STUDENT CHAPTERS AND COMMUNITIES', icon: Users, logos: true,
    items: ['STUDENT SOCIETY', 'STUDENT CHAPTER', 'TECH COMMUNITY', 'STUDENT SOCIETY', 'PROFESSIONAL CHAPTER', 'TECH COMMUNITY', 'STUDENT SOCIETY', 'STUDENT CHAPTER', 'UNIVERSITY', 'STUDENT CHAPTER'].map((t) => pt(t, 'Partner Name', blurb)) },
  { label: "JL'23 OUTREACH PARTNERS", sub: 'UNIVERSITIES, SOCIETIES AND COMMUNITIES', icon: Users, logos: false,
    items: ['UNIVERSITY', 'UNIVERSITY', 'UNIVERSITY', 'UNIVERSITY', 'UNIVERSITY', 'UNIVERSITY', 'COMMUNITY'].map((t) => pt(t, 'Partner Name', blurb)) },
  { label: 'MEDIA PARTNERS', sub: 'MEDIA COVERAGE AND PROMOTION', icon: Newspaper, logos: false,
    items: ['MEDIA PARTNER', 'MEDIA PARTNER', 'MEDIA PARTNER'].map((t) => pt(t, 'Partner Name', blurb)) },
]

export default function PreviousPartnersPage() {
  return (
    <>
      <HeroSection
        title="PREVIOUS PARTNERS"
        subtitle="OUTREACH PARTNERS & MEDIA PARTNERS"
        description="THE COMMUNITIES AND PUBLICATIONS THAT HELPED JINNAH LEAGUE REACH STUDENTS ACROSS PAKISTAN"
        primaryBtn={<CtaButton to="/sponsors">BECOME A PARTNER</CtaButton>}
        secondaryBtn={<CtaButton to="/about" variant="outline">ABOUT US</CtaButton>}
      />

      {sections.map((s) => (
        <div key={s.label}>
          <Section width="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <s.icon size={20} className="text-jl-purple" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h2 className="font-display text-xl gradient-text-pink">{s.label}</h2>
                <p className="text-[11px] text-gray-500 font-heading tracking-widest">{s.sub}</p>
              </div>
            </div>
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {s.items.map((p, i) => (
                <Item key={i} className={card}>
                  {s.logos && <div className="mb-3 h-12 rounded bg-white/5 border border-jl-card-border flex items-center justify-center text-gray-600 text-[11px] font-heading tracking-wider">LOGO</div>}
                  <p className="text-[10px] text-gray-500 font-heading tracking-widest">{p.type}</p>
                  <h3 className="font-heading font-bold text-sm uppercase text-white mt-0.5">{p.name}</h3>
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed">{p.desc}</p>
                  <ProfileLink url={p.url}>VIEW PROFILE</ProfileLink>
                </Item>
              ))}
            </Stagger>
          </Section>
          <SectionDivider />
        </div>
      ))}

      <CtaSection
        title="PARTNER WITH JL'26"
        subtitle="Interested in representing your university, chapter or organization? Reach out to our team."
        primary={{ to: '/contact', label: 'GET IN TOUCH' }}
      />
    </>
  )
}
