import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, LayoutList, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { api } from '../lib/api'
import { useFetch } from '../lib/hooks'
import { slugify } from '../lib/format'
import { Card, PageHeader } from '../ui/Layout'
import { ErrorState, LoadingBlock, StatusBadge, Badge, EmptyState } from '../ui/Feedback'
import { SelectField, TextAreaField, TextField, Toggle, VisibilityField } from '../ui/Fields'
import { MediaField } from '../ui/MediaPicker'
import Button, { IconButton } from '../ui/Button'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import { useToast } from '../ui/Toast'

const sectionTypes = [
  { value: 'text', label: 'Text' },
  { value: 'cards', label: 'Cards' },
  { value: 'stats', label: 'Numbers' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'image', label: 'Image' },
  { value: 'cta', label: 'Call to action' },
]
const typeLabel = (t) => sectionTypes.find((x) => x.value === t)?.label ?? t

// Fields of each repeated item, per section type.
const itemFields = {
  cards: [['title', 'Title'], ['description', 'Description']],
  stats: [['value', 'Number'], ['label', 'Label']],
  timeline: [['year', 'Year'], ['title', 'Title'], ['description', 'Description']],
}
const itemNoun = { cards: 'card', stats: 'number', timeline: 'milestone' }

/** Public pages that already exist on the site, so "View on website" only appears when it works. */
const publicRoutes = { home: '/', about: '/about', legacy: '/legacy', jl26: '/jl26', sponsors: '/sponsors', media: '/media', gallery: '/gallery', contact: '/contact' }
const SYSTEM = Object.keys(publicRoutes)

function ItemsEditor({ type, items, onChange }) {
  const fields = itemFields[type]
  const noun = itemNoun[type]
  const blank = Object.fromEntries(fields.map(([k]) => [k, '']))
  const update = (i, k, v) => onChange(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)))
  return (
    <div className="space-y-3">
      <span className="block text-sm font-medium text-cms-text">{noun.charAt(0).toUpperCase() + noun.slice(1)}s</span>
      {items.map((it, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-cms-border bg-cms-input p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-cms-faint">{noun.charAt(0).toUpperCase() + noun.slice(1)} {i + 1}</span>
            <IconButton icon={X} label={`Remove ${noun} ${i + 1}`} onClick={() => onChange(items.filter((_, idx) => idx !== i))} />
          </div>
          {fields.map(([k, label]) =>
            k === 'description' ? (
              <TextAreaField key={k} label={label} rows={2} value={it[k] ?? ''} onChange={(e) => update(i, k, e.target.value)} />
            ) : (
              <TextField key={k} label={label} value={it[k] ?? ''} onChange={(e) => update(i, k, e.target.value)} />
            ),
          )}
        </div>
      ))}
      <Button size="sm" icon={Plus} onClick={() => onChange([...items, { ...blank }])}>Add {noun}</Button>
    </div>
  )
}

