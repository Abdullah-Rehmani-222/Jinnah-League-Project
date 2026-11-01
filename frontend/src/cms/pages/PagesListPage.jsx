import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Lock, Plus } from 'lucide-react'
import { api } from '../lib/api'
import { useDebounce, useFetch } from '../lib/hooks'
import { formatDate, slugify } from '../lib/format'
import { cn } from '../lib/cn'
import { Card, PageHeader, Pagination, SearchInput, Segmented } from '../ui/Layout'
import { EmptyState, ErrorState, LoadingBlock, StatusBadge } from '../ui/Feedback'
import { TextAreaField, TextField } from '../ui/Fields'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { useToast } from '../ui/Toast'

const SYSTEM = ['home', 'about', 'legacy', 'jl26', 'sponsors', 'media', 'gallery', 'contact']
const statusFilters = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
]

function CreateDialog({ onClose }) {
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', slug: '', description: '' })
  const [slugEdited, setSlugEdited] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setErrors({ title: 'Title is required.' })
    if (!form.slug) return setErrors({ slug: 'Page address is required.' })
    setSaving(true)
    try {
      const res = await api.post('/pages', { title: form.title.trim(), slug: form.slug, description: form.description.trim() })
      toast.success('Page created. Add its sections next.')
      navigate(`/admin/pages/${res.data.id}`)
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {})
      toast.error(err.status === 409 ? 'A page with this address already exists.' : err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onOpenChange={(v) => !v && !saving && onClose()}
      title="New page"
      description="Pages start as drafts, so nothing appears on the website until you publish."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" type="submit" form="page-form" loading={saving}>Create page</Button>
        </>
      }
    >
      <form id="page-form" onSubmit={submit} noValidate className="space-y-4">
        <TextField label="Title" required value={form.title} error={errors.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: slugEdited ? f.slug : slugify(e.target.value) }))} />
        <TextField label="Page address (slug)" required value={form.slug} error={errors.slug} hint="Lowercase letters, numbers and hyphens." onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: slugify(e.target.value) })) }} />
        <TextAreaField label="Intro" rows={3} value={form.description} error={errors.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </form>
    </Modal>
  )
}

export default function PagesListPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const dq = useDebounce(q)
  const { data, meta, loading, error, reload } = useFetch('/pages', { page, limit: 20, q: dq || undefined, status: status === 'ALL' ? undefined : status, sort: 'title', order: 'asc' })
  const items = data ?? []
  const filtered = Boolean(dq) || status !== 'ALL'

  return (
    <>
      <PageHeader
        title="Pages"
        description="Create pages and manage their sections. Pages marked as system pages are part of the website and can’t be deleted."
        actions={<Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>New page</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Search title or address" className="sm:w-72" />
        <Segmented label="Filter by status" value={status} onChange={(v) => { setStatus(v); setPage(1) }} options={statusFilters} />
      </div>

      <Card className="overflow-hidden">
        {error && !data ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <EmptyState icon={FileText} title={filtered ? 'No pages match' : 'No pages yet'} description={filtered ? 'Try a different search or filter.' : 'Create your first page to get started.'} action={!filtered && <Button variant="primary" icon={Plus} onClick={() => setCreating(true)}>New page</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-cms-border text-xs text-cms-faint">
                <tr>
                  <th className="px-4 py-3 font-medium">Page</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Sections</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Updated</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y divide-cms-border', loading && 'opacity-60')}>
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-cms-raised/50">
                    <td className="px-4 py-3">
                      <Link to={`/admin/pages/${p.id}`} className="flex items-center gap-2 font-medium text-cms-text hover:text-cms-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60">
                        {p.title}
                        {SYSTEM.includes(p.slug) && <span title="System page" className="text-cms-faint"><Lock size={13} /><span className="sr-only">System page</span></span>}
                      </Link>
                      <span className="block text-xs text-cms-muted">/{p.slug}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-cms-muted md:table-cell">{p._count?.sections ?? 0}</td>
                    <td className="hidden px-4 py-3 text-cms-muted lg:table-cell">{formatDate(p.updatedAt)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={meta} onPage={setPage} />
      </Card>

      {creating && <CreateDialog onClose={() => setCreating(false)} />}
    </>
  )
}
