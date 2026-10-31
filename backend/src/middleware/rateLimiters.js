import rateLimit from 'express-rate-limit'
import { env } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'

const make = (windowMs, limit, message, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new ApiError(429, message)),
    ...extra,
  })

export const apiLimiter = make(15 * 60_000, env.API_RATE_LIMIT_MAX, 'Too many requests. Please try again later.')
// Only failed attempts count, so legitimate admins are not locked out by their own successful logins.
export const loginLimiter = make(15 * 60_000, env.LOGIN_RATE_LIMIT_MAX, 'Too many login attempts. Please try again in 15 minutes.', {
  skipSuccessfulRequests: true,
})
export const contactLimiter = make(60 * 60_000, env.CONTACT_RATE_LIMIT_MAX, 'Too many messages sent. Please try again later.')
