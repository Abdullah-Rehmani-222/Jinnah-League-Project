import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { setup } from './helpers.js'

let t
before(async () => { t = await setup({ CONTACT_RATE_LIMIT_MAX: '3' }); await t.reset() })
after(() => t.close())

test('the public contact endpoint is rate limited (429)', async () => {
  const c = t.client()
  const body = { name: 'Ali Khan', email: 'ali@example.com', message: 'Hello, this is a test message.' }
  for (let i = 0; i < 3; i++) assert.equal((await c.post('/api/contact', body)).status, 201)
  const r = await c.post('/api/contact', body)
  assert.equal(r.status, 429)
  assert.equal(r.body.success, false)
  assert.equal(await t.prisma.contactMessage.count(), 3)
})
