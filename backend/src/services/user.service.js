import { prisma } from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { rotateSessions } from './session.service.js'

/**
 * Admin Account form. Display name can change freely; email or password changes require the current password.
 * After a credential change every session is revoked and a fresh one is issued for the current device.
 */
export async function updateMe(userId, input, ctx) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const data = {}
  const emailChanged = input.email !== undefined && input.email !== user.email
  const passwordChanged = input.newPassword !== undefined

  if (input.name !== undefined) data.name = input.name

  if (emailChanged || passwordChanged) {
    if (!input.currentPassword || !(await verifyPassword(user.passwordHash, input.currentPassword)))
      throw ApiError.validation('Validation failed.', [{ location: 'body', field: 'currentPassword', message: 'Current password is incorrect.' }])
    if (emailChanged) data.email = input.email
    if (passwordChanged) {
      if (await verifyPassword(user.passwordHash, input.newPassword))
        throw ApiError.validation('Validation failed.', [{ location: 'body', field: 'newPassword', message: 'New password must be different from the current password.' }])
      data.passwordHash = await hashPassword(input.newPassword)
    }
  }

  const updated = await prisma.user.update({ where: { id: userId }, data }) // P2002 -> 409 for a duplicate email
  if (emailChanged || passwordChanged) {
    const { token, session } = await rotateSessions(userId, ctx)
    return { user: updated, rotated: { token, csrfToken: session.csrfToken } }
  }
  return { user: updated, rotated: null }
}
