import { Loader2 } from 'lucide-react'
import { cn } from '../lib/cn'

const variants = {
  primary: 'bg-cms-accent text-white hover:bg-cms-accent-hover',
  secondary: 'bg-cms-raised text-cms-text border border-cms-border hover:bg-cms-hover',
  ghost: 'text-cms-muted hover:text-cms-text hover:bg-cms-raised',
  danger: 'bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20',
  dangerSolid: 'bg-red-600 text-white hover:bg-red-500',
}
const sizes = { sm: 'h-8 px-3 text-xs gap-1.5', md: 'h-9 px-4 text-sm gap-2', lg: 'h-10 px-5 text-sm gap-2' }

export default function Button({ variant = 'secondary', size = 'md', loading = false, icon: Icon, children, className, disabled, type = 'button', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cms-bg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : Icon ? <Icon size={15} /> : null}
      {children}
    </button>
  )
}

export function IconButton({ icon: Icon, label, variant = 'ghost', className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'danger' ? 'text-cms-muted hover:bg-red-500/10 hover:text-red-300' : 'text-cms-muted hover:bg-cms-hover hover:text-cms-text',
        className,
      )}
      {...props}
    >
      <Icon size={16} />
    </button>
  )
}
