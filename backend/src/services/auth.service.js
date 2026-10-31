import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { verifyPassword, verifyDummy } from '../utils/password.js'
import { createSession, purgeExpiredSessions } from './session.service.js'

const INVALID = 'Invalid email or password.'

export async function login({ email, password }, ctx) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await verifyDummy(password)
    throw ApiError.unauthorized(INVALID)
  }
  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid) throw ApiError.unauthorized(INVALID)
  if (user.status !== 'ACTIVE') throw ApiError.forbidden('This account has been disabled.')

  const [updated] = await Promise.all([
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
    purgeExpiredSessions(user.id),
  ])
  const { token, session } = await createSession(user.id, ctx)
  return { token, csrfToken: session.csrfToken, user: updated }
}
