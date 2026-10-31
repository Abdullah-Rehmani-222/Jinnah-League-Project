import { z } from 'zod'
import { paginationQuery } from '../utils/pagination.js'

export const idParam = z.object({ id: z.uuid('Invalid id.') })
export const statusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])

const isHttpUrl = (v) => {
  try { return ['http:', 'https:'].includes(new URL(v).protocol) } catch { return false }
}
/** Absolute http(s) URL only — rejects javascript:, data:, etc. */
export const httpUrl = z.string().trim().max(2048).refine(isHttpUrl, 'Enter a valid http(s) URL.')
/** Button/link target: absolute http(s) URL or an in-site path such as "/about" or "#/about". */
export const safeLink = z.string().trim().max(2048).refine((v) => isHttpUrl(v) || /^(\/(?!\/)|#\/)/.test(v), 'Enter a valid URL or an in-site path.')

const emptyToNull = (v) => (v === '' ? null : v)
/** Optional text where "" clears the field. */
export const optText = (max) => z.preprocess(emptyToNull, z.string().trim().max(max).nullable().optional())
export const optUuid = z.preprocess(emptyToNull, z.uuid('Invalid id.').nullable().optional())
export const optLink = z.preprocess(emptyToNull, safeLink.nullable().optional())
export const displayOrder = z.coerce.number().int().min(0).max(1_000_000)

export const listQuery = z.object({
  ...paginationQuery,
  q: z.string().trim().max(100).optional(),
  status: statusEnum.optional(),
})

export const reorderBody = z.object({
  ids: z.array(z.uuid()).min(1).max(500).refine((a) => new Set(a).size === a.length, 'ids must be unique.'),
})
