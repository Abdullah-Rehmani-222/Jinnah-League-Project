import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/authenticate.js'
import { csrfProtect } from '../middleware/csrf.js'
import { idParam, reorderBody } from '../validators/common.validator.js'

/** Standard admin REST routes: list, get, create, update, delete and reorder. Everything requires a session + CSRF token. */
export function createCrudRouter({ controller, schemas }) {
  const router = Router()
  router.use(authenticate, csrfProtect)
  router.get('/', validate({ query: schemas.list }), controller.list)
  router.post('/', validate({ body: schemas.create }), controller.create)
  router.patch('/reorder', validate({ body: reorderBody }), controller.reorder)
  router.get('/:id', validate({ params: idParam }), controller.get)
  router.patch('/:id', validate({ params: idParam, body: schemas.update }), controller.update)
  router.delete('/:id', validate({ params: idParam }), controller.remove)
  return router
}
