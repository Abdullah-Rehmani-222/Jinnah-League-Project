import { createCrudRouter } from './crudRouter.js'
import controller from '../controllers/press.controller.js'
import { pressSchemas } from '../validators/press.validator.js'

export default createCrudRouter({ controller, schemas: pressSchemas })
