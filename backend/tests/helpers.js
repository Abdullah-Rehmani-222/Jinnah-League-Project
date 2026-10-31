import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

/**
 * Boots the real app against a DISPOSABLE database. Tests TRUNCATE every table, so this refuses to run
 * against anything that is not localhost (set TEST_DATABASE_URL, e.g. postgresql://postgres@127.0.0.1:5433/jl_test).
 */
export async function setup(overrides = {}) {
  const url = process.env.TEST_DATABASE_URL
  if (!url) throw new Error('Set TEST_DATABASE_URL to a local, disposable PostgreSQL database. Tests wipe all tables.')
  const host = new URL(url).hostname
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) throw new Error(`Refusing to run tests against non-local database host "${host}".`)

  const uploadDir = mkdtempSync(path.join(tmpdir(), 'jl-uploads-'))
  Object.assign(process.env, {
    NODE_ENV: 'test',
    DATABASE_URL: url,
    SESSION_SECRET: 'test-session-secret-test-session-secret-0123456789',
    FRONTEND_URL: 'http://localhost:5173',
    STORAGE_DRIVER: 'local',
    UPLOAD_DIR: uploadDir,
    API_RATE_LIMIT_MAX: '100000',
    LOGIN_RATE_LIMIT_MAX: '1000',
    CONTACT_RATE_LIMIT_MAX: '1000',
    MAX_UPLOAD_MB: '10',
    ...overrides,
  })

  const { prisma } = await import('../src/config/database.js')
  const { default: app } = await import('../src/app.js')
  const { hashPassword } = await import('../src/utils/password.js')
  const server = await new Promise((resolve) => { const s = app.listen(0, () => resolve(s)) })
  const base = `http://127.0.0.1:${server.address().port}`
  process.env.API_PUBLIC_URL = base

  const TABLES = ['sessions', 'contact_messages', 'gallery_items', 'hero_slides', 'sponsor_tiers', 'press_items', 'website_settings', 'media_assets', 'page_sections', 'pages', 'social_links', 'users']
  const reset = () => prisma.$executeRawUnsafe(`TRUNCATE ${TABLES.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`)

  const createUser = async ({ email = 'admin@example.com', password = 'correct-horse-battery', name = 'Test Admin', role = 'SUPER_ADMIN', status = 'ACTIVE' } = {}) =>
    prisma.user.create({ data: { email, name, role, status, passwordHash: await hashPassword(password) } })

  /** A cookie-jar HTTP client. */
  const client = () => {
    const state = { cookie: null, csrf: null }
    const request = async (method, p, { body, form, headers = {}, auth = true, csrf = true } = {}) => {
      const h = { ...headers }
      if (auth && state.cookie) h.cookie = state.cookie
      if (csrf && state.csrf && method !== 'GET') h['x-csrf-token'] = state.csrf
      let payload
      if (form) payload = form
      else if (body !== undefined) { h['content-type'] = 'application/json'; payload = JSON.stringify(body) }
      const res = await fetch(base + p, { method, headers: h, body: payload })
      const setCookie = res.headers.getSetCookie()
      for (const c of setCookie) if (c.startsWith('jl_sid=')) { const v = c.split(';')[0].slice(7); state.cookie = v ? `jl_sid=${v}` : null }
      return { status: res.status, body: await res.json().catch(() => null), headers: res.headers, setCookie }
    }
    return {
      state,
      get: (p, o) => request('GET', p, o),
      post: (p, body, o) => request('POST', p, { body, ...o }),
      patch: (p, body, o) => request('PATCH', p, { body, ...o }),
      put: (p, body, o) => request('PUT', p, { body, ...o }),
      del: (p, o) => request('DELETE', p, o),
      upload: (p, form, o) => request('POST', p, { form, ...o }),
      async login(email = 'admin@example.com', password = 'correct-horse-battery') {
        const r = await request('POST', '/api/auth/login', { body: { email, password } })
        if (r.status === 200) state.csrf = r.body.data.csrfToken
        return r
      },
    }
  }

  const loggedIn = async (user) => {
    const u = await createUser(user)
    const c = client()
    const r = await c.login(u.email, user?.password ?? 'correct-horse-battery')
    if (r.status !== 200) throw new Error(`login failed in test setup: ${r.status}`)
    return { c, user: u }
  }

  const close = async () => {
    await new Promise((r) => server.close(r))
    await prisma.$disconnect()
    rmSync(uploadDir, { recursive: true, force: true })
  }
  return { base, prisma, reset, createUser, client, loggedIn, close, uploadDir }
}

// Smallest valid-looking files (correct magic bytes) for upload tests.
export const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 1)])
export const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 2)])
export const PDF = Buffer.from('%PDF-1.4\n%fake\n')
export const EXE = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(64, 3)])

export const fileForm = (buf, name, type, fields = {}) => {
  const fd = new FormData()
  fd.append('file', new Blob([buf], { type }), name)
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

/** Uploads a file via the API and returns the created media asset. */
export async function uploadPng(c, name = 'photo.png', fields = {}) {
  const r = await c.upload('/api/media', fileForm(PNG, name, 'image/png', fields))
  if (r.status !== 201) throw new Error(`upload failed: ${r.status} ${JSON.stringify(r.body)}`)
  return r.body.data
}