function SectionDialog({ base, section, onClose, onSaved }) {
  const toast = useToast()
  const editing = Boolean(section)
  const c = section?.content ?? {}
  const [form, setForm] = useState({
    sectionType: section?.sectionType ?? 'text',
    title: section?.title ?? '',
    status: section?.status ?? 'PUBLISHED',
    body: c.body ?? '',
    items: c.items ?? [],
    media: c.imageUrl ? { id: c.mediaAssetId, fileUrl: c.imageUrl, altText: c.altText, mimeType: 'image/*', originalName: c.altText || 'Selected image' } : null,
    buttonText: c.buttonText ?? '',
    buttonUrl: c.buttonUrl ?? '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))
  const t = form.sectionType

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() && !form.body.trim() && !form.items.length && !form.media) return setErrors({ title: 'Add a title or some content.' })
    const content = {}
    if (form.body.trim()) content.body = form.body.trim()
    if (itemFields[t]) content.items = form.items.filter((it) => Object.values(it).some((v) => String(v).trim()))
    if (t === 'image' && form.media) Object.assign(content, { mediaAssetId: form.media.id, imageUrl: form.media.fileUrl, altText: form.media.altText ?? '' })
    if (t === 'cta') Object.assign(content, { buttonText: form.buttonText.trim(), buttonUrl: form.buttonUrl.trim() })
    setSaving(true)
    setErrors({})
    try {
      const payload = { sectionType: t, title: form.title.trim(), status: form.status, content }
      if (editing) await api.patch(`${base}/sections/${section.id}`, payload)
      else await api.post(`${base}/sections`, payload)
      toast.success(editing ? 'Section updated.' : 'Section added.')
      onSaved()
      onClose()
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {})
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onOpenChange={(v) => !v && !saving && onClose()}
      size="lg"
      title={editing ? 'Edit section' : 'Add section'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" type="submit" form="section-form" loading={saving}>{editing ? 'Save changes' : 'Add section'}</Button>
        </>
      }
    >
      <form id="section-form" onSubmit={submit} noValidate className="space-y-4">
        <SelectField label="Section type" options={sectionTypes} value={t} error={errors.sectionType} onChange={(e) => set({ sectionType: e.target.value })} />
        <TextField label="Heading" value={form.title} error={errors.title} onChange={(e) => set({ title: e.target.value })} />
        <TextAreaField label={t === 'cta' ? 'Message' : t === 'image' ? 'Caption' : 'Text'} rows={t === 'text' ? 7 : 3} value={form.body} onChange={(e) => set({ body: e.target.value })} />
        {t === 'image' && <MediaField label="Image" value={form.media} onChange={(media) => set({ media })} hint="The image is stored by its web address, so keep it in the Media Library." />}
        {itemFields[t] && <ItemsEditor type={t} items={form.items} onChange={(items) => set({ items })} />}
        {t === 'cta' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Button label" value={form.buttonText} onChange={(e) => set({ buttonText: e.target.value })} />
            <TextField label="Button link" placeholder="#/contact or https://…" value={form.buttonUrl} onChange={(e) => set({ buttonUrl: e.target.value })} />
          </div>
        )}
        <VisibilityField status={form.status} onChange={(status) => set({ status })} />
      </form>
    </Modal>
  )
}

/**
 * Edits one CMS page and its sections.
 * base: '/pages/:id' for custom pages, or '/legacy' | '/jl26' for the fixed modules.
 */
