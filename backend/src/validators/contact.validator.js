import { z } from 'zod'
import { paginationQuery } from '../utils/pagination.js'
import { email } from './auth.validator.js'

// Strip control characters (keeps \n and \t in the message body).
const clean = (s) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
const oneLine = (s) => clean(s).replace(/\s+/g, ' ')

export const contactSubmitBody = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100).transform(oneLine),
  email,
  subject: z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().max(200).transform(oneLine).optional()),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(5000).transform(clean),
  // Honeypot: hidden in the form; real users leave it empty, bots fill it in.
  website: z.string().max(500).optional(),
})

const messageStatus = z.enum(['UNREAD', 'READ', 'RESOLVED'])
export const contactListQuery = z.object({
  ...paginationQuery,
  q: z.string().trim().max(100).optional(),
  status: messageStatus.optional(),
})
export const contactStatusBody = z.object({ status: messageStatus })
