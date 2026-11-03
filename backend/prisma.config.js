import 'dotenv/config'
import { defineConfig } from 'prisma/config'

// Prisma CLI (migrate / studio / db pull) must use Neon's DIRECT (non-pooled) connection.
// The running API uses the POOLED connection (DATABASE_URL) through the pg driver adapter,
// see src/config/database.js.
//
// `prisma generate` (the build step on Render/Railway) never connects, so a missing DIRECT_URL must not
// break the build. Migrations still need it: `migrate deploy` fails loudly below if it is absent.
const url = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!url && process.argv.some((a) => a === 'migrate' || a === 'studio' || a === 'db'))
  throw new Error('DIRECT_URL (Neon direct connection) is required to run Prisma migrations.')

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: { path: 'prisma/migrations' },
    datasource: { url: url ?? '' },
})
