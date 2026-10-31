import { z } from 'zod'
import { statusEnum, httpUrl, listQuery, displayOrder } from './common.validator.js'

export const PLATFORMS = ['facebook', 'instagram', 'x', 'youtube', 'linkedin', 'tiktok', 'whatsapp', 'snapchat', 'telegram', 'discord', 'threads', 'github']

const base = z.object({
  platform: z.string().trim().toLowerCase().pipe(z.enum(PLATFORMS, 'Unsupported platform.')),
  url: httpUrl,
  status: statusEnum.optional(),
  displayOrder: displayOrder.optional(),
})
export const socialSchemas = { list: listQuery, create: base, update: base.partial() }
