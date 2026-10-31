import { createCrudRouter } from './crudRouter.js'
import controller from '../controllers/social.controller.js'
import { socialSchemas } from '../validators/social.validator.js'

export default createCrudRouter({ controller, schemas: socialSchemas })
