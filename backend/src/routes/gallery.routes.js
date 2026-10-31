import { createCrudRouter } from './crudRouter.js'
import controller from '../controllers/gallery.controller.js'
import { gallerySchemas } from '../validators/gallery.validator.js'

export default createCrudRouter({ controller, schemas: gallerySchemas })
