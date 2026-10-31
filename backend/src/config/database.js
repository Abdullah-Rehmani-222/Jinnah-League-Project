import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.ts'
import { env } from './environment.js'

// Runtime queries use Neon's pooled connection. Migrations use DIRECT_URL (prisma.config.js).
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const prisma = new PrismaClient({ adapter })
