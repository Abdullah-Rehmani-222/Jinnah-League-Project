import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { updateMeBody } from '../validators/user.validator.js'
import * as ctrl from '../controllers/users.controller.js'
import { me } from '../controllers/auth.controller.js'

const router = Router()
router.use(authenticate)
router.get('/me', me)
router.patch('/me', csrfProtect, validate({ body: updateMeBody }), ctrl.updateMe)
export default router
