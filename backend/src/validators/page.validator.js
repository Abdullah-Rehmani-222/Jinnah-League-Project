import { z } from 'zod'
import { paginationQuery } from '../utils/pagination.js'
import { statusEnum, optText, displayOrder } from './common.validator.js'

export const slug = z.string().trim().toLowerCase().min(1).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens only.')

const pageBase = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(150),
  slug,
  description: optText(2000),
  status: statusEnum.optional(),
  metaTitle: optText(200),
  metaDescription: optText(320),
})
export const pageSchemas = {
  list: z.object({
    ...paginationQuery,
    q: z.string().trim().max(100).optional(),
    status: statusEnum.optional(),
    sort: z.enum(['title', 'createdAt', 'updatedAt']).default('updatedAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
  create: pageBase,
  update: pageBase.partial(),
  // System pages (legacy, jl26) keep their slug.
  updateSystem: pageBase.omit({ slug: true }).partial(),
}

const json = z.record(z.string(), z.unknown())
const sectionBase = z.object({
  sectionType: z.string().trim().regex(/^[a-z][a-z0-9_-]{1,49}$/, 'Use lowercase letters, numbers, "-" or "_" (2–50 chars).'),
  title: optText(200),
  content: json.optional(),
  configuration: json.optional(),
  status: statusEnum.optional(),
  displayOrder: displayOrder.optional(),
})
export const sectionSchemas = { create: sectionBase, update: sectionBase.partial() }

export const sectionParams = z.object({ id: z.uuid().optional(), sectionId: z.uuid('Invalid id.') })
export const pageIdParams = z.object({ id: z.uuid('Invalid id.') })
