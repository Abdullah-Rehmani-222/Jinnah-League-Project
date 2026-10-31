import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { getOverview } from '../services/dashboard.service.js'
import { ok } from '../utils/response.js'

const router = Router()
router.get('/', authenticate, async (_req, res) => ok(res, await getOverview()))
export default router
