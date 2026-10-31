import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setup, uploadPng } from './helpers.js'

let t, c
before(async () => { t = await setup() })
after(() => t.close())
beforeEach(async () => { await t.reset(); ({ c } = await t.loggedIn()) })

test('GET returns every known key (null when unset)', async () => {
  const r = await c.get('/api/settings')
  assert.equal(r.status, 200)
  assert.equal(r.body.data.site_name, null)
  assert.equal(r.body.data.logo, null)
  assert.ok('favicon' in r.body.data && 'contact_email' in r.body.data)
})

test('update text settings, then clear one', async () => {
  const r = await c.put('/api/settings', { settings: { site_name: 'Jinnah League', contact_email: 'info@jl.org', footer_text: '© JL' } })
  assert.equal(r.status, 200)
  assert.equal(r.body.data.site_name, 'Jinnah League')
  assert.equal((await c.get('/api/settings')).body.data.contact_email, 'info@jl.org')
  const cleared = await c.put('/api/settings', { settings: { footer_text: '' } })
  assert.equal(cleared.body.data.footer_text, null)
  assert.equal(await t.prisma.websiteSetting.count({ where: { settingKey: 'site_name' } }), 1, 'upsert, not duplicates')
})

test('validation: unknown keys, bad email, empty payload, over-long values', async () => {
  assert.equal((await c.put('/api/settings', { settings: { evil_key: 'x' } })).status, 422)
  assert.equal((await c.put('/api/settings', { settings: { contact_email: 'nope' } })).status, 422)
  assert.equal((await c.put('/api/settings', { settings: {} })).status, 422)
  assert.equal((await c.put('/api/settings', { settings: { tagline: 'x'.repeat(201) } })).status, 422)
  assert.equal(await t.prisma.websiteSetting.count(), 0, 'a rejected request saves nothing')
})

test('logo and favicon reference media assets and protect them from deletion', async () => {
  const logo = await uploadPng(c, 'logo.png', { fileType: 'LOGO' })
  const r = await c.put('/api/settings', { settings: { logo: logo.id } })
  assert.equal(r.body.data.logo.id, logo.id)
  assert.ok(r.body.data.logo.url)
  assert.equal((await c.put('/api/settings', { settings: { favicon: '00000000-0000-4000-8000-000000000000' } })).status, 422)
  assert.equal((await c.del(`/api/media/${logo.id}`)).status, 409)

  const pub = await t.client().get('/api/public/settings')
  assert.ok(pub.body.data.logo.endsWith(logo.fileName))
  await c.put('/api/settings', { settings: { logo: null } })
  assert.equal((await c.del(`/api/media/${logo.id}`)).status, 200)
})

test('editors may read settings but not change them (403)', async () => {
  const { c: editor } = await t.loggedIn({ email: 'editor@example.com', role: 'EDITOR' })
  assert.equal((await editor.get('/api/settings')).status, 200)
  assert.equal((await editor.put('/api/settings', { settings: { site_name: 'Hacked' } })).status, 403)
  const { c: admin } = await t.loggedIn({ email: 'admin2@example.com', role: 'ADMIN' })
  assert.equal((await admin.put('/api/settings', { settings: { site_name: 'Ok' } })).status, 200)
})

test('settings update needs CSRF token', async () => {
  assert.equal((await c.put('/api/settings', { settings: { site_name: 'x' } }, { csrf: false })).status, 403)
})
