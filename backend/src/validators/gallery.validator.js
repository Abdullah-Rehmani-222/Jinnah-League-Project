import { z } from 'zod'
import { statusEnum, optText, listQuery, displayOrder } from './common.validator.js'

/** Festival editions offered by the Gallery filter. Keep in sync with frontend/src/lib/galleryEditions.js. */
export const EDITIONS = ["JL'22", "JL'23", "JL'24", "JL'25", "JL'26"]
export const editionEnum = z.enum(EDITIONS, 'Choose a valid edition.')

const base = z.object({
  mediaAssetId: z.uuid('Invalid media asset id.'),
  title: optText(150),
  description: optText(2000),
  // "" or null clears the edition.
  edition: z.preprocess((v) => (v === '' ? null : v), editionEnum.nullable().optional()),
  status: statusEnum.optional(),
  displayOrder: displayOrder.optional(),
})
export const gallerySchemas = {
  list: listQuery.extend({ edition: editionEnum.optional() }),
  create: base,
  update: base.partial(),
}
