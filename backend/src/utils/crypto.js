import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { env } from '../config/environment.js'

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url')

/** Keyed hash so a leaked sessions table cannot be turned into valid cookies without SESSION_SECRET. */
export const hashToken = (token) => createHmac('sha256', env.SESSION_SECRET).update(token).digest('hex')

export const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ''))
  const y = Buffer.from(String(b ?? ''))
  return x.length === y.length && timingSafeEqual(x, y)
}
