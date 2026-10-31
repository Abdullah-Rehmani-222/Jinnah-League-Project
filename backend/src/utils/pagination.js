import { z } from 'zod'

export const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}

export const pageArgs = ({ page, limit }) => ({ skip: (page - 1) * limit, take: limit })

export const buildMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
})
