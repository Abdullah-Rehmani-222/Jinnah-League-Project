import { useRef, useState } from 'react'
import { Copy, FileText, FolderOpen, ImagePlus, Trash2, UploadCloud } from 'lucide-react'
import { api } from '../lib/api'
import { useDebounce, useFetch } from '../lib/hooks'
import { uploadFiles, ACCEPT } from '../lib/upload'
import { assetUrl, formatBytes, formatDateTime, isImageAsset } from '../lib/format'
import { cn } from '../lib/cn'
import { PageHeader, Card, SearchInput, Segmented, Pagination } from '../ui/Layout'
import { EmptyState, ErrorState, LoadingBlock, Badge } from '../ui/Feedback'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import { SelectField, TextField } from '../ui/Fields'
import { useToast } from '../ui/Toast'

const typeOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'IMAGE', label: 'Images' },
  { value: 'LOGO', label: 'Logos' },
  { value: 'BANNER', label: 'Banners' },
  { value: 'DOCUMENT', label: 'Documents' },
]
const imageKinds = [{ value: 'IMAGE', label: 'Image' }, { value: 'LOGO', label: 'Logo' }, { value: 'BANNER', label: 'Banner' }]
const docKinds = [{ value: 'DOCUMENT', label: 'Document' }, { value: 'OTHER', label: 'Other' }]

const usageLabels = {
  galleryItems: 'gallery items',
  heroSlides: 'hero slides',
  sponsorTiers: 'sponsor tiers',
  pressItems: 'press items',
  websiteSettings: 'website settings',
}

