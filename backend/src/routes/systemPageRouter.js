import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { reorderBody } from '../validators/common.validator.js'
import { pageSchemas, sectionSchemas, sectionParams } from '../validators/page.validator.js'
import { ensureSystemPage } from '../services/page.service.js'
import * as ctrl from '../controllers/pages.controller.js'

/**
 * Admin routes for a content module that is stored as one fixed CMS page (e.g. Legacy = "legacy", JL'26 = "jl26").
 * It reuses pages + page_sections, so no extra tables are needed. The page is created on first use.
 */
export function createSystemPageRouter(slug) {
  const router = Router()
  router.use(authenticate, csrfProtect, async (req, _res, next) => {
    req.pageId = (await ensureSystemPage(slug)).id
    next()
  })
  router.get('/', ctrl.get)
  router.patch('/', validate({ body: pageSchemas.updateSystem }), ctrl.update)
  router.get('/sections', ctrl.listSections)
  router.post('/sections', validate({ body: sectionSchemas.create }), ctrl.addSection)
  router.patch('/sections/reorder', validate({ body: reorderBody }), ctrl.reorderSections)
  router.patch('/sections/:sectionId', validate({ params: sectionParams, body: sectionSchemas.update }), ctrl.updateSection)
  router.delete('/sections/:sectionId', validate({ params: sectionParams }), ctrl.removeSection)
  return router
}
