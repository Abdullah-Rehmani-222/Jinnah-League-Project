import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setup, fileForm, uploadPng, PDF } from './helpers.js'

let t, c, img
before(async () => { t = await setup() })
after(() => t.close())
beforeEach(async () => { await t.reset(); ({ c } = await t.loggedIn()); img = await uploadPng(c) })

const pub = (p) => t.client().get(`/api/public/${p}`)

// ---------------------------------------------------------------- gallery
test('gallery: add from media library, update, publish, reorder, remove', async () => {
  const b = await uploadPng(c, 'b.png')
  const g1 = (await c.post('/api/gallery', { mediaAssetId: img.id, title: 'First' })).body.data
  const g2 = (await c.post('/api/gallery', { mediaAssetId: b.id, title: 'Second' })).body.data
  assert.deepEqual([g1.displayOrder, g2.displayOrder], [0, 1])
  assert.equal(g1.status, 'DRAFT')
  assert.equal(g1.mediaAsset.id, img.id, 'media asset included')

  assert.equal((await pub('gallery')).body.data.length, 0, 'drafts are hidden')
  await c.patch(`/api/gallery/${g1.id}`, { status: 'PUBLISHED', description: 'Nice' })
  await c.patch(`/api/gallery/${g2.id}`, { status: 'PUBLISHED' })
  await c.patch('/api/gallery/reorder', { ids: [g2.id, g1.id] })
  const list = (await pub('gallery')).body
  assert.deepEqual(list.data.map((x) => x.title), ['Second', 'First'])
  assert.equal(list.meta.total, 2)
  assert.ok(list.data[0].mediaAsset.fileUrl)

  assert.equal((await c.del(`/api/gallery/${g1.id}`)).status, 200)
  assert.equal(await t.prisma.mediaAsset.count(), 2, 'removing a gallery entry keeps the media file')
})

test('gallery: media must exist and be an image', async () => {
  assert.equal((await c.post('/api/gallery', { mediaAssetId: '00000000-0000-4000-8000-000000000000' })).status, 422)
  assert.equal((await c.post('/api/gallery', {})).status, 422)
  const pdf = (await c.upload('/api/media', fileForm(PDF, 'a.pdf', 'application/pdf'))).body.data
  const r = await c.post('/api/gallery', { mediaAssetId: pdf.id })
  assert.equal(r.status, 422)
  assert.ok(r.body.errors.some((e) => /image/i.test(e.message)))
})

test('reorder rejects unknown ids and duplicates', async () => {
  const g = (await c.post('/api/gallery', { mediaAssetId: img.id })).body.data
  assert.equal((await c.patch('/api/gallery/reorder', { ids: [g.id, '00000000-0000-4000-8000-000000000000'] })).status, 422)
  assert.equal((await c.patch('/api/gallery/reorder', { ids: [g.id, g.id] })).status, 422)
  assert.equal((await c.patch('/api/gallery/reorder', { ids: [] })).status, 422)
})

// ---------------------------------------------------------------- sliders
test('sliders: CRUD, image, button link validation, public output', async () => {
  const s = await c.post('/api/sliders', { title: 'Welcome', subtitle: 'JL 26', mediaAssetId: img.id, buttonText: 'Register', buttonUrl: '#/jl26', status: 'PUBLISHED' })
  assert.equal(s.status, 201)
  assert.equal((await c.post('/api/sliders', { title: 'X', buttonUrl: 'javascript:alert(1)' })).status, 422)
  assert.equal((await c.post('/api/sliders', { title: 'X', buttonUrl: '//evil.example' })).status, 422)
  assert.equal((await c.post('/api/sliders', { title: 'Ok', buttonUrl: 'https://example.com/x' })).status, 201)
  assert.equal((await c.post('/api/sliders', { title: 'Ok2', buttonUrl: '/about' })).status, 201)
  assert.equal((await c.post('/api/sliders', { title: '' })).status, 422)
  assert.equal((await c.post('/api/sliders', { title: 'Bad media', mediaAssetId: '00000000-0000-4000-8000-000000000000' })).status, 422)

  const u = await c.patch(`/api/sliders/${s.body.data.id}`, { title: 'Welcome 2', buttonText: '' })
  assert.equal(u.body.data.title, 'Welcome 2')
  assert.equal(u.body.data.buttonText, null, 'empty string clears the field')
  const publicList = (await pub('hero-slides')).body.data
  assert.equal(publicList.length, 1)
  assert.equal(publicList[0].mediaAsset.id, img.id)
  assert.equal((await c.get('/api/sliders?q=welcome')).body.data.length, 1)
  assert.equal((await c.del(`/api/sliders/${s.body.data.id}`)).status, 200)
})

