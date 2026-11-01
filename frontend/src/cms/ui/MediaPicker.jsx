import { useRef, useState } from 'react'
import { FileText, ImagePlus, Check, ImageOff, X } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { SearchInput, Pagination } from './Layout'
import { EmptyState, ErrorState, LoadingBlock } from './Feedback'
import { useToast } from './Toast'
import { useDebounce, useFetch } from '../lib/hooks'
import { uploadFiles, ACCEPT } from '../lib/upload'
import { assetUrl, isImageAsset } from '../lib/format'
import { cn } from '../lib/cn'

/** Modal that lets the admin choose an existing asset or upload a new one. kind: 'image' | 'any' */
export function MediaPicker({ open, onOpenChange, onSelect, kind = 'image', selectedId }) {
  const toast = useToast()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const input = useRef(null)
  const dq = useDebounce(q)
  const query = { page, limit: 18, q: dq || undefined }
  const { data, meta, loading, error, reload } = useFetch(open ? '/media' : null, query)
  const items = (data ?? []).filter((a) => kind === 'any' || isImageAsset(a))

  const upload = async (files) => {
    if (!files.length) return
    setUploading(true)
    const { uploaded, failed } = await uploadFiles(files)
    setUploading(false)
    failed.forEach((f) => toast.error(`${f.name}: ${f.message}`))
    if (uploaded.length) {
      toast.success(uploaded.length === 1 ? 'File uploaded.' : `${uploaded.length} files uploaded.`)
      reload()
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={kind === 'image' ? 'Choose an image' : 'Choose a file'}
      description="Pick from your Media Library or upload something new."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder="Search by name or alt text" className="flex-1" />
        <input ref={input} type="file" hidden multiple accept={ACCEPT} onChange={(e) => { upload([...e.target.files]); e.target.value = '' }} />
        <Button icon={ImagePlus} loading={uploading} onClick={() => input.current?.click()}>Upload</Button>
      </div>

      {error && !data ? (
        <ErrorState error={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <EmptyState icon={ImageOff} title="Nothing here yet" description="Upload a file to get started." />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => { onSelect(a); onOpenChange(false) }}
                className={cn(
                  'group relative block aspect-square w-full overflow-hidden rounded-lg border bg-cms-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60',
                  selectedId === a.id ? 'border-cms-accent' : 'border-cms-border hover:border-cms-muted',
                )}
                title={a.originalName}
              >
                {isImageAsset(a) ? (
                  <img src={assetUrl(a)} alt={a.altText || a.originalName} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-2 p-2 text-cms-muted">
                    <FileText size={28} />
                    <span className="line-clamp-2 break-all text-center text-xs">{a.originalName}</span>
                  </span>
                )}
                {selectedId === a.id && (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-cms-accent p-1 text-white"><Check size={12} /></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="-mx-5 -mb-4 mt-4"><Pagination meta={meta} onPage={setPage} /></div>
    </Modal>
  )
}

/** Form field showing the chosen asset with Choose / Remove actions. value: asset object or null. */
export function MediaField({ label, hint, error, value, onChange, kind = 'image', required }) {
  const [open, setOpen] = useState(false)
  const showImage = value && isImageAsset(value)
  return (
    <div className="space-y-1.5">
      {label && (
        <span className="block text-sm font-medium text-cms-text">
          {label}{required && <span className="ml-0.5 text-red-400" aria-hidden="true">*</span>}
        </span>
      )}
      <div className={cn('flex items-center gap-3 rounded-lg border bg-cms-input p-2.5', error ? 'border-red-500/60' : 'border-cms-border')}>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cms-raised text-cms-faint">
          {showImage ? (
            <img src={assetUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : value ? (
            <FileText size={24} />
          ) : (
            <ImageOff size={22} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-cms-text">{value ? value.originalName || 'Selected file' : 'No file selected'}</p>
          <div className="mt-1.5 flex gap-2">
            <Button size="sm" onClick={() => setOpen(true)}>{value ? 'Change' : 'Choose'}</Button>
            {value && <Button size="sm" variant="ghost" icon={X} onClick={() => onChange(null)}>Remove</Button>}
          </div>
        </div>
      </div>
      {error ? <p role="alert" className="text-xs text-red-400">{error}</p> : hint && <p className="text-xs text-cms-faint">{hint}</p>}
      <MediaPicker open={open} onOpenChange={setOpen} onSelect={onChange} kind={kind} selectedId={value?.id} />
    </div>
  )
}
