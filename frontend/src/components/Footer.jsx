import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail } from 'lucide-react'

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

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Mail, href: '#', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="bg-jl-darker/80 backdrop-blur-sm border-t border-jl-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading font-bold text-sm tracking-widest uppercase text-jl-pink mb-4">
                {section.title}
              </h3>
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
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded bg-jl-card border border-jl-card-border flex items-center justify-center text-gray-400 hover:text-white hover:border-jl-purple transition-all duration-200"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            <div className="mt-4">
              <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-display text-white text-sm">
                JL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-jl-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© 2026 JINNAH LEAGUE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-gray-300 transition-colors">TERMS OF SERVICE</Link>
            <Link to="#" className="hover:text-gray-300 transition-colors">PRIVACY POLICY</Link>
            <Link to="#" className="hover:text-gray-300 transition-colors">JINNAH LEAGUE</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
