import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'

const aboutDropdownItems = [
  { label: 'JINNAH LEAGUE', to: '/about' },
  { label: 'ACM MAJU', to: '/about#acm-maju' },
  { label: 'MAJU', to: '/about#maju' },
  { label: 'TENURES', to: '/about#tenures' },
  { label: 'PREVIOUS SPONSORS', to: '/about#prev-sponsors' },
  { label: 'PREVIOUS PARTNERS', to: '/about#prev-partners' },
  { label: 'PREVIOUS SPEAKERS', to: '/about#prev-speakers' },
]

const navLinks = [
  { label: 'HOME', to: '/' },
  { label: 'ABOUT', to: '/about', hasDropdown: true },
  { label: 'LEGACY', to: '/legacy' },
  { label: "JL'26", to: '/jl26' },
  { label: 'SPONSORS', to: '/sponsors' },
  { label: 'MEDIA & PRESS', to: '/media' },
  { label: 'GALLERY', to: '/gallery' },
  { label: 'CONTACT', to: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setAboutOpen(false)
  }, [location])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setAboutOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAboutOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-jl-darker/95 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center font-display text-white text-sm">
              JL
            </div>
            <span className="font-display text-lg text-white tracking-wide">
              JINNAH LEAGUE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.label} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAboutOpen(!aboutOpen)}
                    aria-haspopup="menu"
                    aria-expanded={aboutOpen}
                    className={`flex items-center gap-1 px-3 py-2 text-xs font-heading font-semibold tracking-widest uppercase transition-colors duration-200 ${
                      location.pathname === '/about'
                        ? 'text-jl-pink'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${
                        aboutOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {aboutOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-52 bg-jl-darker/95 backdrop-blur-md border border-jl-card-border rounded-sm shadow-xl shadow-black/50 overflow-hidden"
                      >
                        {aboutDropdownItems.map((item) => (
                          <Link
                            key={item.label}
                            to={item.to}
                            className="block px-4 py-2.5 text-xs font-heading font-semibold tracking-widest uppercase text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`px-3 py-2 text-xs font-heading font-semibold tracking-widest uppercase transition-colors duration-200 ${
                    location.pathname === link.to
                      ? 'text-jl-pink'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            <Link
              to="/contact"
              className="ml-3 btn-primary text-xs py-2 px-5"
            >
              REGISTER NOW
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-gray-300 hover:text-white p-2"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-jl-darker/98 backdrop-blur-md border-t border-jl-card-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div key={link.label}>
                    <button
                      onClick={() => setAboutOpen(!aboutOpen)}
                      aria-expanded={aboutOpen}
                      className="flex items-center justify-between w-full px-3 py-3 text-xs font-heading font-semibold tracking-widest uppercase text-gray-300 hover:text-white"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          aboutOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {aboutOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 space-y-1 overflow-hidden"
                        >
                          {aboutDropdownItems.map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              className="block px-3 py-2 text-xs font-heading tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`block px-3 py-3 text-xs font-heading font-semibold tracking-widest uppercase transition-colors ${
                      location.pathname === link.to
                        ? 'text-jl-pink'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3">
                <Link to="/contact" className="btn-primary text-xs py-2.5 w-full text-center">
                  REGISTER NOW
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
