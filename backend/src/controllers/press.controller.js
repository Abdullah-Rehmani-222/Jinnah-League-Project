import { createCrudController } from './crud.controller.js'
import { pressService } from '../services/press.service.js'

export default createCrudController(pressService)
