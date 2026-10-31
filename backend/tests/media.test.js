import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { setup, fileForm, uploadPng, PNG, JPG, PDF, EXE } from './helpers.js'

let t, c
before(async () => { t = await setup({ MAX_UPLOAD_MB: '1' }) })
after(() => t.close())
beforeEach(async () => { await t.reset(); ({ c } = await t.loggedIn()) })

test('uploading an image stores the file and the metadata', async () => {
  const r = await c.upload('/api/media', fileForm(PNG, 'Team Photo.png', 'image/png', { altText: 'The team' }))
  assert.equal(r.status, 201)
  const a = r.body.data
  assert.equal(a.originalName, 'Team Photo.png')
  assert.equal(a.mimeType, 'image/png')
  assert.equal(a.fileType, 'IMAGE')
  assert.equal(a.fileSize, PNG.length)
  assert.equal(a.altText, 'The team')
  assert.match(a.fileName, /^[0-9a-f-]{36}\.png$/, 'safe generated name, not the user-supplied one')
  assert.ok(existsSync(path.join(t.uploadDir, a.fileName)))
  assert.ok(a.uploadedById)
  assert.ok(a.fileUrl.endsWith(`/uploads/${a.fileName}`))
  const file = await fetch(`${t.base}/uploads/${a.fileName}`)
  assert.equal(file.status, 200)
  assert.equal(file.headers.get('cross-origin-resource-policy'), 'cross-origin')
  assert.equal(file.headers.get('x-content-type-options'), 'nosniff')
})

test('jpg and pdf uploads are accepted and classified', async () => {
  assert.equal((await c.upload('/api/media', fileForm(JPG, 'a.jpeg', 'image/jpeg'))).body.data.fileType, 'IMAGE')
  const pdf = await c.upload('/api/media', fileForm(PDF, 'kit.pdf', 'application/pdf'))
  assert.equal(pdf.body.data.fileType, 'DOCUMENT')
})

test('executables, scripts, SVG and disguised files are rejected and nothing is stored', async () => {
  const bad = [
    [EXE, 'virus.exe', 'application/x-msdownload'],
    [EXE, 'virus.png', 'image/png'],                       // exe disguised as png (magic bytes differ)
    [Buffer.from('<svg onload=alert(1)>'), 'x.svg', 'image/svg+xml'],
    [Buffer.from('<?php echo 1;'), 'shell.php', 'application/x-php'],
    [PNG, 'photo.exe', 'image/png'],                       // extension does not match type
    [PNG, 'photo.jpg', 'image/png'],                       // extension/type mismatch
    [PNG, 'noextension', 'image/png'],
    [Buffer.from('hello'), 'a.txt', 'text/plain'],
  ]
  for (const [buf, name, type] of bad) {
    const r = await c.upload('/api/media', fileForm(buf, name, type))
    assert.equal(r.status, 422, `${name} (${type}) should be rejected, got ${r.status}`)
  }
  assert.equal(await t.prisma.mediaAsset.count(), 0)
})

test('missing file is a 422; oversize file is a 413', async () => {
  assert.equal((await c.upload('/api/media', new FormData())).status, 422)
  const big = Buffer.concat([PNG, Buffer.alloc(1.5 * 1024 * 1024)])
  const r = await c.upload('/api/media', fileForm(big, 'big.png', 'image/png'))
  assert.equal(r.status, 413)
  assert.equal(await t.prisma.mediaAsset.count(), 0)
})

test('upload needs a session and a CSRF token', async () => {
  assert.equal((await t.client().upload('/api/media', fileForm(PNG, 'a.png', 'image/png'))).status, 401)
  assert.equal((await c.upload('/api/media', fileForm(PNG, 'a.png', 'image/png'), { csrf: false })).status, 403)
})

test('fileType can mark images as LOGO/BANNER but not documents', async () => {
  assert.equal((await uploadPng(c, 'l.png', { fileType: 'LOGO' })).fileType, 'LOGO')
  assert.equal((await c.upload('/api/media', fileForm(PNG, 'x.png', 'image/png', { fileType: 'DOCUMENT' }))).status, 422)
  assert.equal((await c.upload('/api/media', fileForm(PDF, 'x.pdf', 'application/pdf', { fileType: 'LOGO' }))).status, 422)
})

test('list: search, filter by type, paginate', async () => {
  await uploadPng(c, 'alpha-banner.png', { fileType: 'BANNER', altText: 'Hero' })
  await uploadPng(c, 'beta.png')
  await c.upload('/api/media', fileForm(PDF, 'press-kit.pdf', 'application/pdf'))
  assert.equal((await c.get('/api/media')).body.meta.total, 3)
  assert.equal((await c.get('/api/media?q=alpha')).body.data.length, 1)
  assert.equal((await c.get('/api/media?q=hero')).body.data.length, 1, 'searches alt text too')
  assert.equal((await c.get('/api/media?fileType=DOCUMENT')).body.data[0].originalName, 'press-kit.pdf')
  assert.equal((await c.get('/api/media?limit=2&page=2')).body.data.length, 1)
  assert.equal((await c.get('/api/media?fileType=BOGUS')).status, 422)
})

test('details include usage; metadata can be updated', async () => {
  const a = await uploadPng(c)
  const d = await c.get(`/api/media/${a.id}`)
  assert.equal(d.body.data.usage.total, 0)
  const u = await c.patch(`/api/media/${a.id}`, { altText: 'New alt', fileType: 'BANNER' })
  assert.equal(u.body.data.altText, 'New alt')
  assert.equal(u.body.data.fileType, 'BANNER')
  const pdf = (await c.upload('/api/media', fileForm(PDF, 'k.pdf', 'application/pdf'))).body.data
  assert.equal((await c.patch(`/api/media/${pdf.id}`, { fileType: 'LOGO' })).status, 422)
})

test('deleting an unused asset removes the row and the stored file', async () => {
  const a = await uploadPng(c)
  const file = path.join(t.uploadDir, a.fileName)
  assert.ok(existsSync(file))
  assert.equal((await c.del(`/api/media/${a.id}`)).status, 200)
  assert.equal(existsSync(file), false)
  assert.equal((await c.get(`/api/media/${a.id}`)).status, 404)
})

test('an asset that is still in use cannot be deleted (409) and keeps its file', async () => {
  const a = await uploadPng(c)
  assert.equal((await c.post('/api/gallery', { mediaAssetId: a.id, status: 'PUBLISHED' })).status, 201)
  assert.equal((await c.get(`/api/media/${a.id}`)).body.data.usage.galleryItems, 1)
  const r = await c.del(`/api/media/${a.id}`)
  assert.equal(r.status, 409)
  assert.ok(existsSync(path.join(t.uploadDir, a.fileName)))
  assert.equal(await t.prisma.mediaAsset.count(), 1)
})

test('deleting the uploader keeps the files (SET NULL)', async () => {
  const a = await uploadPng(c)
  await t.prisma.session.deleteMany()
  await t.prisma.user.deleteMany()
  const row = await t.prisma.mediaAsset.findUnique({ where: { id: a.id } })
  assert.equal(row.uploadedById, null)
})
