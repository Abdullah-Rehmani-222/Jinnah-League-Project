import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useDebounce, useFetch } from '../lib/hooks'
import { cn } from '../lib/cn'
import { Card, PageHeader, Pagination, SearchInput, Segmented } from '../ui/Layout'
import { EmptyState, ErrorState, LoadingBlock, StatusBadge } from '../ui/Feedback'
import Button, { IconButton } from '../ui/Button'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import { Toggle } from '../ui/Fields'
import { useToast } from '../ui/Toast'

/**
 * Generic manager for ordered content lists (gallery, hero slides, sponsors, press, social links).
 * Each module supplies a config; this component owns search, filter, reorder, publish toggle,
 * create/edit dialog, validation errors from the API and delete confirmation.
 */
function ItemDialog({ config, endpoint, item, onClose, onSaved }) {
  const toast = useToast()
  const editing = Boolean(item)
  const [form, setForm] = useState(() => (editing ? config.toForm(item) : config.blank))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const submit = async (e) => {
    e.preventDefault()
    const clientErrors = config.validate?.(form) ?? {}
    if (Object.keys(clientErrors).length) return setErrors(clientErrors)
    setErrors({})
    setSaving(true)
    try {
      const payload = config.toPayload(form)
      if (editing) await api.patch(`${endpoint}/${item.id}`, payload)
      else await api.post(endpoint, payload)
      await config.afterSave?.(form).catch(() => toast.error('Saved, but the image description could not be updated.'))
      toast.success(editing ? `${config.singular} updated.` : `${config.singular} added.`)
      onSaved()
      onClose()
    } catch (err) {
      const fe = err.fieldErrors?.() ?? {}
      setErrors(fe)
      toast.error(Object.keys(fe).length ? 'Please fix the highlighted fields.' : err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onOpenChange={(v) => !v && !saving && onClose()}
      size={config.dialogSize ?? 'md'}
      title={editing ? `Edit ${config.singular.toLowerCase()}` : `Add ${config.singular.toLowerCase()}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" type="submit" form="item-form" loading={saving}>{editing ? 'Save changes' : `Add ${config.singular.toLowerCase()}`}</Button>
        </>
      }
    >
      <form id="item-form" onSubmit={submit} className="space-y-4" noValidate>
        {config.renderForm({ form, set, errors })}
      </form>
    </Modal>
  )
}

export default function ContentModule({ config }) {
  const { endpoint, title, description, singular, plural, columns = [], filter, searchPlaceholder, reorderable = true, Icon } = config
  const toast = useToast()
  const [q, setQ] = useState('')
  const [filterValue, setFilterValue] = useState('ALL')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState(null) // { item? }
  const [toDelete, setToDelete] = useState(null)
  const [local, setLocal] = useState(null)
  const [busy, setBusy] = useState(false)
  const dq = useDebounce(q)
  const limit = reorderable ? 100 : 20

  const query = { page, limit, q: dq || undefined, ...(filter && filterValue !== 'ALL' ? { [filter.key]: filterValue } : {}) }
  const { data, meta, loading, error, reload } = useFetch(endpoint, query)
  useEffect(() => setLocal(null), [data])
  const items = local ?? data ?? []
  const canReorder = reorderable && !dq && filterValue === 'ALL' && meta && meta.total <= limit && items.length > 1

  const move = async (index, dir) => {
    const next = [...items]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setLocal(next)
    setBusy(true)
    try {
      await api.patch(`${endpoint}/reorder`, { ids: next.map((i) => i.id) })
    } catch (err) {
      toast.error(err.message)
      setLocal(null)
      reload()
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (item, published) => {
    try {
      await api.patch(`${endpoint}/${item.id}`, { status: published ? 'PUBLISHED' : 'DRAFT' })
      toast.success(published ? `${singular} is now visible on the website.` : `${singular} is now hidden.`)
      reload()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const remove = async () => {
    try {
      await api.del(`${endpoint}/${toDelete.id}`)
      toast.success(`${singular} deleted.`)
      reload()
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const filtered = Boolean(dq) || filterValue !== 'ALL'

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={<Button variant="primary" icon={Plus} onClick={() => setDialog({})}>Add {singular.toLowerCase()}</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={q} onChange={(v) => { setQ(v); setPage(1) }} placeholder={searchPlaceholder ?? `Search ${plural.toLowerCase()}`} className="sm:w-72" />
        {filter && (
          <div className="overflow-x-auto">
            <Segmented label={filter.label} value={filterValue} onChange={(v) => { setFilterValue(v); setPage(1) }} options={[{ value: 'ALL', label: 'All' }, ...filter.options]} />
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        {error && !data ? (
          <ErrorState error={error} onRetry={reload} />
        ) : loading && !data ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Icon}
            title={filtered ? `No ${plural.toLowerCase()} match` : `No ${plural.toLowerCase()} yet`}
            description={filtered ? 'Try a different search or filter.' : config.emptyText}
            action={!filtered && <Button variant="primary" icon={Plus} onClick={() => setDialog({})}>Add {singular.toLowerCase()}</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-cms-border text-xs text-cms-faint">
                <tr>
                  {canReorder && <th className="w-20 px-4 py-3 font-medium"><span className="sr-only">Order</span></th>}
                  <th className="px-4 py-3 font-medium">{singular}</th>
                  {columns.map((c) => (
                    <th key={c.label} className={cn('px-4 py-3 font-medium', c.hideBelow && 'hidden lg:table-cell')}>{c.label}</th>
                  ))}
                  <th className="px-4 py-3 font-medium">Visibility</th>
                  <th className="w-24 px-4 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className={cn('divide-y divide-cms-border', loading && 'opacity-60')}>
                {items.map((item, i) => (
                  <tr key={item.id} className="hover:bg-cms-raised/50">
                    {canReorder && (
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          <IconButton icon={ArrowUp} label={`Move ${config.name(item)} up`} disabled={busy || i === 0} onClick={() => move(i, -1)} />
                          <IconButton icon={ArrowDown} label={`Move ${config.name(item)} down`} disabled={busy || i === items.length - 1} onClick={() => move(i, 1)} />
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <button onClick={() => setDialog({ item })} className="flex max-w-xs items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cms-accent/60">
                        {config.thumb(item)}
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-cms-text">{config.name(item)}</span>
                          {config.subtitle && <span className="block truncate text-xs text-cms-muted">{config.subtitle(item)}</span>}
                        </span>
                      </button>
                    </td>
                    {columns.map((c) => (
                      <td key={c.label} className={cn('px-4 py-3 text-cms-muted', c.hideBelow && 'hidden lg:table-cell')}>{c.render(item)}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Toggle checked={item.status === 'PUBLISHED'} onChange={(v) => toggle(item, v)} label={`Show ${config.name(item)} on website`} />
                        <StatusBadge status={item.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-0.5">
                        <IconButton icon={Pencil} label={`Edit ${config.name(item)}`} onClick={() => setDialog({ item })} />
                        <IconButton icon={Trash2} variant="danger" label={`Delete ${config.name(item)}`} onClick={() => setToDelete(item)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={reorderable ? null : meta} onPage={setPage} />
      </Card>

      {reorderable && meta && meta.total > limit && (
        <p className="mt-3 text-xs text-cms-faint">Reordering is available for up to {limit} items.</p>
      )}

      {dialog && <ItemDialog config={config} endpoint={endpoint} item={dialog.item} onClose={() => setDialog(null)} onSaved={reload} />}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Delete this ${singular.toLowerCase()}?`}
        description={toDelete ? `“${config.name(toDelete)}” will be removed from the website.` : ''}
        onConfirm={remove}
      />
    </>
  )
}
