import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate, authorize } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { settingsUpdateBody } from '../validators/settings.validator.js'
import * as ctrl from '../controllers/settings.controller.js'

const router = Router()
router.use(authenticate, csrfProtect)
router.get('/', ctrl.get)
// Site-wide identity/branding: administrators only (editors can read but not change).
router.put('/', authorize('SUPER_ADMIN', 'ADMIN'), validate({ body: settingsUpdateBody }), ctrl.update)
export default router
