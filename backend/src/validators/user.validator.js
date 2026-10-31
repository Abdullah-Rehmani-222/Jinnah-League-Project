import { z } from 'zod'
import { email } from './auth.validator.js'

// The Admin Account form posts every field; empty strings mean "unchanged".
const blank = (schema) => z.preprocess((v) => (v === '' ? undefined : v), schema.optional())

export const updateMeBody = z
  .object({
    name: blank(z.string().trim().min(2, 'Name must be at least 2 characters.').max(100)),
    email: blank(email),
    currentPassword: blank(z.string().max(200)),
    newPassword: blank(z.string().min(10, 'Password must be at least 10 characters.').max(128)),
    confirmPassword: blank(z.string().max(128)),
  })
  .superRefine((v, ctx) => {
    if (v.newPassword !== undefined && v.newPassword !== v.confirmPassword)
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' })
    if (v.name === undefined && v.email === undefined && v.newPassword === undefined)
      ctx.addIssue({ code: 'custom', path: [], message: 'Nothing to update.' })
  })
