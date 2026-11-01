import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '../lib/cn'
import Button from './Button'

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-cms-text sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-cms-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ className, children, ...props }) {
  return (
    <div className={cn('rounded-xl border border-cms-border bg-cms-surface', className)} {...props}>
      {children}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cms-faint" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-lg border border-cms-border bg-cms-input pl-9 pr-3 text-sm text-cms-text placeholder:text-cms-faint focus:border-cms-accent focus:outline-none focus:ring-2 focus:ring-cms-accent/40"
      />
    </div>
  )
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg border border-cms-border bg-cms-input p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60',
            value === o.value ? 'bg-cms-hover text-cms-text' : 'text-cms-muted hover:text-cms-text',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-3 border-t border-cms-border px-4 py-3 text-sm text-cms-muted">
      <span>Page {meta.page} of {meta.totalPages} · {meta.total} items</span>
      <div className="flex gap-2">
        <Button size="sm" icon={ChevronLeft} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Previous</Button>
        <Button size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
