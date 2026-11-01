/**
 * Minimal API client for the Jinnah League Express backend.
 * - Sends the HTTP-only session cookie (credentials: 'include').
 * - Sends the CSRF token (kept in memory only) on every state-changing request.
 */
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

let csrfToken = null
let onUnauthorized = null

export const setCsrfToken = (t) => { csrfToken = t ?? null }
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
  /** { fieldName: 'message' } from the backend's validation errors. */
  fieldErrors() {
    const out = {}
    for (const e of this.errors) if (e.field && !out[e.field]) out[e.field] = e.message
    return out
  }
}

const toQuery = (query) => {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== null && v !== '') p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}

async function request(method, path, { body, form, query, signal } = {}) {
  const headers = {}
  if (method !== 'GET' && csrfToken) headers['X-CSRF-Token'] = csrfToken
  let payload
  if (form) payload = form
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${BASE}${path}${toQuery(query)}`, { method, headers, body: payload, credentials: 'include', signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError(0, 'Cannot reach the server. Check your connection and that the API is running.')
  }

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/login')) onUnauthorized?.()
    throw new ApiError(res.status, json?.message || 'Something went wrong. Please try again.', json?.errors ?? [])
  }
  return json ?? { success: true, data: null }
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { body, ...opts }),
  patch: (path, body, opts) => request('PATCH', path, { body, ...opts }),
  put: (path, body, opts) => request('PUT', path, { body, ...opts }),
  del: (path, opts) => request('DELETE', path, opts),
  upload: (path, form, opts) => request('POST', path, { form, ...opts }),
}
