// Creates the first administrator and the system pages. Safe to re-run: never overwrites existing data.
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' ADMIN_NAME='Your Name' npm run seed
import { prisma } from '../src/config/database.js'
import { hashPassword } from '../src/utils/password.js'
import { SYSTEM_PAGES } from '../src/services/page.service.js'

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Administrator' } = process.env

if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  if (ADMIN_PASSWORD.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.')
  const email = ADMIN_EMAIL.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) console.log(`Admin ${email} already exists — left unchanged.`)
  else {
    await prisma.user.create({ data: { email, name: ADMIN_NAME, passwordHash: await hashPassword(ADMIN_PASSWORD), role: 'SUPER_ADMIN' } })
    console.log(`Created super admin ${email}.`)
  }
} else console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation.')

for (const [slug, title] of Object.entries(SYSTEM_PAGES)) {
  await prisma.page.upsert({ where: { slug }, update: {}, create: { slug, title } })
}
console.log(`System pages ensured: ${Object.keys(SYSTEM_PAGES).join(', ')}`)
await prisma.$disconnect()
