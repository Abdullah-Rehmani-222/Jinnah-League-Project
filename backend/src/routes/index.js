import { Router } from 'express'
import health from './health.routes.js'
import auth from './auth.routes.js'
import users from './users.routes.js'
import dashboard from './dashboard.routes.js'
import pages from './pages.routes.js'
import legacy from './legacy.routes.js'
import jl26 from './jl26.routes.js'
import press from './press.routes.js'
import sponsors from './sponsors.routes.js'
import gallery from './gallery.routes.js'
import social from './social.routes.js'
import sliders from './sliders.routes.js'
import settings from './settings.routes.js'
import media from './media.routes.js'
import contact from './contact.routes.js'
import publicRoutes from './public.routes.js'

const router = Router()
router.use('/health', health)
router.use('/public', publicRoutes)
router.use('/auth', auth)
router.use('/users', users)
router.use('/dashboard', dashboard)
router.use('/pages', pages)
router.use('/legacy', legacy)
router.use('/jl26', jl26)
router.use('/press', press)
router.use('/sponsors', sponsors)
router.use('/gallery', gallery)
router.use('/social', social)
router.use('/sliders', sliders)
router.use('/settings', settings)
router.use('/media', media)
router.use('/contact', contact)
export default router
