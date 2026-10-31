import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { loginLimiter } from '../middleware/rateLimiters.js'
import { loginBody } from '../validators/auth.validator.js'
import * as ctrl from '../controllers/auth.controller.js'

const router = Router()
router.post('/login', loginLimiter, validate({ body: loginBody }), ctrl.login)
router.post('/logout', authenticate, csrfProtect, ctrl.logout)
router.get('/me', authenticate, ctrl.me)
export default router
