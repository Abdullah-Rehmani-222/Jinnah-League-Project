import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setup } from './helpers.js'

let t, c
before(async () => { t = await setup() })
after(() => t.close())
beforeEach(async () => { await t.reset(); ({ c } = await t.loggedIn()) })

const submit = (over = {}) => t.client().post('/api/contact', { name: 'Ali Khan', email: 'ali@example.com', subject: 'Sponsorship', message: 'I would like to know more about sponsorship.', ...over })

test('public submission is stored as UNREAD and returns no data', async () => {
  const r = await submit()
  assert.equal(r.status, 201)
  assert.equal(r.body.data, null)
  const row = await t.prisma.contactMessage.findFirst()
  assert.equal(row.status, 'UNREAD')
  assert.equal(row.email, 'ali@example.com')
})

test('validation errors', async () => {
  assert.equal((await submit({ email: 'bad' })).status, 422)
  assert.equal((await submit({ name: 'A' })).status, 422)
  assert.equal((await submit({ message: 'short' })).status, 422)
  assert.equal((await submit({ message: 'x'.repeat(5001) })).status, 422)
  assert.equal((await submit({ subject: undefined })).status, 201, 'subject is optional')
  assert.equal(await t.prisma.contactMessage.count(), 1)
})

test('control characters are stripped and the email is normalised', async () => {
  await submit({ name: 'Ali\u0000 Khan', email: 'ALI@Example.COM', message: 'Line one\nLine two\u0007 is fine' })
  const row = await t.prisma.contactMessage.findFirst()
  assert.equal(row.name, 'Ali Khan')
  assert.equal(row.email, 'ali@example.com')
  assert.equal(row.message, 'Line one\nLine two is fine')
})

test('honeypot: bots get a fake success but nothing is stored', async () => {
  const r = await submit({ website: 'http://spam.example' })
  assert.equal(r.status, 201)
  assert.equal(await t.prisma.contactMessage.count(), 0)
})

test('admin: list, search, filter, view, mark read/unread/resolved, delete', async () => {
  await submit({ name: 'Ali Khan' })
  await submit({ name: 'Sara Ahmed', subject: 'Tickets', message: 'When do tickets go on sale this year?' })
  const list = await c.get('/api/contact')
  assert.equal(list.body.meta.total, 2)
  assert.equal(list.body.data[0].name, 'Sara Ahmed', 'newest first')
  assert.equal((await c.get('/api/contact?q=tickets')).body.data.length, 1)
  assert.equal((await c.get('/api/contact?status=READ')).body.data.length, 0)
  assert.equal((await c.get('/api/contact?status=ARCHIVED')).status, 422)

  const id = list.body.data[0].id
  assert.equal((await c.get(`/api/contact/${id}`)).body.data.message.includes('tickets'), true)
  for (const status of ['READ', 'RESOLVED', 'UNREAD']) {
    assert.equal((await c.patch(`/api/contact/${id}/status`, { status })).body.data.status, status)
  }
  assert.equal((await c.patch(`/api/contact/${id}/status`, { status: 'WHATEVER' })).status, 422)
  assert.equal((await c.del(`/api/contact/${id}`)).status, 200)
  assert.equal((await c.get(`/api/contact/${id}`)).status, 404)
  assert.equal((await c.del(`/api/contact/${id}`)).status, 404)
})

test('admin message actions need a session; mutations need CSRF', async () => {
  await submit()
  const id = (await t.prisma.contactMessage.findFirst()).id
  assert.equal((await t.client().get('/api/contact')).status, 401)
  assert.equal((await t.client().get(`/api/contact/${id}`)).status, 401)
  assert.equal((await c.patch(`/api/contact/${id}/status`, { status: 'READ' }, { csrf: false })).status, 403)
  assert.equal((await c.del(`/api/contact/${id}`, { csrf: false })).status, 403)
})
