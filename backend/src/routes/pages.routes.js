import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { idParam, reorderBody } from '../validators/common.validator.js'
import { pageSchemas, sectionSchemas, sectionParams } from '../validators/page.validator.js'
import * as ctrl from '../controllers/pages.controller.js'

const router = Router()
router.use(authenticate, csrfProtect)

router.get('/', validate({ query: pageSchemas.list }), ctrl.list)
router.post('/', validate({ body: pageSchemas.create }), ctrl.create)
router.get('/:id', validate({ params: idParam }), ctrl.get)
router.patch('/:id', validate({ params: idParam, body: pageSchemas.update }), ctrl.update)
router.delete('/:id', validate({ params: idParam }), ctrl.remove)

router.get('/:id/sections', validate({ params: idParam }), ctrl.listSections)
router.post('/:id/sections', validate({ params: idParam, body: sectionSchemas.create }), ctrl.addSection)
router.patch('/:id/sections/reorder', validate({ params: idParam, body: reorderBody }), ctrl.reorderSections)
router.patch('/:id/sections/:sectionId', validate({ params: sectionParams, body: sectionSchemas.update }), ctrl.updateSection)
router.delete('/:id/sections/:sectionId', validate({ params: sectionParams }), ctrl.removeSection)
export default router
