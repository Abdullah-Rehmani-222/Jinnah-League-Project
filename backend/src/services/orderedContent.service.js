import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { pageArgs } from '../utils/pagination.js'
import { assertMediaExists } from './media.service.js'

/**
 * Shared CRUD for admin-ordered content (gallery, hero slides, social links, sponsor tiers, press items).
 * Each module supplies its Prisma model, searchable columns and which fields point to media assets.
 */
export function createOrderedContentService({ model, label, searchFields = [], include, mediaFields = [], imageOnlyFields = [], filterFields = [] }) {
  const db = () => prisma[model]

  const checkMedia = async (data) => {
    for (const f of mediaFields) if (data[f]) await assertMediaExists(data[f], { imageOnly: imageOnlyFields.includes(f), field: f })
  }

  return {
    label,

    async list(query) {
      const where = {}
      if (query.status) where.status = query.status
      for (const f of filterFields) if (query[f] !== undefined) where[f] = query[f]
      if (query.q && searchFields.length)
        where.OR = searchFields.map((f) => ({ [f]: { contains: query.q, mode: 'insensitive' } }))
      const [items, total] = await Promise.all([
        db().findMany({ where, include, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }], ...pageArgs(query) }),
        db().count({ where }),
      ])
      return { items, total }
    },

    async get(id) {
      const item = await db().findUnique({ where: { id }, include })
      if (!item) throw ApiError.notFound(`${label} not found.`)
      return item
    },

    async create(data) {
      await checkMedia(data)
      if (data.displayOrder === undefined) {
        const agg = await db().aggregate({ _max: { displayOrder: true } })
        data.displayOrder = (agg._max.displayOrder ?? -1) + 1
      }
      return db().create({ data, include })
    },

    async update(id, data) {
      await checkMedia(data)
      return db().update({ where: { id }, data, include }) // P2025 -> 404
    },

    async remove(id) {
      await db().delete({ where: { id } })
    },

    async reorder(ids) {
      const found = await db().count({ where: { id: { in: ids } } })
      if (found !== ids.length) throw ApiError.validation('Some ids do not exist.', [{ location: 'body', field: 'ids', message: 'Unknown id in list.' }])
      await prisma.$transaction(ids.map((id, i) => db().update({ where: { id }, data: { displayOrder: i } })))
    },
  }
}
