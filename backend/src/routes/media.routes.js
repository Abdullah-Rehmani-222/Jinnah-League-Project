import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { uploadSingle } from '../middleware/upload.js'
import { idParam } from '../validators/common.validator.js'
import { mediaListQuery, mediaUploadBody, mediaUpdateBody } from '../validators/media.validator.js'
import * as ctrl from '../controllers/media.controller.js'

const router = Router()
router.use(authenticate, csrfProtect)
router.get('/', validate({ query: mediaListQuery }), ctrl.list)
// multipart: field "file" (+ optional altText, fileType). Multer runs first, then validation of the text fields.
router.post('/', uploadSingle, validate({ body: mediaUploadBody }), ctrl.upload)
router.get('/:id', validate({ params: idParam }), ctrl.get)
router.patch('/:id', validate({ params: idParam, body: mediaUpdateBody }), ctrl.update)
router.delete('/:id', validate({ params: idParam }), ctrl.remove)
export default router
