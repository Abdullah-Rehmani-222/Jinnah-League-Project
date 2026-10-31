import { ApiError } from '../utils/ApiError.js'
import { SESSION_COOKIE } from '../utils/cookies.js'
import { resolveSession } from '../services/session.service.js'

export const authenticate = async (req, _res, next) => {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) throw ApiError.unauthorized()
  const session = await resolveSession(token)
  if (!session) throw ApiError.unauthorized('Your session has expired. Please sign in again.')
  req.user = session.user
  req.auth = { sessionId: session.id, csrfToken: session.csrfToken }
  next()
}

/** Role check. Roles are ordered SUPER_ADMIN > ADMIN > EDITOR; pass the allowed ones explicitly. */
export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.role)) throw ApiError.forbidden()
  next()
}
