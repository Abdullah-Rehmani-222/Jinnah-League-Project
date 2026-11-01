import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CheckCircle2, Inbox, Mail, MailOpen, Reply, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useDebounce, useFetch } from '../lib/hooks'
import { formatDateTime } from '../lib/format'
import { cn } from '../lib/cn'
import { Card, PageHeader, Pagination, SearchInput, Segmented } from '../ui/Layout'
import { EmptyState, ErrorState, LoadingBlock, StatusBadge } from '../ui/Feedback'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import { useToast } from '../ui/Toast'

const filters = [
  { value: 'ALL', label: 'All' },
  { value: 'UNREAD', label: 'Unread' },
  { value: 'READ', label: 'Read' },
  { value: 'RESOLVED', label: 'Resolved' },
]

function MessageDialog({ id, onClose, onChanged }) {
  const toast = useToast()
  const { data: msg, error, reload } = useFetch(`/contact/${id}`)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  // Opening an unread message marks it as read.
  useEffect(() => {
    if (msg?.status === 'UNREAD') {
      api.patch(`/contact/${id}/status`, { status: 'READ' }).then(() => { reload(); onChanged() }).catch(() => {})
    }
  }, [msg?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (status) => {
    setBusy(true)
    try {
      await api.patch(`/contact/${id}/status`, { status })
      toast.success(`Marked as ${status.toLowerCase()}.`)
      reload()
      onChanged()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Modal
        open
        onOpenChange={(v) => !v && onClose()}
        size="lg"
        title={msg?.subject || 'Message'}
        description={msg ? `From ${msg.name} · ${formatDateTime(msg.createdAt)}` : undefined}
        footer={
          msg && (
            <>
              <Button variant="danger" icon={Trash2} onClick={() => setConfirm(true)} className="mr-auto">Delete</Button>
              <Button icon={MailOpen} disabled={busy || msg.status === 'UNREAD'} onClick={() => setStatus('UNREAD')}>Mark unread</Button>
              {msg.status !== 'RESOLVED' ? (
                <Button variant="primary" icon={CheckCircle2} loading={busy} onClick={() => setStatus('RESOLVED')}>Mark resolved</Button>
              ) : (
                <Button icon={Mail} loading={busy} onClick={() => setStatus('READ')}>Reopen</Button>
              )}
            </>
          )
        }
      >
        {error && !msg ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !msg ? (
          <LoadingBlock />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-cms-text">{msg.name}</p>
                <a href={`mailto:${msg.email}`} className="text-sm text-cms-accent hover:underline">{msg.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={msg.status} />
                <a href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject || 'Your message to Jinnah League'}`)}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-cms-border bg-cms-raised px-3 text-xs font-medium text-cms-text hover:bg-cms-hover">
                  <Reply size={14} /> Reply by email
                </a>
              </div>
            </div>
            <p className="whitespace-pre-wrap break-words rounded-lg border border-cms-border bg-cms-input p-4 text-sm leading-relaxed text-cms-text">{msg.message}</p>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this message?"
        description="The message will be permanently removed."
        onConfirm={async () => {
          try {
            await api.del(`/contact/${id}`)
            toast.success('Message deleted.')
            onChanged()
            onClose()
          } catch (err) {
            toast.error(err.message)
            throw err
          }
        }}
      />
    </>
  )
}

export default function MessagesPage() {
  const location = useLocation()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState(location.state?.open ?? null)
  const dq = useDebounce(q)
  const { data, meta, loading, error, reload } = useFetch('/contact', { page, limit: 20, q: dq || undefined, status: status === 'ALL' ? undefined : status })
  const items = data ?? []
  const filtered = Boolean(dq) || status !== 'ALL'

  return (
    <>
      <PageHeader title="Contact Messages" description="Messages sent through the website’s contact form. Only administrators can see them." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Search name, email or message" className="sm:w-80" />
        <div className="overflow-x-auto"><Segmented label="Filter by status" value={status} onChange={(v) => { setStatus(v); setPage(1) }} options={filters} /></div>
      </div>

      <Card className="overflow-hidden">
        {error && !data ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title={filtered ? 'No messages match' : 'No messages yet'} description={filtered ? 'Try a different search or filter.' : 'When someone uses the contact form, their message will appear here.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-cms-border text-xs text-cms-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Subject</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Received</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y divide-cms-border', loading && 'opacity-60')}>
                {items.map((m) => (
                  <tr key={m.id} onClick={() => setOpenId(m.id)} className="cursor-pointer hover:bg-cms-raised/50">
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); setOpenId(m.id) }} className={cn('block max-w-[14rem] truncate text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60', m.status === 'UNREAD' ? 'font-semibold text-cms-text' : 'text-cms-text')}>{m.name}</button>
                      <span className="block max-w-[14rem] truncate text-xs text-cms-muted">{m.email}</span>
                    </td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-cms-muted md:table-cell">{m.subject || 'No subject'}</td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-cms-muted lg:table-cell">{formatDateTime(m.createdAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPage={setPage} />
      </Card>

      {openId && <MessageDialog key={openId} id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
    </>
  )
}
