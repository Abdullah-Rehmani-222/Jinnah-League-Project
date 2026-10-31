import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setup } from './helpers.js'

let t, c
before(async () => { t = await setup() })
after(() => t.close())
beforeEach(async () => { await t.reset(); ({ c } = await t.loggedIn()) })

test('display name can be changed without the current password', async () => {
  const r = await c.patch('/api/users/me', { name: 'New Name', email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  assert.equal(r.status, 200)
  assert.equal(r.body.data.user.name, 'New Name')
  assert.equal(r.setCookie.length, 0, 'session is not rotated for a name-only change')
})

test('email change requires the current password', async () => {
  const none = await c.patch('/api/users/me', { email: 'new@example.com' })
  assert.equal(none.status, 422)
  assert.ok(none.body.errors.some((e) => e.field === 'currentPassword'))
  const wrong = await c.patch('/api/users/me', { email: 'new@example.com', currentPassword: 'nope-nope-nope' })
  assert.equal(wrong.status, 422)
  assert.equal((await t.prisma.user.findFirst()).email, 'admin@example.com')
})

test('email change succeeds, is normalised, and rotates sessions', async () => {
  const old = c.state.cookie
  const r = await c.patch('/api/users/me', { email: 'New@Example.com', currentPassword: 'correct-horse-battery' })
  assert.equal(r.status, 200)
  assert.equal(r.body.data.user.email, 'new@example.com')
  assert.ok(r.body.data.csrfToken)
  assert.notEqual(c.state.cookie, old)
  assert.equal((await fetch(`${t.base}/api/auth/me`, { headers: { cookie: old } })).status, 401, 'old session revoked')
  c.state.csrf = r.body.data.csrfToken
  assert.equal((await c.get('/api/auth/me')).status, 200, 'new session works')
})

test('duplicate email is a 409', async () => {
  await t.createUser({ email: 'other@example.com' })
  const r = await c.patch('/api/users/me', { email: 'other@example.com', currentPassword: 'correct-horse-battery' })
  assert.equal(r.status, 409)
})

test('password change: validated, hashed with Argon2id, revokes other sessions', async () => {
  const other = t.client()
  await other.login()
  const mismatch = await c.patch('/api/users/me', { currentPassword: 'correct-horse-battery', newPassword: 'brand-new-password', confirmPassword: 'different-password' })
  assert.equal(mismatch.status, 422)
  assert.ok(mismatch.body.errors.some((e) => e.field === 'confirmPassword'))
  const short = await c.patch('/api/users/me', { currentPassword: 'correct-horse-battery', newPassword: 'short', confirmPassword: 'short' })
  assert.equal(short.status, 422)
  const same = await c.patch('/api/users/me', { currentPassword: 'correct-horse-battery', newPassword: 'correct-horse-battery', confirmPassword: 'correct-horse-battery' })
  assert.equal(same.status, 422)

  const r = await c.patch('/api/users/me', { currentPassword: 'correct-horse-battery', newPassword: 'brand-new-password', confirmPassword: 'brand-new-password' })
  assert.equal(r.status, 200)
  assert.ok(!JSON.stringify(r.body).toLowerCase().includes('hash'))
  assert.match((await t.prisma.user.findFirst()).passwordHash, /^\$argon2id\$/)
  assert.equal((await other.get('/api/auth/me')).status, 401, 'other device logged out')
  assert.equal((await t.client().login('admin@example.com', 'correct-horse-battery')).status, 401, 'old password no longer works')
  assert.equal((await t.client().login('admin@example.com', 'brand-new-password')).status, 200)
})

test('an empty update is rejected', async () => {
  assert.equal((await c.patch('/api/users/me', { name: '', email: '' })).status, 422)
})

test('account update requires the CSRF token', async () => {
  assert.equal((await c.patch('/api/users/me', { name: 'Hacked' }, { csrf: false })).status, 403)
})
