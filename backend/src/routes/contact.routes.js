import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { contactLimiter } from '../middleware/rateLimiters.js'
import { idParam } from '../validators/common.validator.js'
import { contactSubmitBody, contactListQuery, contactStatusBody } from '../validators/contact.validator.js'
import * as ctrl from '../controllers/contact.controller.js'

const router = Router()

// Public: the website's contact form.
router.post('/', contactLimiter, validate({ body: contactSubmitBody }), ctrl.submit)

// Admin
router.get('/', authenticate, validate({ query: contactListQuery }), ctrl.list)
router.get('/:id', authenticate, validate({ params: idParam }), ctrl.get)
router.patch('/:id/status', authenticate, csrfProtect, validate({ params: idParam, body: contactStatusBody }), ctrl.setStatus)
router.delete('/:id', authenticate, csrfProtect, validate({ params: idParam }), ctrl.remove)
export default router
