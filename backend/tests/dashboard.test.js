import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setup, uploadPng } from './helpers.js'

let t, c
before(async () => { t = await setup() })
after(() => t.close())
beforeEach(async () => { await t.reset(); ({ c } = await t.loggedIn()) })

test('dashboard reports real counts, not fabricated numbers', async () => {
  const empty = (await c.get('/api/dashboard')).body.data
  assert.deepEqual(Object.values(empty.counts).reduce((a, b) => a + b, 0), 0)
  assert.deepEqual(empty.recentMessages, [])

  const m = await uploadPng(c)
  await c.post('/api/gallery', { mediaAssetId: m.id })
  await c.post('/api/pages', { title: 'A', slug: 'a' })
  await c.post('/api/pages', { title: 'B', slug: 'b' })
  await c.post('/api/sliders', { title: 'S' })
  await c.post('/api/social', { platform: 'x', url: 'https://x.com/jl' })
  await t.client().post('/api/contact', { name: 'Ali Khan', email: 'ali@example.com', message: 'Hello there, this is a message.' })
  await t.client().post('/api/contact', { name: 'Sara Ahmed', email: 'sara@example.com', message: 'Another message for the league.' })
  const msg = (await t.prisma.contactMessage.findFirst({ orderBy: { createdAt: 'asc' } })).id
  await c.patch(`/api/contact/${msg}/status`, { status: 'READ' })

  const d = (await c.get('/api/dashboard')).body.data
  assert.deepEqual(d.counts, { pages: 2, mediaAssets: 1, galleryItems: 1, contactMessages: 2, unreadMessages: 1, heroSlides: 1, sponsorTiers: 0, pressItems: 0, socialLinks: 1 })
  assert.equal(d.recentMessages.length, 2)
  assert.ok(!('message' in d.recentMessages[0]), 'summaries only')
})
