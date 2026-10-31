import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { setup } from './helpers.js'

let t
before(async () => { t = await setup(); await t.reset() })
after(() => t.close())

test('liveness and database connectivity', async () => {
  const c = t.client()
  assert.equal((await c.get('/api/health')).status, 200)
  const db = await c.get('/api/health/db')
  assert.equal(db.status, 200)
  assert.equal(db.body.data.database, 'connected')
})

test('unknown route returns the standard error shape', async () => {
  const r = await t.client().get('/api/nope')
  assert.equal(r.status, 404)
  assert.deepEqual(Object.keys(r.body).sort(), ['errors', 'message', 'success'])
  assert.equal(r.body.success, false)
})

test('malformed JSON is a 400 and never leaks internals', async () => {
  const res = await fetch(`${t.base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{bad' })
  const body = await res.json()
  assert.equal(res.status, 400)
  assert.ok(!JSON.stringify(body).includes('SyntaxError'))
  assert.ok(!('stack' in body))
})

test('security headers are set and x-powered-by is hidden', async () => {
  const res = await fetch(`${t.base}/api/health`)
  assert.equal(res.headers.get('x-powered-by'), null)
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  assert.ok(res.headers.get('content-security-policy'))
})

test('CORS: approved origin allowed with credentials, others get no CORS headers', async () => {
  const ok = await fetch(`${t.base}/api/health`, { headers: { origin: 'http://localhost:5173' } })
  assert.equal(ok.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  assert.equal(ok.headers.get('access-control-allow-credentials'), 'true')
  const bad = await fetch(`${t.base}/api/health`, { headers: { origin: 'https://evil.example' } })
  assert.equal(bad.status, 403)
  assert.equal(bad.headers.get('access-control-allow-origin'), null)
})

test('state-changing request from an unapproved Origin is rejected', async () => {
  const res = await fetch(`${t.base}/api/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
    body: JSON.stringify({ name: 'Eve', email: 'eve@example.com', message: 'hello there friend' }),
  })
  assert.equal(res.status, 403)
})

test('every admin endpoint rejects unauthenticated requests with 401', async () => {
  const id = '00000000-0000-4000-8000-000000000000'
  const routes = [
    ['GET', '/api/auth/me'], ['POST', '/api/auth/logout'], ['PATCH', '/api/users/me'], ['GET', '/api/dashboard'],
    ['GET', '/api/pages'], ['POST', '/api/pages'], ['GET', `/api/pages/${id}`], ['DELETE', `/api/pages/${id}`],
    ['GET', '/api/legacy'], ['PATCH', '/api/jl26'], ['POST', '/api/legacy/sections'],
    ['GET', '/api/press'], ['POST', '/api/press'], ['GET', '/api/sponsors'], ['POST', '/api/sponsors'],
    ['GET', '/api/gallery'], ['POST', '/api/gallery'], ['GET', '/api/social'], ['POST', '/api/social'],
    ['GET', '/api/sliders'], ['POST', '/api/sliders'], ['GET', '/api/settings'], ['PUT', '/api/settings'],
    ['GET', '/api/media'], ['POST', '/api/media'], ['DELETE', `/api/media/${id}`],
    ['GET', '/api/contact'], ['GET', `/api/contact/${id}`], ['PATCH', `/api/contact/${id}/status`], ['DELETE', `/api/contact/${id}`],
  ]
  for (const [m, p] of routes) {
    const res = await fetch(t.base + p, { method: m, headers: { 'content-type': 'application/json' }, body: m === 'GET' ? undefined : '{}' })
    assert.equal(res.status, 401, `${m} ${p} should be 401 but was ${res.status}`)
  }
})
