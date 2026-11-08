import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, History, FileText, Trophy, Newspaper, Handshake, Images, Share2, Presentation,
  Settings, FolderOpen, Inbox, UserCog, Menu, X, ExternalLink, LogOut,
} from 'lucide-react'
import { useAuth } from '../AuthContext'
import { useFetch } from '../lib/hooks'
import { cn } from '../lib/cn'

const groups = [
  { items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    label: 'Website content',
    items: [
      { to: '/admin/hero', label: 'Hero & Sliders', icon: Presentation },
      { to: '/admin/pages', label: 'Pages', icon: FileText },
      { to: '/admin/legacy', label: 'Legacy', icon: History },
      { to: '/admin/jl26', label: "JL'26", icon: Trophy },
      { to: '/admin/press', label: 'Media & Press', icon: Newspaper },
      { to: '/admin/sponsors', label: 'Sponsors', icon: Handshake },
      { to: '/admin/gallery', label: 'Gallery', icon: Images },
    ],
  },
  {
    label: 'Library & site',
    items: [
      { to: '/admin/media', label: 'Media Library', icon: FolderOpen },
      { to: '/admin/social', label: 'Social Networks', icon: Share2 },
      { to: '/admin/settings', label: 'Website Settings', icon: Settings },
    ],
  },
  {
    label: 'Inbox & account',
    items: [
      { to: '/admin/messages', label: 'Contact Messages', icon: Inbox, badge: true },
      { to: '/admin/account', label: 'Admin Account', icon: UserCog },
    ],
  },
]

function Sidebar({ unread, onNavigate }) {
  const { user, logout } = useAuth()
  return (
    <div className="flex h-full flex-col bg-cms-side">
      <div className="flex h-16 shrink-0 items-center gap-0.5 border-b border-cms-border px-5">
        <div>
          <img className='h-9 w-10 lg:h-11 lg:w-12' src={`${import.meta.env.BASE_URL}logo.png`} alt="logo" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-cms-text">Jinnah League</p>
          <p className="text-xs text-cms-faint">Content manager</p>
        </div>
      </div>

      <nav aria-label="CMS" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((g, i) => (
          <div key={i}>
            {g.label && <p className="mb-1.5 px-3 text-xs font-medium text-cms-faint">{g.label}</p>}
            <ul className="space-y-0.5">
              {g.items.map(({ to, label, icon: Icon, end, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60',
                        isActive ? 'bg-cms-accent/15 font-medium text-white' : 'text-cms-muted hover:bg-cms-raised hover:text-cms-text',
                      )
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="flex-1 truncate">{label}</span>
                    {badge && unread > 0 && (
                      <span className="rounded-full bg-cms-accent px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white" aria-label={`${unread} unread`}>
                        {unread}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-cms-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cms-raised text-sm font-medium text-cms-text">
            {(user?.name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-cms-text">{user?.name}</p>
            <p className="truncate text-xs text-cms-faint">{user?.email}</p>
          </div>
          <button onClick={logout} aria-label="Sign out" title="Sign out" className="rounded-md p-2 text-cms-muted hover:bg-cms-raised hover:text-cms-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CmsLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { data, reload } = useFetch('/dashboard')
  const unread = data?.counts?.unreadMessages ?? 0

  useEffect(() => { setOpen(false); reload() }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-cms-bg text-cms-text">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-cms-bg lg:block">
        <Sidebar unread={unread} />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-cms-border lg:hidden"
              aria-label="Navigation"
            >
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-cms-muted hover:text-cms-text">
                <X size={18} />
              </button>
              <Sidebar unread={unread} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-cms-border bg-cms-bg/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-md p-2 text-cms-muted hover:bg-cms-raised hover:text-cms-text lg:hidden">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Link to="/" target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-cms-border px-3 py-1.5 text-sm text-cms-muted hover:bg-cms-raised hover:text-cms-text">
            View website <ExternalLink size={14} />
          </Link>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
