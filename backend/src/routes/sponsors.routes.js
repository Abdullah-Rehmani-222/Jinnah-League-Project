import { createCrudRouter } from './crudRouter.js'
import controller from '../controllers/sponsor.controller.js'
import { sponsorSchemas } from '../validators/sponsor.validator.js'

export default createCrudRouter({ controller, schemas: sponsorSchemas })
