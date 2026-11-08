import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Github, Send, MessageCircle, Globe, Mail } from 'lucide-react'
import { usePublic, useSettings } from '../lib/publicApi'

const footerSections = [
  {
    title: 'JINNAH LEAGUE',
    items: [
      'National Inter-University',
      'Tech & Gaming Festival',
      'ACM MAJU Student Chapter',
      'Karachi, Pakistan',
    ],
  },
  {
    title: 'QUICK LINKS',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Legacy', to: '/legacy' },
      { label: "JL'26", to: '/jl26' },
      { label: 'Sponsors', to: '/sponsors' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Media & Press', to: '/media' },
      { label: 'Gallery', to: '/gallery' },
      { label: 'Competitions', to: '/jl26' },
      { label: 'FAQs', to: '/contact' },
    ],
  },
]

const baseProps = (size, color) => ({
  xmlns: "http://w3.org",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
});

const Tiktok = ({ size = 24, color = "currentColor", ...p }) => (
  <svg {...baseProps(size, color)} {...p}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
);


// Icons per platform key accepted by the API (social.validator.js). Unknown platforms fall back to a globe.
const platformIcons = {
  facebook: [Facebook, 'Facebook'], instagram: [Instagram, 'Instagram'], x: [Twitter, 'X'], linkedin: [Linkedin, 'LinkedIn'],
  youtube: [Youtube, 'YouTube'], github: [Github, 'GitHub'], telegram: [Send, 'Telegram'], whatsapp: [MessageCircle, 'WhatsApp'],
  discord: [MessageCircle, 'Discord'], tiktok: [Tiktok, 'TikTok'], snapchat: [Globe, 'Snapchat'], threads: [Globe, 'Threads'],
}


export default function Footer() {
  const settings = useSettings()
  const social = (usePublic('/social').data ?? []).map((l) => {
    const [Icon, label] = platformIcons[l.platform] ?? [Globe, l.platform]
    return { id: l.id, href: l.url, Icon, label }
  })
  return (
    <footer className="bg-jl-darker/70 border-none border-jl-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-jl-pink mb-4">
                {section.title}
              </h3>
              {section.items && section.title === 'JINNAH LEAGUE' && settings.footer_text && (
                <p className="mb-2 text-sm text-gray-400">{settings.footer_text}</p>
              )}
              {section.items && (
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="text-sm text-gray-400">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.links && (
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Connect With Us */}
          <div>
            <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-jl-pink mb-4">
              CONNECT WITH US
            </h3>
            <div className="flex flex-wrap gap-3">
              {social.map(({ id, href, Icon, label }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded bg-jl-card border border-jl-card-border flex items-center justify-center text-gray-400 hover:text-white hover:border-jl-purple transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
              <Link
                to="/contact"
                aria-label="Contact us"
                className="w-9 h-9 rounded bg-jl-card border border-jl-card-border flex items-center justify-center text-gray-400 hover:text-white hover:border-jl-purple transition-all duration-200"
              >
                <Mail size={16} />
              </Link>
            </div>
            <div className="mt-4">
              <div >
                <img className='w-13 h-14 lg:w-15 lg:h-16 ml-[-12px] lg:ml-[-15px]' src={`${import.meta.env.BASE_URL}logo.png`} alt="logo" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <hr className='border-t border-white/10 max-w-7xl mx-auto' />
      {/* Bottom bar */}
      <div className="border-jl-card-border pb-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>{settings.copyright_text || '© 2026 JINNAH LEAGUE. ALL RIGHTS RESERVED.'}</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">TERMS OF SERVICE</Link>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">PRIVACY POLICY</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
