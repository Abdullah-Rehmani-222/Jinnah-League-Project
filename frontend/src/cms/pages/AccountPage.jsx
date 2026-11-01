import { useState } from 'react'
import { Eye, EyeOff, Save } from 'lucide-react'
import { api, setCsrfToken } from '../lib/api'
import { useAuth } from '../AuthContext'
import { formatDateTime } from '../lib/format'
import { PageHeader, Card } from '../ui/Layout'
import { Field, TextField } from '../ui/Fields'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { useId } from 'react'

function PasswordField({ label, hint, error, value, onChange, autoComplete }) {
  const id = useId()
  const [show, setShow] = useState(false)
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className="h-9 w-full rounded-lg border border-cms-border bg-cms-input pl-3 pr-10 text-sm text-cms-text focus:border-cms-accent focus:outline-none focus:ring-2 focus:ring-cms-accent/40 aria-[invalid=true]:border-red-500/60"
        />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-cms-faint hover:text-cms-text">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </Field>
  )
}

export default function AccountPage() {
  const toast = useToast()
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, email: user.email, currentPassword: '', newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    const emailChanged = form.email.trim().toLowerCase() !== user.email
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if ((emailChanged || form.newPassword) && !form.currentPassword) e.currentPassword = 'Enter your current password to change your email or password.'
    if (form.newPassword && form.newPassword.length < 10) e.newPassword = 'Password must be at least 10 characters.'
    if (form.newPassword && form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'
    return e
  }

  const submit = async (ev) => {
    ev.preventDefault()
    const ce = validate()
    setErrors(ce)
    if (Object.keys(ce).length) return
    setSaving(true)
    try {
      const res = await api.patch('/users/me', form)
      if (res.data.csrfToken) setCsrfToken(res.data.csrfToken) // sessions rotate after a credential change
      setUser(res.data.user)
      setForm({ name: res.data.user.name, email: res.data.user.email, currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Account saved.')
    } catch (err) {
      const fe = err.fieldErrors?.() ?? {}
      setErrors(fe)
      toast.error(Object.keys(fe).length ? 'Please fix the highlighted fields.' : err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Admin Account" description="Update your name, sign-in email and password." />
      <form onSubmit={submit} noValidate className="max-w-2xl space-y-6">
        <Card className="space-y-5 p-5">
          <h2 className="text-sm font-semibold text-cms-text">Profile</h2>
          <TextField label="Display name" required autoComplete="name" value={form.name} error={errors.name} onChange={set('name')} />
          <TextField label="Login email" required type="email" autoComplete="username" value={form.email} error={errors.email} onChange={set('email')} hint="Changing your email requires your current password." />
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <dt className="text-cms-faint">Role</dt><dd className="text-cms-muted">{user.role.replace('_', ' ').toLowerCase()}</dd>
            <dt className="text-cms-faint">Last sign-in</dt><dd className="text-cms-muted">{formatDateTime(user.lastLoginAt)}</dd>
          </dl>
        </Card>

        <Card className="space-y-5 p-5">
          <div>
            <h2 className="text-sm font-semibold text-cms-text">Password</h2>
            <p className="mt-1 text-xs text-cms-muted">Leave the new password blank to keep your current one. Other signed-in devices are signed out when it changes.</p>
          </div>
          <PasswordField label="Current password" autoComplete="current-password" value={form.currentPassword} error={errors.currentPassword} onChange={set('currentPassword')} />
          <PasswordField label="New password" autoComplete="new-password" hint="At least 10 characters." value={form.newPassword} error={errors.newPassword} onChange={set('newPassword')} />
          <PasswordField label="Confirm new password" autoComplete="new-password" value={form.confirmPassword} error={errors.confirmPassword} onChange={set('confirmPassword')} />
        </Card>

        <Button variant="primary" size="lg" type="submit" icon={Save} loading={saving}>Save account</Button>
      </form>
    </>
  )
}
