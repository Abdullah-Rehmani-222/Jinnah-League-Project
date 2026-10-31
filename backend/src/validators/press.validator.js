import { z } from 'zod'
import { statusEnum, optText, optUuid, httpUrl, listQuery, displayOrder } from './common.validator.js'

const itemType = z.enum(['PRESS_COVERAGE', 'MEDIA_KIT'])
const emptyToNull = (v) => (v === '' ? null : v)

const base = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(250),
  description: optText(2000),
  itemType,
  sourceName: optText(150),
  publishedOn: z.preprocess(emptyToNull, z.iso.date('Use YYYY-MM-DD.').transform((s) => new Date(s)).nullable().optional()),
  mediaAssetId: optUuid,
  externalUrl: z.preprocess(emptyToNull, httpUrl.nullable().optional()),
  status: statusEnum.optional(),
  displayOrder: displayOrder.optional(),
})

export const pressSchemas = {
  list: listQuery.extend({ itemType: itemType.optional() }),
  // A press item needs something to open: an external link or an uploaded file.
  create: base.refine((v) => v.externalUrl || v.mediaAssetId, { path: ['externalUrl'], message: 'Provide an external URL or a media file.' }),
  update: base.partial(),
}
