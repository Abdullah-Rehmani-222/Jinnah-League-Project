import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setup } from './helpers.js'

let t, c
before(async () => { t = await setup() })
after(() => t.close())
beforeEach(async () => { await t.reset(); ({ c } = await t.loggedIn()) })

const mkPage = (over = {}) => c.post('/api/pages', { title: 'Rules', slug: 'rules', ...over })

test('create, read, update, delete a page', async () => {
  const created = await mkPage({ description: 'League rules' })
  assert.equal(created.status, 201)
  assert.equal(created.body.data.status, 'DRAFT')
  const id = created.body.data.id
  assert.equal((await c.get(`/api/pages/${id}`)).body.data.slug, 'rules')
  const upd = await c.patch(`/api/pages/${id}`, { title: 'League Rules', metaTitle: 'Rules | JL' })
  assert.equal(upd.body.data.title, 'League Rules')
  assert.equal(upd.body.data.slug, 'rules', 'unchanged fields are untouched')
  assert.equal((await c.del(`/api/pages/${id}`)).status, 200)
  assert.equal((await c.get(`/api/pages/${id}`)).status, 404)
})

test('slug rules: format validated, duplicates rejected', async () => {
  assert.equal((await mkPage({ slug: 'Bad Slug!' })).status, 422)
  assert.equal((await mkPage({ slug: '-lead' })).status, 422)
  assert.equal((await mkPage()).status, 201)
  const dup = await mkPage({ title: 'Other' })
  assert.equal(dup.status, 409)
  assert.equal(dup.body.success, false)
})

test('invalid and unknown ids', async () => {
  assert.equal((await c.get('/api/pages/not-a-uuid')).status, 422)
  assert.equal((await c.get('/api/pages/00000000-0000-4000-8000-000000000000')).status, 404)
  assert.equal((await c.patch('/api/pages/00000000-0000-4000-8000-000000000000', { title: 'x' })).status, 404)
})

test('list supports search, status filter, pagination metadata', async () => {
  for (const n of ['alpha', 'beta', 'gamma']) await mkPage({ title: n.toUpperCase(), slug: n })
  await c.patch(`/api/pages/${(await t.prisma.page.findUnique({ where: { slug: 'beta' } })).id}`, { status: 'PUBLISHED' })
  const all = await c.get('/api/pages?limit=2&sort=title&order=asc')
  assert.equal(all.body.data.length, 2)
  assert.deepEqual(all.body.meta, { page: 1, limit: 2, total: 3, totalPages: 2 })
  assert.equal((await c.get('/api/pages?q=gam')).body.data.length, 1)
  assert.equal((await c.get('/api/pages?status=PUBLISHED')).body.data[0].slug, 'beta')
  assert.equal((await c.get('/api/pages?limit=1000')).status, 422)
})

test('publish / unpublish controls public visibility', async () => {
  const { body } = await mkPage()
  const id = body.data.id
  assert.equal((await t.client().get('/api/public/pages/rules')).status, 404, 'draft is not public')
  await c.patch(`/api/pages/${id}`, { status: 'PUBLISHED' })
  assert.equal((await t.client().get('/api/public/pages/rules')).status, 200)
  await c.patch(`/api/pages/${id}`, { status: 'DRAFT' })
  assert.equal((await t.client().get('/api/public/pages/rules')).status, 404)
})