export function PageEditor({ base, system = false, heading, description, backTo }) {
  const toast = useToast()
  const navigate = useNavigate()
  const { data: page, loading, error, reload } = useFetch(base)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deletePage, setDeletePage] = useState(false)
  const [local, setLocal] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!page) return
    setForm({ title: page.title, slug: page.slug, description: page.description ?? '', status: page.status, metaTitle: page.metaTitle ?? '', metaDescription: page.metaDescription ?? '' })
    setLocal(null)
  }, [page])

  if (error && !page) return <Card><ErrorState error={error} onRetry={reload} /></Card>
  if (!page || !form) return <LoadingBlock />

  const sections = local ?? page.sections ?? []
  const isSystemSlug = SYSTEM.includes(page.slug)
  const viewPath = publicRoutes[page.slug]
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const saveDetails = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = { title: form.title.trim(), description: form.description.trim(), status: form.status, metaTitle: form.metaTitle.trim(), metaDescription: form.metaDescription.trim() }
      if (!system && !isSystemSlug) payload.slug = form.slug
      await api.patch(base, payload)
      toast.success('Page saved.')
      reload()
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {})
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const move = async (i, dir) => {
    const next = [...sections]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setLocal(next)
    setBusy(true)
    try {
      await api.patch(`${base}/sections/reorder`, { ids: next.map((s) => s.id) })
    } catch (err) {
      toast.error(err.message)
      setLocal(null)
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (s, on) => {
    try {
      await api.patch(`${base}/sections/${s.id}`, { status: on ? 'PUBLISHED' : 'DRAFT' })
      toast.success(on ? 'Section is now visible.' : 'Section is now hidden.')
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <>
      {backTo && (
        <Link to={backTo} className="mb-3 inline-flex items-center gap-1.5 text-sm text-cms-muted hover:text-cms-text"><ArrowLeft size={15} /> All pages</Link>
      )}
      <PageHeader
        title={heading ?? page.title}
        description={description}
        actions={
          <>
            {viewPath && <Link to={viewPath} target="_blank" className="inline-flex h-9 items-center gap-2 rounded-lg border border-cms-border bg-cms-raised px-4 text-sm font-medium text-cms-text hover:bg-cms-hover">View on website <ExternalLink size={14} /></Link>}
            {!system && !isSystemSlug && <Button variant="danger" icon={Trash2} onClick={() => setDeletePage(true)}>Delete page</Button>}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={saveDetails} noValidate className="space-y-4 lg:col-span-2">
          <Card className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-cms-text">Page details</h2>
            <TextField label="Title" required value={form.title} error={errors.title} onChange={(e) => set({ title: e.target.value })} />
            <TextAreaField label="Intro" rows={3} value={form.description} error={errors.description} onChange={(e) => set({ description: e.target.value })} />
            <VisibilityField status={form.status} onChange={(status) => set({ status })} label="Published" hint={form.status === 'PUBLISHED' ? 'Visitors can see this page.' : 'Hidden from visitors.'} />
            <details className="group rounded-lg border border-cms-border">
              <summary className="cursor-pointer select-none px-3 py-2.5 text-sm text-cms-muted hover:text-cms-text">Address and search settings</summary>
              <div className="space-y-4 border-t border-cms-border p-3">
                <TextField label="Page address (slug)" value={form.slug} error={errors.slug} disabled={system || isSystemSlug} hint={system || isSystemSlug ? 'The address of this page is fixed.' : 'Lowercase letters, numbers and hyphens.'} onChange={(e) => set({ slug: slugify(e.target.value) })} />
                <TextField label="Search title" value={form.metaTitle} error={errors.metaTitle} onChange={(e) => set({ metaTitle: e.target.value })} />
                <TextAreaField label="Search description" rows={3} value={form.metaDescription} error={errors.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} />
              </div>
            </details>
            <Button variant="primary" type="submit" icon={Save} loading={saving} className="w-full">Save page</Button>
          </Card>
        </form>

        <section className="lg:col-span-3" aria-labelledby="sections-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="sections-heading" className="text-sm font-medium text-cms-muted">Sections ({sections.length})</h2>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setDialog({})}>Add section</Button>
          </div>
          <Card>
            {sections.length === 0 ? (
              <EmptyState icon={LayoutList} title="No sections yet" description="Sections are the building blocks of this page: text, cards, numbers, images and more." action={<Button variant="primary" icon={Plus} onClick={() => setDialog({})}>Add section</Button>} />
            ) : (
              <ul className="divide-y divide-cms-border">
                {sections.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                    <div className="flex shrink-0 flex-col">
                      <IconButton icon={ArrowUp} label="Move section up" disabled={busy || i === 0} onClick={() => move(i, -1)} className="h-6 w-6" />
                      <IconButton icon={ArrowDown} label="Move section down" disabled={busy || i === sections.length - 1} onClick={() => move(i, 1)} className="h-6 w-6" />
                    </div>
                    <button onClick={() => setDialog({ section: s })} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60">
                      <span className="block truncate text-sm font-medium text-cms-text">{s.title || 'Untitled section'}</span>
                      <span className="mt-1 flex items-center gap-2"><Badge tone="blue">{typeLabel(s.sectionType)}</Badge><StatusBadge status={s.status} /></span>
                    </button>
                    <Toggle checked={s.status === 'PUBLISHED'} onChange={(v) => toggle(s, v)} label={`Show ${s.title || 'section'} on website`} />
                    <div className="flex shrink-0">
                      <IconButton icon={Pencil} label="Edit section" onClick={() => setDialog({ section: s })} />
                      <IconButton icon={Trash2} variant="danger" label="Delete section" onClick={() => setToDelete(s)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>

      {dialog && <SectionDialog base={base} section={dialog.section} onClose={() => setDialog(null)} onSaved={reload} />}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete this section?"
        description={toDelete ? `“${toDelete.title || 'Untitled section'}” will be removed from the page.` : ''}
        onConfirm={async () => {
          try { await api.del(`${base}/sections/${toDelete.id}`); toast.success('Section deleted.'); reload() } catch (err) { toast.error(err.message); throw err }
        }}
      />
      <ConfirmDialog
        open={deletePage}
        onOpenChange={setDeletePage}
        title="Delete this page?"
        description="The page and all of its sections will be permanently removed."
        onConfirm={async () => {
          try { await api.del(base); toast.success('Page deleted.'); navigate(backTo ?? '/admin/pages') } catch (err) { toast.error(err.message); throw err }
        }}
      />
    </>
  )
}

export const LegacyEditor = () => (
  <PageEditor base="/legacy" system heading="Legacy" description="Manage the JL’24 — National Expansion section." />
)
export const JL26Editor = () => (
  <PageEditor base="/jl26" system heading="JL’26" description="Manage the Competitions & Events section." />
)
export function CustomPageEditor() {
  const { id } = useParams()
  return <PageEditor key={id} base={`/pages/${id}`} backTo="/admin/pages" />
}