function AssetDialog({ asset, onClose, onChanged }) {
  const toast = useToast()
  const { data: detail } = useFetch(asset ? `/media/${asset.id}` : null)
  const [form, setForm] = useState({ originalName: asset.originalName, altText: asset.altText ?? '', fileType: asset.fileType })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const image = isImageAsset(asset)
  const usage = detail?.usage
  const inUse = usage && usage.total > 0

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await api.patch(`/media/${asset.id}`, { originalName: form.originalName, altText: form.altText, fileType: form.fileType })
      toast.success('File details saved.')
      onChanged()
      onClose()
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {})
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(assetUrl(asset))
      toast.success('File URL copied.')
    } catch {
      toast.error('Couldn’t copy automatically. Select and copy the URL manually.')
    }
  }

  return (
    <>
      <Modal
        open
        onOpenChange={(v) => !v && onClose()}
        size="lg"
        title="File details"
        footer={
          <>
            <Button variant="danger" icon={Trash2} onClick={() => setConfirm(true)} disabled={inUse} className="mr-auto" title={inUse ? 'Remove it from website content first' : undefined}>Delete</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" form="asset-form" loading={saving}>Save changes</Button>
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-cms-border bg-cms-input">
              {image ? <img src={assetUrl(asset)} alt={asset.altText || asset.originalName} className="max-h-full max-w-full object-contain" /> : <FileText size={48} className="text-cms-faint" />}
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-cms-faint">Type</dt><dd className="text-cms-text">{asset.mimeType}</dd>
              <dt className="text-cms-faint">Size</dt><dd className="text-cms-text">{formatBytes(asset.fileSize)}</dd>
              <dt className="text-cms-faint">Uploaded</dt><dd className="text-cms-text">{formatDateTime(asset.createdAt)}</dd>
              <dt className="text-cms-faint">Used in</dt>
              <dd className="text-cms-text">
                {!usage ? '…' : !inUse ? 'Not used anywhere' : Object.entries(usageLabels).filter(([k]) => usage[k] > 0).map(([k, l]) => `${usage[k]} ${l}`).join(', ')}
              </dd>
            </dl>
          </div>

          <form id="asset-form" onSubmit={save} className="space-y-4">
            <TextField label="File name" required value={form.originalName} error={errors.originalName} onChange={(e) => setForm({ ...form, originalName: e.target.value })} />
            {image && <TextField label="Alternative text" hint="Describe the image for screen readers and search engines." value={form.altText} error={errors.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} />}
            <SelectField label="Category" options={image ? imageKinds : docKinds} value={form.fileType} error={errors.fileType} onChange={(e) => setForm({ ...form, fileType: e.target.value })} />
            <div className="space-y-1.5">
              <span className="block text-sm font-medium text-cms-text">File URL</span>
              <div className="flex gap-2">
                <input readOnly value={assetUrl(asset)} onFocus={(e) => e.target.select()} aria-label="File URL" className="h-9 min-w-0 flex-1 rounded-lg border border-cms-border bg-cms-input px-3 text-xs text-cms-muted" />
                <Button icon={Copy} onClick={copy}>Copy</Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete this file?"
        description={`“${asset.originalName}” will be permanently removed.`}
        onConfirm={async () => {
          try {
            await api.del(`/media/${asset.id}`)
            toast.success('File deleted.')
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

export default function MediaLibraryPage() {
  const toast = useToast()
  const input = useRef(null)
  const [q, setQ] = useState('')
  const [type, setType] = useState('ALL')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dq = useDebounce(q)
  const { data, meta, loading, error, reload } = useFetch('/media', { page, limit: 24, q: dq || undefined, fileType: type === 'ALL' ? undefined : type })
  const items = data ?? []

  const upload = async (files) => {
    if (!files.length) return
    setUploading(true)
    const { uploaded, failed } = await uploadFiles(files)
    setUploading(false)
    failed.forEach((f) => toast.error(`${f.name}: ${f.message}`))
    if (uploaded.length) {
      toast.success(uploaded.length === 1 ? 'File uploaded.' : `${uploaded.length} files uploaded.`)
      setPage(1)
      reload()
    }
  }

  return (
    <>
      <PageHeader
        title="Media Library"
        description="Every image and document used on the website lives here. Upload once, then reuse it anywhere."
        actions={
          <>
            <input ref={input} type="file" hidden multiple accept={ACCEPT} onChange={(e) => { upload([...e.target.files]); e.target.value = '' }} />
            <Button variant="primary" icon={ImagePlus} loading={uploading} onClick={() => input.current?.click()}>Upload files</Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Search by name or alt text" className="lg:w-80" />
        <div className="overflow-x-auto"><Segmented label="Filter by type" value={type} onChange={(v) => { setType(v); setPage(1) }} options={typeOptions} /></div>
      </div>

      <Card
        className={cn('relative transition-colors', dragging && 'border-cms-accent bg-cms-raised')}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload([...e.dataTransfer.files]) }}
      >
        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-cms-bg/80 text-sm font-medium text-cms-text">
            <UploadCloud size={20} /> Drop files to upload
          </div>
        )}
        {error && !data ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={dq || type !== 'ALL' ? 'No files match' : 'No files yet'}
            description={dq || type !== 'ALL' ? 'Try a different search or filter.' : 'Upload images or PDFs, or drag them onto this panel. JPG, PNG, GIF, WebP, AVIF, ICO and PDF are supported.'}
            action={!dq && type === 'ALL' && <Button variant="primary" icon={ImagePlus} onClick={() => input.current?.click()}>Upload files</Button>}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
            {items.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setSelected(a)}
                  className="group block w-full overflow-hidden rounded-lg border border-cms-border bg-cms-input text-left transition-colors hover:border-cms-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60"
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden bg-cms-raised">
                    {isImageAsset(a) ? <img src={assetUrl(a)} alt={a.altText || a.originalName} loading="lazy" className="h-full w-full object-cover" /> : <FileText size={32} className="text-cms-faint" />}
                  </div>
                  <div className="space-y-1 p-2">
                    <p className="truncate text-xs font-medium text-cms-text">{a.originalName}</p>
                    <div className="flex items-center justify-between gap-1">
                      <Badge>{a.fileType.charAt(0) + a.fileType.slice(1).toLowerCase()}</Badge>
                      <span className="text-[11px] text-cms-faint">{formatBytes(a.fileSize)}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        <Pagination meta={meta} onPage={setPage} />
      </Card>

      {selected && <AssetDialog key={selected.id} asset={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </>
  )
}
