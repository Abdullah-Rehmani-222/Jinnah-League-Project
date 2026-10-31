import * as authService from '../services/auth.service.js'
import { destroySession } from '../services/session.service.js'
import { setSessionCookie, clearSessionCookie } from '../utils/cookies.js'
import { toPublicUser } from '../utils/serializers.js'
import { ok } from '../utils/response.js'

const ctxOf = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') })

export async function login(req, res) {
  const { token, csrfToken, user } = await authService.login(req.valid.body, ctxOf(req))
  setSessionCookie(res, token)
  ok(res, { user: toPublicUser(user), csrfToken }, 'Signed in successfully.')
}

export async function logout(req, res) {
  await destroySession(req.auth.sessionId)
  clearSessionCookie(res)
  ok(res, null, 'Signed out successfully.')
}

export const me = (req, res) => ok(res, { user: toPublicUser(req.user), csrfToken: req.auth.csrfToken })
