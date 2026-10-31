import * as userService from '../services/user.service.js'
import { setSessionCookie } from '../utils/cookies.js'
import { toPublicUser } from '../utils/serializers.js'
import { ok } from '../utils/response.js'

export async function updateMe(req, res) {
  const { user, rotated } = await userService.updateMe(req.user.id, req.valid.body, { ip: req.ip, userAgent: req.get('user-agent') })
  if (rotated) setSessionCookie(res, rotated.token)
  ok(res, { user: toPublicUser(user), ...(rotated ? { csrfToken: rotated.csrfToken } : {}) }, 'Account updated successfully.')
}
