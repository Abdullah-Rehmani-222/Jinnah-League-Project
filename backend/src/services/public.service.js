import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { pageArgs } from '../utils/pagination.js'
import { SETTINGS } from '../validators/settings.validator.js'

const published = { status: 'PUBLISHED' }
const order = [{ displayOrder: 'asc' }, { createdAt: 'desc' }]
const media = { select: { id: true, fileUrl: true, altText: true, mimeType: true } }

export const heroSlides = () => prisma.heroSlide.findMany({ where: published, orderBy: order, include: { mediaAsset: media } })
export const sponsors = () => prisma.sponsorTier.findMany({ where: published, orderBy: order, include: { logoMedia: media } })
export const social = () => prisma.socialLink.findMany({ where: published, orderBy: order, select: { id: true, platform: true, url: true } })
export const press = ({ itemType }) =>
  prisma.pressItem.findMany({ where: { ...published, ...(itemType ? { itemType } : {}) }, orderBy: order, include: { mediaAsset: media } })

export async function gallery(query) {
  const [items, total] = await Promise.all([
    prisma.galleryItem.findMany({ where: published, orderBy: order, include: { mediaAsset: media }, ...pageArgs(query) }),
    prisma.galleryItem.count({ where: published }),
  ])
  return { items, total }
}

export async function page(slug) {
  const p = await prisma.page.findFirst({
    where: { slug, ...published },
    include: { sections: { where: published, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] } },
  })
  if (!p) throw ApiError.notFound('Page not found.')
  return p
}

export async function settings() {
  const rows = await prisma.websiteSetting.findMany({ include: { mediaAsset: true } })
  const out = {}
  for (const r of rows) {
    if (!SETTINGS[r.settingKey]) continue
    out[r.settingKey] = SETTINGS[r.settingKey].media ? (r.mediaAsset?.fileUrl ?? null) : r.settingValue
  }
  return out
}
