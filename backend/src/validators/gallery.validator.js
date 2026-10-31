import { z } from 'zod'
import { statusEnum, optText, listQuery, displayOrder } from './common.validator.js'

const base = z.object({
  mediaAssetId: z.uuid('Invalid media asset id.'),
  title: optText(150),
  description: optText(2000),
  status: statusEnum.optional(),
  displayOrder: displayOrder.optional(),
})
export const gallerySchemas = { list: listQuery, create: base, update: base.partial() }
