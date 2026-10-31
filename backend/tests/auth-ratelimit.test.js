import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { setup } from './helpers.js'

let t
before(async () => { t = await setup({ LOGIN_RATE_LIMIT_MAX: '3' }); await t.reset(); await t.createUser() })
after(() => t.close())

test('login is rate limited after repeated failures (429), even with the right password afterwards', async () => {
  const c = t.client()
  for (let i = 0; i < 3; i++) assert.equal((await c.login('admin@example.com', 'bad-password-1')).status, 401)
  const blocked = await c.login('admin@example.com', 'bad-password-1')
  assert.equal(blocked.status, 429)
  assert.equal(blocked.body.success, false)
  assert.equal((await c.login()).status, 429)
})
