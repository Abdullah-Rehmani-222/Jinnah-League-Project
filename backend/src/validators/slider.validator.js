import { z } from 'zod'
import { statusEnum, optText, optUuid, optLink, listQuery, displayOrder } from './common.validator.js'

const base = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200),
  subtitle: optText(200),
  description: optText(2000),
  mediaAssetId: optUuid,
  buttonText: optText(60),
  buttonUrl: optLink,
  status: statusEnum.optional(),
  displayOrder: displayOrder.optional(),
})
export const sliderSchemas = { list: listQuery, create: base, update: base.partial() }
