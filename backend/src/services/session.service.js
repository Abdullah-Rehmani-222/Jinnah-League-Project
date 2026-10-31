import { prisma } from '../config/database.js'
import { env } from '../config/environment.js'
import { hashToken, randomToken } from '../utils/crypto.js'

const idleMs = () => env.SESSION_IDLE_HOURS * 3_600_000
const absoluteMs = () => env.SESSION_ABSOLUTE_DAYS * 86_400_000
const TOUCH_INTERVAL_MS = 5 * 60_000

export async function createSession(userId, { ip, userAgent } = {}) {
  const token = randomToken(32)
  const session = await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      csrfToken: randomToken(24),
      userId,
      ipAddress: ip?.slice(0, 64) ?? null,
      userAgent: userAgent?.slice(0, 255) ?? null,
      expiresAt: new Date(Date.now() + idleMs()),
    },
  })
  return { token, session }
}

/** Returns the session (with its user) if the cookie token is valid, else null. Extends idle expiry while active. */
export async function resolveSession(token) {
  const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } })
  if (!session) return null
  const now = Date.now()
  const absoluteEnd = session.createdAt.getTime() + absoluteMs()
  if (session.expiresAt.getTime() <= now || absoluteEnd <= now || session.user.status !== 'ACTIVE') {
    await prisma.session.deleteMany({ where: { id: session.id } })
    return null
  }
  if (now - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date(now), expiresAt: new Date(Math.min(now + idleMs(), absoluteEnd)) },
    })
  }
  return session
}

export const destroySession = (id) => prisma.session.deleteMany({ where: { id } })
export const destroyAllUserSessions = (userId) => prisma.session.deleteMany({ where: { userId } })
export const purgeExpiredSessions = (userId) =>
  prisma.session.deleteMany({ where: { userId, expiresAt: { lte: new Date() } } })

/** After a credential change: revoke every session of the user and issue a fresh one for the current device. */
export async function rotateSessions(userId, ctx) {
  await destroyAllUserSessions(userId)
  return createSession(userId, ctx)
}
