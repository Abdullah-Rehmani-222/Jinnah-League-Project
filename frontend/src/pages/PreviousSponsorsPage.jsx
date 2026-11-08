import { Award } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import SectionDivider from '../components/SectionDivider'
import { card, Stagger, Item, CtaButton, Section, CtaSection, ProfileLink } from './shared'

const tierStyle = {
  TITLE: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
  GOLD: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
  SILVER: 'bg-gray-300/15 text-gray-200 border-gray-300/30',
  BRONZE: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  COMMUNITY: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
}

// Placeholder data: replace with the real sponsors. Add `url` to show a "VIEW PROFILE" link.
const sp = (tier, name, field, desc) => ({ tier, name, field, desc, url: null })
const editions = [
  {
    label: "JL'24 SPONSORS", count: '4 SPONSORS',
    items: [
      sp('GOLD', 'Sponsor Name', 'Technology', 'Short description of what the sponsor does and how they supported JL’24.'),
      sp('GOLD', 'Sponsor Name', 'Software', 'Short description of what the sponsor does and how they supported JL’24.'),
      sp('SILVER', 'Sponsor Name', 'Services', 'Short description of what the sponsor does and how they supported JL’24.'),
      sp('BRONZE', 'Sponsor Name', 'Finance', 'Short description of what the sponsor does and how they supported JL’24.'),
    ],
  },
  {
    label: "JL'23 SPONSORS", count: '6 SPONSORS',
    items: [
      sp('TITLE', 'Sponsor Name', 'Technology', 'Short description of what the sponsor does and how they supported JL’23.'),
      sp('SILVER', 'Sponsor Name', 'Software', 'Short description of what the sponsor does and how they supported JL’23.'),
      sp('SILVER', 'Sponsor Name', 'Banking', 'Short description of what the sponsor does and how they supported JL’23.'),
      sp('SILVER', 'Sponsor Name', 'Technology', 'Short description of what the sponsor does and how they supported JL’23.'),
      sp('COMMUNITY', 'Sponsor Name', 'Education', 'Short description of what the sponsor does and how they supported JL’23.'),
      sp('COMMUNITY', 'Sponsor Name', 'Services', 'Short description of what the sponsor does and how they supported JL’23.'),
    ],
  },
]

export default function PreviousSponsorsPage() {
  return (
    <>
      <HeroSection
        title="PREVIOUS SPONSORS"
        subtitle="THE ORGANIZATIONS THAT POWERED JINNAH LEAGUE"
        description="FROM TECH STARTUPS TO GLOBAL BRANDS, THESE PARTNERS BELIEVED IN PAKISTAN’S STUDENT TALENT"
        primaryBtn={<CtaButton to="/sponsors">BECOME A SPONSOR</CtaButton>}
        secondaryBtn={<CtaButton to="/about" variant="outline">ABOUT US</CtaButton>}
      />

      {editions.map((ed) => (
        <div key={ed.label}>
          <Section width="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Award size={20} className="text-jl-purple" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h2 className="font-display text-xl gradient-text-pink">{ed.label}</h2>
                <p className="text-[11px] text-gray-500 font-heading tracking-widest">{ed.count}</p>
              </div>
            </div>
            <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ed.items.map((s, i) => (
                <Item key={i} className={card}>
                  <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-heading font-bold tracking-widest ${tierStyle[s.tier]}`}>{s.tier} SPONSOR</span>
                  <div className="my-4 h-14 rounded bg-white/5 border border-jl-card-border flex items-center justify-center text-gray-600 text-[11px] font-heading tracking-wider">LOGO</div>
                  <h3 className="font-heading font-bold text-sm uppercase text-white">{s.name}</h3>
                  <p className="text-[11px] text-jl-purple uppercase tracking-wider mt-0.5">{s.field}</p>
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed">{s.desc}</p>
                  <ProfileLink url={s.url}>VIEW PROFILE</ProfileLink>
                </Item>
              ))}
            </Stagger>
          </Section>
          <SectionDivider />
        </div>
      ))}

      <CtaSection
        title="JOIN THE LEGACY"
        subtitle="Want your brand alongside these leading organizations? Explore our sponsorship tiers and connect with our team."
        primary={{ to: '/sponsors', label: 'VIEW SPONSORSHIP TIERS' }}
        secondary={{ to: '/about', label: 'ABOUT US' }}
      />
    </>
  )
}