test('sections: add, update, reorder, delete; only published sections are public', async () => {
  const id = (await mkPage({ status: 'PUBLISHED' })).body.data.id
  const a = (await c.post(`/api/pages/${id}/sections`, { sectionType: 'text', title: 'A', content: { body: 'hello' } })).body.data
  const b = (await c.post(`/api/pages/${id}/sections`, { sectionType: 'cards', title: 'B', configuration: { columns: 3 } })).body.data
  assert.deepEqual([a.displayOrder, b.displayOrder], [0, 1], 'appended in order')
  assert.deepEqual(a.content, { body: 'hello' })

  assert.equal((await c.post(`/api/pages/${id}/sections`, { sectionType: 'Bad Type' })).status, 422)
  assert.equal((await c.post(`/api/pages/${id}/sections`, { sectionType: 'text', content: 'not-an-object' })).status, 422)

  assert.equal((await c.patch(`/api/pages/${id}/sections/${a.id}`, { title: 'A2', status: 'PUBLISHED' })).body.data.title, 'A2')
  const pub = await t.client().get('/api/public/pages/rules')
  assert.deepEqual(pub.body.data.sections.map((s) => s.title), ['A2'], 'draft section B hidden')

  assert.equal((await c.patch(`/api/pages/${id}/sections/reorder`, { ids: [b.id, a.id] })).status, 200)
  const detail = (await c.get(`/api/pages/${id}`)).body.data.sections
  assert.deepEqual(detail.map((s) => s.title), ['B', 'A2'])

  assert.equal((await c.del(`/api/pages/${id}/sections/${a.id}`)).status, 200)
  assert.equal((await c.get(`/api/pages/${id}/sections`)).body.data.length, 1)
})

test('a section cannot be touched through another page', async () => {
  const p1 = (await mkPage()).body.data.id
  const p2 = (await mkPage({ title: 'Two', slug: 'two' })).body.data.id
  const s = (await c.post(`/api/pages/${p1}/sections`, { sectionType: 'text' })).body.data
  assert.equal((await c.patch(`/api/pages/${p2}/sections/${s.id}`, { title: 'x' })).status, 404)
  assert.equal((await c.del(`/api/pages/${p2}/sections/${s.id}`)).status, 404)
  assert.equal((await c.patch(`/api/pages/${p2}/sections/reorder`, { ids: [s.id] })).status, 422)
})

test('deleting a page removes its sections (cascade) but system pages are protected', async () => {
  const id = (await mkPage()).body.data.id
  await c.post(`/api/pages/${id}/sections`, { sectionType: 'text' })
  await c.del(`/api/pages/${id}`)
  assert.equal(await t.prisma.pageSection.count(), 0)

  const home = (await c.get('/api/pages?q=home')).body.data[0] ?? (await t.prisma.page.create({ data: { slug: 'home', title: 'Home' } }))
  assert.equal((await c.del(`/api/pages/${home.id}`)).status, 409)
  assert.equal((await c.patch(`/api/pages/${home.id}`, { slug: 'start' })).status, 409)
  assert.equal((await c.patch(`/api/pages/${home.id}`, { title: 'Welcome' })).status, 200)
})

for (const [route, slug] of [['legacy', 'legacy'], ['jl26', 'jl26']]) {
  test(`/api/${route}: page is created on demand; sections and publishing work`, async () => {
    assert.equal(await t.prisma.page.count({ where: { slug } }), 0)
    const first = await c.get(`/api/${route}`)
    assert.equal(first.status, 200)
    assert.equal(first.body.data.slug, slug)
    assert.equal(await t.prisma.page.count({ where: { slug } }), 1)

    const sec = await c.post(`/api/${route}/sections`, { sectionType: 'timeline', title: 'Milestone', content: { year: 2024 }, status: 'PUBLISHED' })
    assert.equal(sec.status, 201)
    assert.equal((await c.patch(`/api/${route}/sections/${sec.body.data.id}`, { title: 'Milestone 2' })).body.data.title, 'Milestone 2')

    assert.equal((await t.client().get(`/api/public/pages/${slug}`)).status, 404, 'unpublished')
    assert.equal((await c.patch(`/api/${route}`, { status: 'PUBLISHED', slug: 'hijack' })).body.data.slug, slug, 'slug cannot be changed')
    const pub = await t.client().get(`/api/public/pages/${slug}`)
    assert.equal(pub.body.data.sections[0].title, 'Milestone 2')

    assert.equal((await c.del(`/api/${route}/sections/${sec.body.data.id}`)).status, 200)
    assert.equal((await c.get(`/api/${route}/sections`)).body.data.length, 0)
  })
}
