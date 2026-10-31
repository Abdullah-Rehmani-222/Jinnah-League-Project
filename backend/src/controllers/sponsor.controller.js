import { createCrudController } from './crud.controller.js'
import { sponsorService } from '../services/sponsor.service.js'

export default createCrudController(sponsorService)
