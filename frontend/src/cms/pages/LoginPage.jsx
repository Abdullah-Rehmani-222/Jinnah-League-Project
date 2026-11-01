import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../AuthContext'
import { TextField } from '../ui/Fields'
import Button from '../ui/Button'

export default function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (status === 'authed') return <Navigate to={location.state?.from || '/admin'} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate(location.state?.from || '/admin', { replace: true })
    } catch (err) {
      setError(err.status === 422 ? 'Enter a valid email and your password.' : err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cms-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cms-accent font-display text-lg text-white">JL</div>
          <h1 className="text-xl font-semibold text-cms-text">Sign in to the CMS</h1>
          <p className="mt-1 text-sm text-cms-muted">Manage the Jinnah League website.</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-cms-border bg-cms-surface p-6" noValidate>
          {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy} icon={ShieldCheck}>Sign in</Button>
        </form>
        <p className="mt-4 text-center text-xs text-cms-faint">Access is limited to authorized administrators.</p>
      </div>
    </div>
  )
}
