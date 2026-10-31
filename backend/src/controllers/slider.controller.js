import { createCrudController } from './crud.controller.js'
import { sliderService } from '../services/slider.service.js'

export default createCrudController(sliderService)
