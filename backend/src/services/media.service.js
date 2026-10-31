import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { inspectUpload } from '../utils/fileValidation.js'
import { getStorage } from '../utils/storage/index.js'
import { pageArgs } from '../utils/pagination.js'
import { logger } from '../utils/logger.js'

const IMAGE_TYPES = ['IMAGE', 'LOGO', 'BANNER']

/** Throws a 422 if the id does not point to an existing media asset (optionally: an image). */
export async function assertMediaExists(id, { imageOnly = false, field = 'mediaAssetId' } = {}) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: { id: true, fileType: true } })
  const fail = (message) => ApiError.validation('Validation failed.', [{ location: 'body', field, message }])
  if (!asset) throw fail('Media asset not found.')
  if (imageOnly && !IMAGE_TYPES.includes(asset.fileType)) throw fail('Media asset must be an image.')
}

const cleanName = (name) => path.basename(String(name)).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 255) || 'file'

export async function upload({ file, altText, fileType, userId }) {
  if (!file) throw ApiError.validation('Validation failed.', [{ location: 'body', field: 'file', message: 'A file is required.' }])
  const check = inspectUpload({ originalName: file.originalname, mimeType: file.mimetype, buffer: file.buffer })
  if (!check.ok) throw ApiError.validation('Validation failed.', [{ location: 'body', field: 'file', message: check.reason }])

  let type = check.kind
  if (fileType) {
    const compatible = check.kind === 'IMAGE' ? IMAGE_TYPES : ['DOCUMENT', 'OTHER']
    if (!compatible.includes(fileType))
      throw ApiError.validation('Validation failed.', [{ location: 'body', field: 'fileType', message: `fileType ${fileType} does not match the uploaded file.` }])
    type = fileType
  }

  const key = `${randomUUID()}${check.ext}` // never derived from the user's file name
  const storage = await getStorage()
  const { url } = await storage.put({ key, buffer: file.buffer, mimeType: check.mime })
  try {
    return await prisma.mediaAsset.create({
      data: {
        fileName: key,
        originalName: cleanName(file.originalname),
        fileUrl: url,
        fileType: type,
        mimeType: check.mime,
        fileSize: file.size,
        altText: altText ?? null,
        uploadedById: userId,
      },
    })
  } catch (err) {
    await storage.remove(key).catch(() => {}) // don't leave an orphan file if the DB write fails
    throw err
  }
}

export async function list(query) {
  const where = {}
  if (query.fileType) where.fileType = query.fileType
  if (query.q)
    where.OR = [
      { originalName: { contains: query.q, mode: 'insensitive' } },
      { altText: { contains: query.q, mode: 'insensitive' } },
    ]
  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({ where, orderBy: { createdAt: 'desc' }, ...pageArgs(query) }),
    prisma.mediaAsset.count({ where }),
  ])
  return { items, total }
}

export async function getUsage(id) {
  const where = { mediaAssetId: id }
  const [galleryItems, heroSlides, sponsorTiers, pressItems, websiteSettings] = await Promise.all([
    prisma.galleryItem.count({ where }),
    prisma.heroSlide.count({ where }),
    prisma.sponsorTier.count({ where: { logoMediaId: id } }),
    prisma.pressItem.count({ where }),
    prisma.websiteSetting.count({ where }),
  ])
  const usage = { galleryItems, heroSlides, sponsorTiers, pressItems, websiteSettings }
  return { ...usage, total: Object.values(usage).reduce((a, b) => a + b, 0) }
}

export async function get(id) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw ApiError.notFound('Media asset not found.')
  return { ...asset, usage: await getUsage(id) }
}

export async function update(id, data) {
  if (data.fileType) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: { mimeType: true } })
    if (!asset) throw ApiError.notFound('Media asset not found.')
    const isImage = asset.mimeType.startsWith('image/')
    const ok = isImage ? IMAGE_TYPES.includes(data.fileType) : ['DOCUMENT', 'OTHER'].includes(data.fileType)
    if (!ok) throw ApiError.validation('Validation failed.', [{ location: 'body', field: 'fileType', message: 'fileType does not match this file.' }])
  }
  return prisma.mediaAsset.update({ where: { id }, data })
}

export async function remove(id) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } })
  if (!asset) throw ApiError.notFound('Media asset not found.')
  const usage = await getUsage(id)
  if (usage.total > 0)
    throw ApiError.conflict('This file is still used by website content. Remove it from there first.', [{ field: 'usage', message: JSON.stringify(usage) }])
  await prisma.mediaAsset.delete({ where: { id } })
  try {
    await (await getStorage()).remove(asset.fileName)
  } catch (err) {
    logger.error({ err, key: asset.fileName }, 'Media row deleted but storage object could not be removed')
  }
}
