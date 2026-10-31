import { env } from '../config/environment.js'

export const SESSION_COOKIE = 'jl_sid'

const base = () => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
})

export const setSessionCookie = (res, token) =>
  res.cookie(SESSION_COOKIE, token, { ...base(), maxAge: env.SESSION_ABSOLUTE_DAYS * 24 * 3600 * 1000 })

export const clearSessionCookie = (res) => res.clearCookie(SESSION_COOKIE, base())