// ---------------------------------------------------------------- social
test('social links: validated URLs, unique platform, enable/disable, reorder', async () => {
  const fb = await c.post('/api/social', { platform: 'Facebook', url: 'https://facebook.com/jinnahleague', status: 'PUBLISHED' })
  assert.equal(fb.status, 201)
  assert.equal(fb.body.data.platform, 'facebook', 'platform normalised')
  assert.equal((await c.post('/api/social', { platform: 'facebook', url: 'https://facebook.com/other' })).status, 409)
  assert.equal((await c.post('/api/social', { platform: 'myspace', url: 'https://x.com/a' })).status, 422)
  for (const url of ['not a url', 'javascript:alert(1)', 'ftp://example.com', 'data:text/html,hi'])
    assert.equal((await c.post('/api/social', { platform: 'instagram', url })).status, 422, url)
  const ig = (await c.post('/api/social', { platform: 'instagram', url: 'https://instagram.com/jl', status: 'PUBLISHED' })).body.data

  assert.equal((await pub('social')).body.data.length, 2)
  await c.patch(`/api/social/${ig.id}`, { status: 'DRAFT' })
  assert.deepEqual((await pub('social')).body.data.map((s) => s.platform), ['facebook'], 'disabled link hidden')
  assert.equal((await c.patch(`/api/social/${ig.id}`, { url: 'https://instagram.com/new' })).body.data.url, 'https://instagram.com/new')
  await c.patch('/api/social/reorder', { ids: [ig.id, fb.body.data.id] })
  assert.equal((await c.get('/api/social')).body.data[0].platform, 'instagram')
  assert.equal((await c.del(`/api/social/${ig.id}`)).status, 200)
})

// ---------------------------------------------------------------- sponsors
test('sponsor tiers: benefits, logo, unique name, publish, reorder', async () => {
  const gold = await c.post('/api/sponsors', { name: 'Gold', description: 'Top tier', benefits: ['Logo on jersey', 'VIP seating'], logoMediaId: img.id, status: 'PUBLISHED' })
  assert.equal(gold.status, 201)
  assert.deepEqual(gold.body.data.benefits, ['Logo on jersey', 'VIP seating'])
  assert.equal(gold.body.data.logoMedia.id, img.id)
  assert.equal((await c.post('/api/sponsors', { name: 'Gold' })).status, 409)
  assert.equal((await c.post('/api/sponsors', { name: 'Bad', benefits: [''] })).status, 422)
  assert.equal((await c.post('/api/sponsors', { name: 'Bad', logoMediaId: '00000000-0000-4000-8000-000000000000' })).status, 422)
  const silver = (await c.post('/api/sponsors', { name: 'Silver' })).body.data
  assert.deepEqual(silver.benefits, [])

  const upd = await c.patch(`/api/sponsors/${silver.id}`, { benefits: ['Banner'], status: 'PUBLISHED' })
  assert.deepEqual(upd.body.data.benefits, ['Banner'])
  await c.patch('/api/sponsors/reorder', { ids: [silver.id, gold.body.data.id] })
  assert.deepEqual((await pub('sponsors')).body.data.map((s) => s.name), ['Silver', 'Gold'])
  assert.equal((await c.del(`/api/media/${img.id}`)).status, 409, 'logo in use')
  assert.equal((await c.del(`/api/sponsors/${gold.body.data.id}`)).status, 200)
})

// ---------------------------------------------------------------- press
test('press items: need a link or file, type filter, date, public output', async () => {
  assert.equal((await c.post('/api/press', { title: 'No target', itemType: 'PRESS_COVERAGE' })).status, 422)
  assert.equal((await c.post('/api/press', { title: 'Bad', itemType: 'NEWS', externalUrl: 'https://a.com' })).status, 422)
  assert.equal((await c.post('/api/press', { title: 'Bad', itemType: 'PRESS_COVERAGE', externalUrl: 'javascript:1' })).status, 422)
  assert.equal((await c.post('/api/press', { title: 'Bad date', itemType: 'PRESS_COVERAGE', externalUrl: 'https://a.com', publishedOn: '31/12/2025' })).status, 422)

  const a = await c.post('/api/press', { title: 'Dawn covers JL', itemType: 'PRESS_COVERAGE', sourceName: 'Dawn', publishedOn: '2025-11-02', externalUrl: 'https://dawn.com/x', status: 'PUBLISHED' })
  assert.equal(a.status, 201)
  assert.equal(a.body.data.publishedOn.slice(0, 10), '2025-11-02')
  const pdf = (await c.upload('/api/media', fileForm(PDF, 'kit.pdf', 'application/pdf'))).body.data
  const kit = await c.post('/api/press', { title: 'Media kit', itemType: 'MEDIA_KIT', mediaAssetId: pdf.id, status: 'PUBLISHED' })
  assert.equal(kit.status, 201, 'documents are allowed for press items')

  assert.equal((await c.get('/api/press?itemType=MEDIA_KIT')).body.data.length, 1)
  assert.equal((await c.get('/api/press?q=dawn')).body.data.length, 1)
  assert.equal((await pub('press')).body.data.length, 2)
  assert.equal((await pub('press?itemType=PRESS_COVERAGE')).body.data[0].sourceName, 'Dawn')
  assert.equal((await c.patch(`/api/press/${a.body.data.id}`, { status: 'ARCHIVED' })).status, 200)
  assert.equal((await pub('press')).body.data.length, 1)
})
