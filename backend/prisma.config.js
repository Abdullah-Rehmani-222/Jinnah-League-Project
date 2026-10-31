import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Prisma CLI (migrate / studio / db pull) must use Neon's DIRECT (non-pooled) connection.
// The running API uses the POOLED connection (DATABASE_URL) through the pg driver adapter,
// see src/config/prisma.js.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DIRECT_URL') },
})
