/**
 * Read-only client for the public (unauthenticated) endpoints, plus the contact form.
 *
 * Deliberately separate from `cms/lib/api.js`: the CMS bundle is lazy-loaded, so the public site
 * must never import from it. No cookies are sent - public endpoints do not need a session.
 */
import { useEffect, useState } from 'react'

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

/** Uploaded files may come back as absolute URLs (S3/CDN) or, in odd setups, as paths on the API host. */
export const fileUrl = (a) => {
  const u = a?.fileUrl ?? a?.url ?? (typeof a === 'string' ? a : '')
  if (!u) return ''
  return /^https?:\/\//i.test(u) ? u : `${API_URL.replace(/\/api$/, '')}${u.startsWith('/') ? '' : '/'}${u}`
}

export class PublicApiError extends Error {
  constructor(status, message, errors = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
  fieldErrors() {
    const out = {}
    for (const e of this.errors) if (e.field && !out[e.field]) out[e.field] = e.message
    return out
  }
}

async function request(method, path, { body, signal } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'omit',
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new PublicApiError(0, 'Cannot reach the server. Please check your connection and try again.')
  }
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new PublicApiError(res.status, json?.message || 'Something went wrong. Please try again.', json?.errors ?? [])
  return json
}

export const publicApi = {
  get: (path, signal) => request('GET', `/public${path}`, { signal }),
  sendContact: (payload) => request('POST', '/contact', { body: payload }),
}

// Tiny in-memory cache so moving between pages does not refetch shared data (settings, social links...).
const cache = new Map()

/**
 * Fetches public content. `data` stays `null` until the request settles; on failure `error` is set and `data`
 * stays `null`, so callers can fall back to their built-in default content.
 */
export function usePublic(path) {
  const cached = path ? cache.get(path) : undefined
  const [state, setState] = useState(cached ? { ...cached, loading: false } : { data: null, meta: null, loading: Boolean(path), error: null })

  useEffect(() => {
    if (!path) return undefined
    const hit = cache.get(path)
    if (hit && Date.now() - hit.at < 60_000) {
      setState({ ...hit, loading: false })
      return undefined
    }
    const ctrl = new AbortController()
    setState((s) => ({ ...s, loading: true, error: null }))
    publicApi
      .get(path, ctrl.signal)
      .then((r) => {
        const next = { data: r.data, meta: r.meta ?? null, error: null, at: Date.now() }
        cache.set(path, next)
        setState({ ...next, loading: false })
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setState({ data: null, meta: null, loading: false, error: e })
      })
    return () => ctrl.abort()
  }, [path])

  return state
}

/** Published CMS page (`/public/pages/:slug`). A 404 simply means "not published / not created yet". */
export function usePage(slug) {
  const r = usePublic(`/pages/${slug}`)
  const missing = r.error?.status === 404
  return { ...r, page: r.data, sections: r.data?.sections ?? [], missing }
}

/** Settings as a flat key -> value object ({} while loading or if the API is unreachable). */
export function useSettings() {
  return usePublic('/settings').data ?? {}
}
