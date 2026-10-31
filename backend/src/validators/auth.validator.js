import { z } from 'zod'

export const email = z.email('Enter a valid email address.').max(255).transform((s) => s.trim().toLowerCase())

export const loginBody = z.object({
  email,
  password: z.string().min(1, 'Password is required.').max(200),
})
