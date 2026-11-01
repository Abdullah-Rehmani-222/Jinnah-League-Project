import { AlertTriangle, Loader2, RotateCw } from 'lucide-react'
import Button from './Button'
import { cn } from '../lib/cn'

export function Spinner({ className }) {
  return <Loader2 className={cn('animate-spin text-cms-muted', className)} size={20} aria-hidden="true" />
}

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-cms-muted" role="status">
      <Spinner /> {label}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cms-raised text-cms-muted">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-cms-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-cms-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-sm font-semibold text-cms-text">Couldn’t load this</h3>
      <p className="mt-1 max-w-sm text-sm text-cms-muted">{error?.message || 'Something went wrong.'}</p>
      {onRetry && <Button className="mt-4" icon={RotateCw} onClick={onRetry}>Try again</Button>}
    </div>
  )
}

const badgeTones = {
  green: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  amber: 'bg-amber-500/10 text-amber-300 ring-amber-500/25',
  blue: 'bg-sky-500/10 text-sky-300 ring-sky-500/25',
  slate: 'bg-slate-500/15 text-slate-300 ring-slate-500/25',
}

export function Badge({ tone = 'slate', children, className }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', badgeTones[tone], className)}>
      {children}
    </span>
  )
}

const statusMap = {
  PUBLISHED: ['green', 'Published'],
  DRAFT: ['amber', 'Draft'],
  ARCHIVED: ['slate', 'Archived'],
  UNREAD: ['blue', 'Unread'],
  READ: ['slate', 'Read'],
  RESOLVED: ['green', 'Resolved'],
}
export function StatusBadge({ status }) {
  const [tone, label] = statusMap[status] ?? ['slate', status]
  return <Badge tone={tone}>{label}</Badge>
}
