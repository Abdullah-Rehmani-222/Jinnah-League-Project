import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../lib/cn'

const ToastContext = createContext(null)
export const useToast = () => useContext(ToastContext)

const styles = {
  success: { icon: CheckCircle2, cls: 'text-emerald-400' },
  error: { icon: AlertCircle, cls: 'text-red-400' },
  info: { icon: Info, cls: 'text-sky-400' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const id = useRef(0)

  const dismiss = useCallback((tid) => setToasts((t) => t.filter((x) => x.id !== tid)), [])
  const push = useCallback((type, message) => {
    const tid = ++id.current
    setToasts((t) => [...t.slice(-3), { id: tid, type, message }])
    setTimeout(() => dismiss(tid), type === 'error' ? 6000 : 3500)
  }, [dismiss])

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const { icon: Icon, cls } = styles[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-cms-border bg-cms-raised px-4 py-3 text-sm text-cms-text shadow-xl shadow-black/40"
              >
                <Icon size={18} className={cn('mt-0.5 shrink-0', cls)} />
                <p className="flex-1 leading-snug">{t.message}</p>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-cms-faint hover:text-cms-text">
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
