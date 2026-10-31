import 'dotenv/config'
import { z } from 'zod'

const int = (def) => z.coerce.number().int().positive().default(def)

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: int(5000),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

    // Neon POOLED connection string (runtime). DIRECT_URL is read only by prisma.config.js.
    DATABASE_URL: z.string().min(1),

    // Allowed browser origin(s) for CORS, comma-separated. Origin only (no path / trailing slash).
    FRONTEND_URL: z.string().default('http://localhost:5173'),
    // Public base URL of this API (used to build file URLs for the local storage driver).
    API_PUBLIC_URL: z.string().optional(),

    // Sessions & cookies
    SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    SESSION_IDLE_HOURS: int(12),
    SESSION_ABSOLUTE_DAYS: int(7),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    COOKIE_DOMAIN: z.string().optional(),

    // Rate limits (requests per window)
    API_RATE_LIMIT_MAX: int(300),
    LOGIN_RATE_LIMIT_MAX: int(10),
    CONTACT_RATE_LIMIT_MAX: int(5),

    // File storage
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    UPLOAD_DIR: z.string().default('uploads'),
    MAX_UPLOAD_MB: int(10),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().default('auto'),
    S3_ENDPOINT: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_BASE_URL: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.STORAGE_DRIVER === 's3') {
      for (const k of ['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_PUBLIC_BASE_URL']) {
        if (!v[k]) ctx.addIssue({ code: 'custom', path: [k], message: `${k} is required when STORAGE_DRIVER=s3` })
      }
    }
  })

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment configuration:')
  for (const i of parsed.error.issues) console.error(` - ${i.path.join('.')}: ${i.message}`)
  process.exit(1)
}

const v = parsed.data
const isProduction = v.NODE_ENV === 'production'

export const env = {
  ...v,
  isProduction,
  isTest: v.NODE_ENV === 'test',
  allowedOrigins: v.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean),
  apiPublicUrl: (v.API_PUBLIC_URL || `http://localhost:${v.PORT}`).replace(/\/+$/, ''),
  maxUploadBytes: v.MAX_UPLOAD_MB * 1024 * 1024,
  // SameSite=None requires Secure; browsers reject the cookie otherwise.
  cookieSecure: isProduction || v.COOKIE_SAME_SITE === 'none',
}
