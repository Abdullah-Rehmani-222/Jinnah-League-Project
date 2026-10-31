import app from './app.js'
import { env } from './config/environment.js'
import { prisma } from './config/database.js'
import { logger } from './utils/logger.js'

const server = app.listen(env.PORT, () => logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Jinnah League API listening'))

const shutdown = (signal) => {
  logger.info({ signal }, 'Shutting down')
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
