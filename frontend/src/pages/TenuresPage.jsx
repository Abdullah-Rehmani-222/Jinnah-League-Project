import { User } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionHeading from '../components/SectionHeading'
import SectionDivider from '../components/SectionDivider'
import { Stagger, Item, CtaButton, Section, CtaSection } from './shared'

// Placeholder data: replace names/roles with the real team (later this can come from the CMS).
const people = (role, n) => Array.from({ length: n }, (_, i) => ({ name: `Member ${i + 1}`, role }))

const tenures = [
  {
    label: '2026 TENURE',
    council: [
      { name: 'President', role: 'President' }, { name: 'Vice President', role: 'Vice President' },
      { name: 'General Secretary', role: 'General Secretary' }, { name: 'Treasurer', role: 'Treasurer' },
    ],
    heads: ['Core Club', 'Gaming & Esports', 'Public Relations', 'Creatives', 'Marketing', 'Event Management'].map((d) => ({ name: 'Department Head', role: `Head, ${d}` })),
    groups: [
      { title: 'CORE CLUB DEPARTMENT MEMBERS', members: people('Core Club', 6) },
      { title: 'GAMING & ESPORTS DEPARTMENT MEMBERS', members: people('Gaming & Esports', 5) },
      { title: 'PUBLIC RELATIONS DEPARTMENT MEMBERS', members: people('Public Relations', 3) },
      { title: 'CREATIVES DEPARTMENT MEMBERS', members: people('Creatives', 4) },
      { title: 'MARKETING DEPARTMENT MEMBERS', members: people('Marketing', 5) },
      { title: 'EVENT MANAGEMENT DEPARTMENT MEMBERS', members: people('Event Management', 4) },
    ],
  },
  {
    label: '2025 TENURE',
    council: people('Executive Council', 4),
    heads: people('Department Head', 8),
    groups: [],
  },
  {
    label: '2024 TENURE',
    council: people('Executive Council', 4),
    heads: people('Department Head', 8),
    groups: [],
  },
  {
    label: '2023 TENURE',
    council: people('Executive Council', 1),
    heads: people('Department Head', 3),
    groups: [{ title: 'GENERAL MEMBERS', members: people('Member', 4) }],
  },
]

function PersonCard({ person }) {
  return (
    <div className="bg-jl-card border border-jl-card-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-jl-purple/40 transition-colors">
      <span className="w-9 h-9 rounded-full bg-jl-purple/15 border border-jl-purple/30 flex items-center justify-center flex-shrink-0" aria-hidden="true">
        <User size={16} className="text-jl-purple" />
      </span>
      <div className="min-w-0">
        <p className="font-heading font-semibold text-xs tracking-wider uppercase text-white truncate">{person.name}</p>
        <p className="text-[11px] text-gray-400 truncate">{person.role}</p>
      </div>
    </div>
  )
}

function Group({ title, people: list, big }) {
  return (
    <div className="mt-10">
      <h3 className={`font-display text-center gradient-text-pink mb-5 ${big ? 'text-2xl' : 'text-lg'}`}>{title}</h3>
      <Stagger className={`grid gap-3 justify-center ${big ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
        {list.map((p, i) => <Item key={`${p.name}-${i}`}><PersonCard person={p} /></Item>)}
      </Stagger>
    </div>
  )
}

export default function TenuresPage() {
  return (
    <>
      <HeroSection
        title="OUR TENURE"
        subtitle="THE PEOPLE BEHIND JINNAH LEAGUE"
        description="THE STUDENT LEADERS WHO BUILT AND GROW THE FESTIVAL"
        primaryBtn={<CtaButton to="/jl26">REGISTER FOR JL'26</CtaButton>}
      />

      {tenures.map((t) => (
        <div key={t.label}>
          <Section width="max-w-6xl">
            <SectionHeading>{t.label}</SectionHeading>
            <Group title="EXECUTIVE COUNCIL" people={t.council} big />
            <Group title="DEPARTMENT HEADS" people={t.heads} big />
            {t.groups.map((g) => <Group key={g.title} title={g.title} people={g.members} />)}
          </Section>
          <SectionDivider />
        </div>
      ))}

      <CtaSection
        title="BE PART OF JL'26"
        subtitle="Join the team that makes Jinnah League happen."
        primary={{ to: '/contact', label: 'GET IN TOUCH' }}
        secondary={{ to: '/about/acm-maju', label: 'ABOUT ACM MAJU' }}
      />
    </>
  )
}
