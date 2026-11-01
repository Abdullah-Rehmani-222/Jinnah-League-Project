import { z } from 'zod'
import { paginationQuery } from '../utils/pagination.js'
import { optText } from './common.validator.js'

const fileType = z.enum(['IMAGE', 'LOGO', 'BANNER', 'DOCUMENT', 'OTHER'])

export const mediaListQuery = z.object({
  ...paginationQuery,
  q: z.string().trim().max(100).optional(),
  fileType: fileType.optional(),
})
export const mediaUploadBody = z.object({ altText: optText(255), fileType: fileType.optional() })
export const mediaUpdateBody = z.object({ originalName: z.string().trim().min(1, 'File name is required.').max(255).optional(), altText: optText(255), fileType: fileType.optional() })
