import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Delete', onConfirm, danger = true }) {
  const [busy, setBusy] = useState(false)
  const run = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={(v) => !busy && onOpenChange(v)}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button variant={danger ? 'dangerSolid' : 'primary'} onClick={run} loading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-cms-muted">This action cannot be undone.</p>
    </Modal>
  )
}
