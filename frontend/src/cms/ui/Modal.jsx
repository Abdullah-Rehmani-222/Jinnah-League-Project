import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

export default function Modal({ open, onOpenChange, title, description, children, footer, size = 'md' }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={description ? undefined : undefined}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[calc(100vw-1.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col',
            'rounded-xl border border-cms-border bg-cms-surface text-cms-text shadow-2xl shadow-black/60 focus:outline-none',
            sizes[size],
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-cms-border px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-cms-text">{title}</Dialog.Title>
              {description && <Dialog.Description className="mt-1 text-sm text-cms-muted">{description}</Dialog.Description>}
            </div>
            <Dialog.Close className="rounded-md p-1 text-cms-muted hover:bg-cms-hover hover:text-cms-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-cms-border px-5 py-3">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
