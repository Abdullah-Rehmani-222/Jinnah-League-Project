import { Router } from 'express'
import { prisma } from '../config/database.js'
import { ok } from '../utils/response.js'
import { ApiError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'

const router = Router()
router.get('/', (_req, res) => ok(res, { status: 'ok', uptime: Math.round(process.uptime()) }))
router.get('/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (err) {
    logger.error({ err }, 'Database health check failed')
    throw new ApiError(503, 'Database unavailable.')
  }
  ok(res, { database: 'connected' })
})
export default router
