import { createCrudController } from './crud.controller.js'
import { socialService } from '../services/social.service.js'

export default createCrudController(socialService)
