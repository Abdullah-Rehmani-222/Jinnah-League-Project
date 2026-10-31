import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { pinoHttp } from 'pino-http'
import { randomUUID } from 'node:crypto'
import { env } from './config/environment.js'
import { logger } from './utils/logger.js'
import { apiLimiter } from './middleware/rateLimiters.js'
import { originCheck } from './middleware/csrf.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { getStorage } from './utils/storage/index.js'
import routes from './routes/index.js'

const app = express()

app.set('trust proxy', 1) // behind the host's reverse proxy: real client IPs for rate limiting
app.disable('x-powered-by')

app.use(pinoHttp({ logger, genReqId: (req) => req.headers['x-request-id'] || randomUUID(), autoLogging: { ignore: (req) => req.url === '/api/health' } }))
app.use(helmet())

// Locally stored uploads (development). With STORAGE_DRIVER=s3 files are served by the bucket/CDN instead.
if (env.STORAGE_DRIVER === 'local') {
  const storage = await getStorage()
  app.use('/uploads', express.static(storage.root, {
    index: false,
    dotfiles: 'ignore',
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'), // allow <img> from the website origin
  }))
}

app.use(cors({
  origin(origin, cb) {
    if (!origin || env.allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error('Origin not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  maxAge: 600,
}))
app.use(apiLimiter)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(originCheck)

app.use('/api', routes)
app.use(notFound)
app.use(errorHandler)

export default app
