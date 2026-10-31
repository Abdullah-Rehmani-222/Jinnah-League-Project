import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { pageArgs } from '../utils/pagination.js'

/** Pages the website depends on. They can be edited and (un)published but never deleted or renamed. */
export const SYSTEM_PAGES = {
  home: 'Home',
  about: 'About',
  legacy: "Legacy — JL'24 National Expansion",
  jl26: "JL'26 — Competitions & Events",
  sponsors: 'Sponsors',
  media: 'Media & Press',
  gallery: 'Gallery',
  contact: 'Contact',
}
const sections = { orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }

export async function ensureSystemPage(slug) {
  const title = SYSTEM_PAGES[slug]
  if (!title) throw ApiError.notFound('Page not found.')
  return prisma.page.upsert({ where: { slug }, update: {}, create: { slug, title } })
}

export async function list(query) {
  const where = {}
  if (query.status) where.status = query.status
  if (query.q)
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { slug: { contains: query.q, mode: 'insensitive' } },
    ]
  const [items, total] = await Promise.all([
    prisma.page.findMany({ where, orderBy: { [query.sort]: query.order }, ...pageArgs(query), include: { _count: { select: { sections: true } } } }),
    prisma.page.count({ where }),
  ])
  return { items, total }
}

export async function get(id) {
  const page = await prisma.page.findUnique({ where: { id }, include: { sections } })
  if (!page) throw ApiError.notFound('Page not found.')
  return page
}

export const create = (data) => prisma.page.create({ data }) // duplicate slug -> 409

export async function update(id, data) {
  const page = await prisma.page.findUnique({ where: { id }, select: { slug: true } })
  if (!page) throw ApiError.notFound('Page not found.')
  if (data.slug && data.slug !== page.slug && SYSTEM_PAGES[page.slug])
    throw ApiError.conflict('The address (slug) of a system page cannot be changed.')
  return prisma.page.update({ where: { id }, data })
}

export async function remove(id) {
  const page = await prisma.page.findUnique({ where: { id }, select: { slug: true } })
  if (!page) throw ApiError.notFound('Page not found.')
  if (SYSTEM_PAGES[page.slug]) throw ApiError.conflict('System pages cannot be deleted. Unpublish it instead.')
  await prisma.page.delete({ where: { id } }) // sections cascade
}

// ---- sections -------------------------------------------------------------------------------
const assertPage = async (pageId) => {
  if (!(await prisma.page.findUnique({ where: { id: pageId }, select: { id: true } }))) throw ApiError.notFound('Page not found.')
}
const findSection = async (pageId, sectionId) => {
  const s = await prisma.pageSection.findFirst({ where: { id: sectionId, pageId } })
  if (!s) throw ApiError.notFound('Section not found.')
  return s
}

export async function listSections(pageId) {
  await assertPage(pageId)
  return prisma.pageSection.findMany({ where: { pageId }, ...sections })
}

export async function addSection(pageId, data) {
  await assertPage(pageId)
  if (data.displayOrder === undefined) {
    const agg = await prisma.pageSection.aggregate({ where: { pageId }, _max: { displayOrder: true } })
    data.displayOrder = (agg._max.displayOrder ?? -1) + 1
  }
  return prisma.pageSection.create({ data: { ...data, pageId } })
}

export async function updateSection(pageId, sectionId, data) {
  await findSection(pageId, sectionId)
  return prisma.pageSection.update({ where: { id: sectionId }, data })
}

export async function removeSection(pageId, sectionId) {
  await findSection(pageId, sectionId)
  await prisma.pageSection.delete({ where: { id: sectionId } })
}

export async function reorderSections(pageId, ids) {
  await assertPage(pageId)
  const found = await prisma.pageSection.count({ where: { pageId, id: { in: ids } } })
  if (found !== ids.length)
    throw ApiError.validation('Some ids are not sections of this page.', [{ location: 'body', field: 'ids', message: 'Unknown section id.' }])
  await prisma.$transaction(ids.map((id, i) => prisma.pageSection.update({ where: { id }, data: { displayOrder: i } })))
}
