import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setup } from './helpers.js'

let t
before(async () => { t = await setup() })
after(() => t.close())
beforeEach(async () => { await t.reset(); await t.createUser() })

test('login succeeds, sets a hardened cookie, returns no password hash', async () => {
  const c = t.client()
  const r = await c.login()
  assert.equal(r.status, 200)
  assert.equal(r.body.success, true)
  assert.equal(r.body.data.user.email, 'admin@example.com')
  assert.ok(r.body.data.csrfToken)
  assert.ok(!JSON.stringify(r.body).toLowerCase().includes('passwordhash'))
  assert.ok(!JSON.stringify(r.body).includes('argon2'))
  const cookie = r.setCookie.find((x) => x.startsWith('jl_sid='))
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /SameSite=Lax/i)
  assert.match(cookie, /Path=\//)
})

test('login email is case-insensitive and updates lastLoginAt', async () => {
  const c = t.client()
  assert.equal((await c.login('ADMIN@Example.com')).status, 200)
  const u = await t.prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  assert.ok(u.lastLoginAt)
})

test('the session token is stored hashed, never raw', async () => {
  const c = t.client()
  await c.login()
  const raw = c.state.cookie.split('=')[1]
  const rows = await t.prisma.session.findMany()
  assert.equal(rows.length, 1)
  assert.notEqual(rows[0].tokenHash, raw)
  assert.equal(rows[0].tokenHash.length, 64)
})

test('wrong password and unknown email give the same 401 message', async () => {
  const a = await t.client().login('admin@example.com', 'wrong-password-123')
  const b = await t.client().login('nobody@example.com', 'wrong-password-123')
  assert.equal(a.status, 401)
  assert.equal(b.status, 401)
  assert.equal(a.body.message, b.body.message)
})

test('login validation errors are 422 with field details', async () => {
  const r = await t.client().post('/api/auth/login', { email: 'not-an-email', password: '' })
  assert.equal(r.status, 422)
  assert.ok(r.body.errors.some((e) => e.field === 'email'))
  assert.ok(r.body.errors.some((e) => e.field === 'password'))
})

test('disabled accounts cannot log in', async () => {
  await t.prisma.user.update({ where: { email: 'admin@example.com' }, data: { status: 'DISABLED' } })
  assert.equal((await t.client().login()).status, 403)
})

test('GET /auth/me works with a session and returns 401 without one', async () => {
  const c = t.client()
  assert.equal((await c.get('/api/auth/me')).status, 401)
  await c.login()
  const me = await c.get('/api/auth/me')
  assert.equal(me.status, 200)
  assert.equal(me.body.data.user.name, 'Test Admin')
})

test('logout destroys the session on the server', async () => {
  const c = t.client()
  await c.login()
  const stolen = c.state.cookie
  assert.equal((await c.post('/api/auth/logout')).status, 200)
  assert.equal(await t.prisma.session.count(), 0)
  const replay = await fetch(`${t.base}/api/auth/me`, { headers: { cookie: stolen } })
  assert.equal(replay.status, 401)
})

test('CSRF: state-changing request without the token is rejected, with it succeeds', async () => {
  const c = t.client()
  await c.login()
  const denied = await c.post('/api/auth/logout', undefined, { csrf: false })
  assert.equal(denied.status, 403)
  const wrong = await c.post('/api/auth/logout', undefined, { headers: { 'x-csrf-token': 'wrong' }, csrf: false })
  assert.equal(wrong.status, 403)
  assert.equal((await c.post('/api/auth/logout')).status, 200)
})

test('idle session expiry returns 401', async () => {
  const c = t.client()
  await c.login()
  await t.prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } })
  assert.equal((await c.get('/api/auth/me')).status, 401)
  assert.equal(await t.prisma.session.count(), 0)
})

test('absolute session lifetime is enforced even if the idle timer is fresh', async () => {
  const c = t.client()
  await c.login()
  await t.prisma.session.updateMany({ data: { createdAt: new Date(Date.now() - 8 * 86_400_000) } })
  assert.equal((await c.get('/api/auth/me')).status, 401)
})

test('disabling an account invalidates its existing sessions', async () => {
  const c = t.client()
  await c.login()
  await t.prisma.user.update({ where: { email: 'admin@example.com' }, data: { status: 'DISABLED' } })
  assert.equal((await c.get('/api/auth/me')).status, 401)
})

test('a garbage cookie is rejected', async () => {
  const r = await fetch(`${t.base}/api/auth/me`, { headers: { cookie: 'jl_sid=not-a-real-token' } })
  assert.equal(r.status, 401)
})
