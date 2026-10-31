import { createCrudRouter } from './crudRouter.js'
import controller from '../controllers/slider.controller.js'
import { sliderSchemas } from '../validators/slider.validator.js'

export default createCrudRouter({ controller, schemas: sliderSchemas })
