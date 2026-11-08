import { Mic } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionDivider from '../components/SectionDivider'
import { card, Stagger, Item, CtaButton, Section, CtaSection, ProfileLink } from './shared'

// Names follow the reference design; topics, tags and bios are placeholders to replace. Add `url` for a profile link.
const bio = 'Short biography of the speaker, their field and the session they delivered at Jinnah League.'
const editions = [
  {
    label: "JL'24 SPEAKERS", count: '3 KEYNOTE SESSIONS',
    items: [
      { name: 'Muhammad Hassan', session: 'Session title', tags: ['Artificial Intelligence', 'Machine Learning', 'Technology Strategy'], bio },
      { name: 'Aisha Riaz', session: 'Session title', tags: ['Personal Branding', 'Career Growth', 'Content Creation'], bio },
      { name: 'Salman Pasta', session: 'Session title', tags: ['Learning & Development', 'Organizational Development', 'Talent Management'], bio },
    ],
  },
  {
    label: "JL'23 SPEAKERS", count: '2 KEYNOTE SESSIONS',
    items: [
      { name: 'Shahzad Paracha', session: 'Session title', tags: ['Software Project Management', 'Product Management'], bio },
      { name: 'Muhammad Haris Irfan', session: 'Session title', tags: ['QA Automation', 'Software Quality'], bio },
    ],
  },
]

const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('')

export default function PreviousSpeakersPage() {
  return (
    <>
      <HeroSection
        title="PREVIOUS SPEAKERS"
        subtitle="INDUSTRY LEADERS & INNOVATORS"
        description="EXPERTS WHO HAVE SHARED THEIR KNOWLEDGE AND EXPERIENCE WITH THE JINNAH LEAGUE COMMUNITY"
        primaryBtn={<CtaButton to="/jl26">REGISTER FOR JL'26</CtaButton>}
        secondaryBtn={<CtaButton to="/contact" variant="outline">SPEAK AT JL'26</CtaButton>}
      />

      {editions.map((ed) => (
        <div key={ed.label}>
          <Section width="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Mic size={20} className="text-jl-purple" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h2 className="font-display text-xl gradient-text-pink">{ed.label}</h2>
                <p className="text-[11px] text-gray-500 font-heading tracking-widest">{ed.count}</p>
              </div>
            </div>
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ed.items.map((s) => (
                <Item key={s.name} className={card}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-heading font-bold flex-shrink-0" aria-hidden="true">{initials(s.name)}</span>
                    <span className="px-3 py-1 rounded-full bg-jl-purple/20 text-[10px] font-heading tracking-wider uppercase text-purple-200">{s.session}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm uppercase text-white">{s.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300">{t}</span>)}
                  </div>
                  <p className="text-gray-400 text-xs mt-3 leading-relaxed">{s.bio}</p>
                  <ProfileLink url={s.url}>FULL PROFILE</ProfileLink>
                </Item>
              ))}
            </Stagger>
          </Section>
          <SectionDivider />
        </div>
      ))}

      <CtaSection
        title="SPEAK AT JL'26"
        subtitle="Are you an industry expert, entrepreneur or tech leader with insights to share? We’re looking for exceptional speakers for Jinnah League 2026."
        primary={{ to: '/contact', label: 'GET IN TOUCH' }}
      />
    </>
  )
}
