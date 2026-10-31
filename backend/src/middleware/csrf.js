import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/environment.js'
import { safeEqual } from '../utils/crypto.js'

const SAFE = new Set(['GET', 'HEAD', 'OPTIONS'])

/** Synchronizer-token CSRF check. Mount AFTER authenticate. The CMS sends the token from /auth/me or /auth/login. */
export const csrfProtect = (req, _res, next) => {
  if (SAFE.has(req.method)) return next()
  if (!req.auth || !safeEqual(req.get('x-csrf-token'), req.auth.csrfToken))
    throw ApiError.forbidden('Invalid or missing CSRF token.')
  next()
}

/** Defence in depth: a browser-sent Origin on a state-changing request must be an approved frontend. */
export const originCheck = (req, _res, next) => {
  if (SAFE.has(req.method)) return next()
  const origin = req.get('origin')
  if (origin && !env.allowedOrigins.includes(origin)) throw ApiError.forbidden('Origin not allowed.')
  next()
}
