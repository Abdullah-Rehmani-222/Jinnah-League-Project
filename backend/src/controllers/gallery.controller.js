import { createCrudController } from './crud.controller.js'
import { galleryService } from '../services/gallery.service.js'

export default createCrudController(galleryService)
