import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'
import { ok } from '../utils/response.js'
import { buildMeta, paginationQuery } from '../utils/pagination.js'
import { slug } from '../validators/page.validator.js'
import * as pub from '../services/public.service.js'

/** Read-only, unauthenticated endpoints for the public website. They only ever return PUBLISHED content. */
const router = Router()
router.use((_req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60')
  next()
})

router.get('/hero-slides', async (_req, res) => ok(res, await pub.heroSlides()))
router.get('/sponsors', async (_req, res) => ok(res, await pub.sponsors()))
router.get('/social', async (_req, res) => ok(res, await pub.social()))
router.get('/settings', async (_req, res) => ok(res, await pub.settings()))
router.get('/press', validate({ query: z.object({ itemType: z.enum(['PRESS_COVERAGE', 'MEDIA_KIT']).optional() }) }), async (req, res) =>
  ok(res, await pub.press(req.valid.query)))
router.get('/gallery', validate({ query: z.object(paginationQuery) }), async (req, res) => {
  const { items, total } = await pub.gallery(req.valid.query)
  ok(res, items, undefined, buildMeta(req.valid.query, total))
})
router.get('/pages/:slug', validate({ params: z.object({ slug }) }), async (req, res) => ok(res, await pub.page(req.valid.params.slug)))
export default router
