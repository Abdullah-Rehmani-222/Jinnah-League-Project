import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'

const control =
  'w-full rounded-lg border bg-cms-input px-3 text-sm text-cms-text placeholder:text-cms-faint transition-colors ' +
  'focus:outline-none focus:ring-2 focus:ring-cms-accent/40 disabled:cursor-not-allowed disabled:opacity-60'

const border = (error) => (error ? 'border-red-500/60 focus:border-red-500' : 'border-cms-border focus:border-cms-accent')

export function Field({ label, htmlFor, hint, error, required, children, className }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-cms-text">
          {label}
          {required && <span className="ml-0.5 text-red-400" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={htmlFor && `${htmlFor}-error`} role="alert" className="text-xs text-red-400">{error}</p>
      ) : (
        hint && <p id={htmlFor && `${htmlFor}-hint`} className="text-xs text-cms-faint">{hint}</p>
      )}
    </div>
  )
}

export function TextField({ label, hint, error, required, className, inputClassName, ...props }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, 'h-9', border(error), inputClassName)}
        {...props}
      />
    </Field>
  )
}

export function TextAreaField({ label, hint, error, required, rows = 4, className, ...props }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, 'resize-y py-2 leading-relaxed', border(error))}
        {...props}
      />
    </Field>
  )
}

export function SelectField({ label, hint, error, required, options, className, ...props }) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select id={id} aria-invalid={Boolean(error)} className={cn(control, 'h-9 appearance-none pr-9', border(error))} {...props}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cms-faint" />
      </div>
    </Field>
  )
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cms-surface',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-cms-accent' : 'bg-slate-600',
      )}
    >
      <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
    </button>
  )
}

/** "Visible on website" switch bound to a PUBLISHED/DRAFT status string. */
export function VisibilityField({ status, onChange, label = 'Visible on website', hint }) {
  const published = status === 'PUBLISHED'
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-cms-border bg-cms-input px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-cms-text">{label}</p>
        <p className="text-xs text-cms-faint">{hint ?? (published ? 'Published: visitors can see this.' : 'Draft: hidden from visitors.')}</p>
      </div>
      <Toggle checked={published} onChange={(v) => onChange(v ? 'PUBLISHED' : 'DRAFT')} label={label} />
    </div>
  )
}
