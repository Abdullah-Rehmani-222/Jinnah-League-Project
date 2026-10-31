import { z } from 'zod'
import { statusEnum, optText, optUuid, listQuery, displayOrder } from './common.validator.js'

const base = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100),
  description: optText(2000),
  benefits: z.array(z.string().trim().min(1).max(200)).max(30).optional(),
  logoMediaId: optUuid,
  status: statusEnum.optional(),
  displayOrder: displayOrder.optional(),
})
export const sponsorSchemas = { list: listQuery, create: base, update: base.partial() }
