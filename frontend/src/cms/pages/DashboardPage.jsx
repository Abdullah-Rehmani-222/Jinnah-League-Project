import { Link } from 'react-router-dom'
import { FileText, FolderOpen, Images, Inbox, Presentation, Handshake, Newspaper, Share2, ArrowRight } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { useFetch } from '../lib/hooks'
import { formatDateTime } from '../lib/format'
import { Card, PageHeader } from '../ui/Layout'
import { EmptyState, ErrorState, LoadingBlock, StatusBadge } from '../ui/Feedback'

const tiles = [
  { key: 'contactMessages', label: 'Messages', to: '/admin/messages', icon: Inbox },
  { key: 'pages', label: 'Pages', to: '/admin/pages', icon: FileText },
  { key: 'mediaAssets', label: 'Media files', to: '/admin/media', icon: FolderOpen },
  { key: 'galleryItems', label: 'Gallery images', to: '/admin/gallery', icon: Images },
  { key: 'heroSlides', label: 'Hero slides', to: '/admin/hero', icon: Presentation },
  { key: 'sponsorTiers', label: 'Sponsor tiers', to: '/admin/sponsors', icon: Handshake },
  { key: 'pressItems', label: 'Press items', to: '/admin/press', icon: Newspaper },
  { key: 'socialLinks', label: 'Social links', to: '/admin/social', icon: Share2 },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, loading, error, reload } = useFetch('/dashboard')

  return (
    <>
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'admin'}`} description="Everything on the website is managed from here. Pick a section to get started." />

      {error && !data ? (
        <Card><ErrorState error={error} onRetry={reload} /></Card>
      ) : loading && !data ? (
        <LoadingBlock />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3" aria-labelledby="content-heading">
            <h2 id="content-heading" className="mb-3 text-sm font-medium text-cms-muted">Your content</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {tiles.map(({ key, label, to, icon: Icon }) => (
                <li key={key}>
                  <Link to={to} className="group flex h-full flex-col rounded-xl border border-cms-border bg-cms-surface p-4 transition-colors hover:border-cms-accent/60 hover:bg-cms-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60">
                    <Icon size={18} className="text-cms-faint group-hover:text-cms-accent" />
                    <span className="mt-3 text-2xl font-semibold text-cms-text">{data.counts[key]}</span>
                    <span className="text-xs text-cms-muted">
                      {label}
                      {key === 'contactMessages' && data.counts.unreadMessages > 0 && <span className="text-sky-300"> · {data.counts.unreadMessages} unread</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="lg:col-span-2" aria-labelledby="recent-heading">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="recent-heading" className="text-sm font-medium text-cms-muted">Latest messages</h2>
              <Link to="/admin/messages" className="inline-flex items-center gap-1 text-xs text-cms-accent hover:underline">View all <ArrowRight size={12} /></Link>
            </div>
            <Card>
              {data.recentMessages.length === 0 ? (
                <EmptyState icon={Inbox} title="No messages yet" description="Contact form submissions will show up here." />
              ) : (
                <ul className="divide-y divide-cms-border">
                  {data.recentMessages.map((m) => (
                    <li key={m.id}>
                      <Link to="/admin/messages" state={{ open: m.id }} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-cms-raised">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-cms-text">{m.name}</p>
                          <p className="truncate text-xs text-cms-muted">{m.subject || 'No subject'} · {formatDateTime(m.createdAt)}</p>
                        </div>
                        <StatusBadge status={m.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </div>
      )}
    </>
  )
}
