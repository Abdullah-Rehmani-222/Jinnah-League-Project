import { useEffect, useState } from 'react'
import { Info, Save } from 'lucide-react'
import { api } from '../lib/api'
import { useFetch } from '../lib/hooks'
import { useAuth } from '../AuthContext'
import { PageHeader, Card, Segmented } from '../ui/Layout'
import { ErrorState, LoadingBlock } from '../ui/Feedback'
import { TextAreaField, TextField } from '../ui/Fields'
import { MediaField } from '../ui/MediaPicker'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'

const textKeys = ['site_name', 'tagline', 'contact_email', 'contact_phone', 'contact_address', 'footer_text', 'copyright_text', 'default_meta_title', 'default_meta_description']
const mediaKeys = ['logo', 'favicon']
const tabs = [
  { value: 'general', label: 'General' },
  { value: 'branding', label: 'Branding' },
  { value: 'contact', label: 'Contact' },
  { value: 'footer', label: 'Footer' },
  { value: 'seo', label: 'Search & sharing' },
]

const toMedia = (m) => (m ? { id: m.id, fileUrl: m.url, altText: m.altText, originalName: m.altText || 'Current file', mimeType: 'image/*' } : null)

export default function SettingsPage() {
  const toast = useToast()
  const { user } = useAuth()
  const { data, loading, error, reload } = useFetch('/settings')
  const [tab, setTab] = useState('general')
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const readOnly = user?.role === 'EDITOR'

  useEffect(() => {
    if (!data) return
    const f = {}
    for (const k of textKeys) f[k] = data[k] ?? ''
    for (const k of mediaKeys) f[k] = toMedia(data[k])
    setForm(f)
  }, [data])

  if (error && !data) return <Card><ErrorState error={error} onRetry={reload} /></Card>
  if (!form) return <LoadingBlock />

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const text = (k, label, extra = {}) => (
    <TextField label={label} value={form[k]} error={errors[`settings.${k}`] ?? errors[k]} onChange={set(k)} disabled={readOnly} {...extra} />
  )

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const settings = {}
    for (const k of textKeys) settings[k] = form[k].trim()
    for (const k of mediaKeys) settings[k] = form[k]?.id ?? null
    try {
      await api.put('/settings', { settings })
      toast.success('Settings saved.')
      reload()
    } catch (err) {
      setErrors(err.fieldErrors?.() ?? {})
      toast.error(err.status === 403 ? 'Your role can view settings but not change them.' : err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} noValidate>
      <PageHeader
        title="Website Settings"
        description="Site-wide information used across the public website."
        actions={!readOnly && <Button variant="primary" type="submit" icon={Save} loading={saving}>Save settings</Button>}
      />
      {readOnly && (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-cms-border bg-cms-surface px-4 py-3 text-sm text-cms-muted"><Info size={16} /> Editors can view these settings but only administrators can change them.</p>
      )}
      <div className="mb-4 overflow-x-auto"><Segmented label="Settings section" value={tab} onChange={setTab} options={tabs} /></div>

      <Card className="max-w-3xl space-y-5 p-5">
        {tab === 'general' && (
          <>
            {text('site_name', 'Website name', { placeholder: 'Jinnah League' })}
            {text('tagline', 'Tagline', { placeholder: 'Bigger. Bolder. Better.' })}
          </>
        )}
        {tab === 'branding' && (
          <>
            <MediaField label="Logo" hint="Shown in the website header." value={form.logo} error={errors['settings.logo']} onChange={(logo) => !readOnly && setForm((f) => ({ ...f, logo }))} />
            <MediaField label="Favicon" hint="The small icon in the browser tab. Square images work best." value={form.favicon} error={errors['settings.favicon']} onChange={(favicon) => !readOnly && setForm((f) => ({ ...f, favicon }))} />
          </>
        )}
        {tab === 'contact' && (
          <>
            {text('contact_email', 'Contact email', { type: 'email', placeholder: 'contact@jinnahleague.com' })}
            {text('contact_phone', 'Phone')}
            <TextAreaField label="Address" rows={3} value={form.contact_address} error={errors['settings.contact_address']} onChange={set('contact_address')} disabled={readOnly} />
          </>
        )}
        {tab === 'footer' && (
          <>
            <TextAreaField label="Footer text" rows={3} value={form.footer_text} error={errors['settings.footer_text']} onChange={set('footer_text')} disabled={readOnly} />
            {text('copyright_text', 'Copyright line', { placeholder: '© 2026 Jinnah League. All rights reserved.' })}
          </>
        )}
        {tab === 'seo' && (
          <>
            {text('default_meta_title', 'Default page title', { hint: 'Used when a page has no title of its own.' })}
            <TextAreaField label="Default description" rows={3} hint="Shown in search results and link previews." value={form.default_meta_description} error={errors['settings.default_meta_description']} onChange={set('default_meta_description')} disabled={readOnly} />
          </>
        )}
      </Card>
    </form>
  )
}
