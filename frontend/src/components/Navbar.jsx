import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'

// Each item is a real sub-page of About (first one is /about itself).
const aboutDropdownItems = [
  { label: 'JINNAH LEAGUE', to: '/about' },
  { label: 'ACM MAJU', to: '/about/acm-maju' },
  { label: 'MAJU', to: '/about/maju' },
  { label: 'TENURES', to: '/about/tenures' },
  { label: 'PREVIOUS SPONSORS', to: '/about/previous-sponsors' },
  { label: 'PREVIOUS PARTNERS', to: '/about/previous-partners' },
  { label: 'PREVIOUS SPEAKERS', to: '/about/previous-speakers' },
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
  const inAbout = location.pathname === '/about' || location.pathname.startsWith('/about/')

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
        if (!mobileOpen) {
          setAboutOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen])


  // Inside your main navigation component:
  useEffect(() => {
    if (mobileOpen) {
      // Prevents X and Y scrolling on the underlying page
      document.documentElement.classList.add('overflow-hidden');
    } else {
      // Restores scrolling when closed
      document.documentElement.classList.remove('overflow-hidden');
    }

    // Clean up classes if the component unmounts unexpectedly
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [mobileOpen]);


  return (
    <nav
      className={`fixed top-0 left-0 pt-1.5 h-20 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-jl-darker/30 backdrop-blur-md shadow-lg shadow-black/30'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 group ">
            <div>
              <img className='w-13 h-12 lg:w-16 lg:h-14 ' src={`${import.meta.env.BASE_URL}logo.png`} alt="logo" />
            </div>
            <span className="font-display text-xl lg:text-3xl text-white tracking-wide">
              JINNAH LEAGUE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex mt-1 items-center gap-1">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div key={link.label} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAboutOpen(!aboutOpen)}
                    aria-haspopup="menu"
                    aria-expanded={aboutOpen}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-heading font-semibold tracking-widest uppercase transition-colors duration-200 ${inAbout ? 'text-pink-500' : 'text-gray-300 hover:text-jl-purple'
                      }`}
                  >
                    {link.label}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''
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
                        className="absolute top-full left-0 mt-1 w-52 bg-jl-darker/80 border-none border-jl-card-border rounded-lg shadow-xl shadow-black/50 overflow-hidden"
                      >
                        {aboutDropdownItems.map((item) => (
                          <Link
                            key={item.label}
                            to={item.to}
                            className={`block px-4 py-2.5 text-sm font-heading font-semibold tracking-widest uppercase text-gray-300 hover:text-jl-purple transition-colors duration-150 ${
                              location.pathname === item.to ? 'text-pink-500' : 'text-gray-300'
                            }`}
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
                  className={`px-3 py-2 text-sm font-heading font-semibold tracking-widest uppercase transition-colors duration-200 ${location.pathname === link.to
                    ? 'text-pink-500'
                    : 'text-gray-300 hover:text-jl-purple'
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
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 top-20 z-40 bg-black/10 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden relative z-50 bg-jl-darker/98 backdrop-blur-md border-t border-jl-card-border max-h-[calc(100vh-5rem)] overflow-y-auto"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) =>
                  link.hasDropdown ? (
                    <div key={link.label}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setAboutOpen((prev) => !prev);
                        }}
                        aria-expanded={aboutOpen}
                        className="flex items-center justify-between w-full px-3 py-3 text-md font-heading font-semibold tracking-widest uppercase text-gray-300 hover:text-white"
                      >
                        {link.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 pointer-events-none ${aboutOpen ? 'rotate-180' : ''
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
                                className="block px-3 py-2 text-[13px] font-heading tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
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
                      className={`block px-3 py-3 text-md font-heading font-semibold tracking-widest uppercase transition-colors ${location.pathname === link.to
                        ? 'text-jl-pink'
                        : 'text-gray-300 hover:text-white'
                        }`}
                    >
                      {link.label}
                    </Link>
                  )
                )}
                <div className="pt-3">
                  <Link to="/contact" className="btn-primary text-xs py-2.5 w-full text-center block">
                    REGISTER NOW
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
