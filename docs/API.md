# Jinnah League API

Base URL (local): `http://localhost:5000/api` · Express 5 · Prisma 7 · PostgreSQL (Neon)

## Conventions

Success: `{ "success": true, "message": "...", "data": {...}, "meta": {...} }` (`meta` only on paginated lists:
`{ page, limit, total, totalPages }`).
Error: `{ "success": false, "message": "...", "errors": [{ "location", "field", "message" }] }`.

| Status | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | Malformed JSON |
| 401 | Not signed in / session expired |
| 403 | Wrong role, missing/invalid CSRF token, disabled account, disallowed Origin |
| 404 | Not found |
| 409 | Conflict: duplicate slug/name/email/platform, or content still referenced (e.g. media in use) |
| 413 | Request or upload too large |
| 422 | Validation failed (`errors` lists each field) |
| 429 | Rate limited |
| 500 | Unexpected error (details are logged, never returned) |

List endpoints accept `page` (default 1), `limit` (default 20, max 100), `q` (search) and `status` where relevant.
Content `status` is `DRAFT | PUBLISHED | ARCHIVED`; only `PUBLISHED` content appears on the public site.

## Authentication flow

1. `POST /auth/login` `{ email, password }` → sets the **HTTP-only** `jl_sid` cookie and returns `{ user, csrfToken }`.
2. The CMS keeps `csrfToken` in memory and sends it as the `X-CSRF-Token` header on every `POST/PUT/PATCH/DELETE`.
   After a page reload call `GET /auth/me` to get the token again.
3. Frontend requests must use `credentials: 'include'` (fetch) / `withCredentials: true` (axios).
4. Sessions: 12 h idle timeout (extended while active), 7 day absolute limit. Both are checked on the server.
   Changing email or password revokes **all** sessions and issues a new one for the current device.

Passwords: Argon2id. Session tokens are random, stored only as an HMAC hash. No public registration — create the
first admin with `npm run seed`.

Roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`. Editors can manage content but cannot change website settings.

## Public endpoints (no login)

| Method | Path | Notes |
|---|---|---|
| GET | `/public/hero-slides` | Published slides with image |
| GET | `/public/gallery` | Paginated |
| GET | `/public/sponsors` | Published tiers with logo |
| GET | `/public/press?itemType=` | `PRESS_COVERAGE` or `MEDIA_KIT` |
| GET | `/public/social` | Published links |
| GET | `/public/settings` | Flat key → value (logo/favicon as URLs) |
| GET | `/public/pages/:slug` | Published page + published sections (`home`, `about`, `legacy`, `jl26`, ...) |
| POST | `/contact` | Contact form. Rate limited (5/hour/IP), honeypot field `website` must stay empty |

## Admin endpoints (session cookie + CSRF header)

| Module | Endpoints |
|---|---|
| Auth | `POST /auth/login` · `POST /auth/logout` · `GET /auth/me` |
| Admin account | `GET /users/me` · `PATCH /users/me` `{ name?, email?, currentPassword?, newPassword?, confirmPassword? }` (email/password changes need `currentPassword`; empty strings are ignored) |
| Dashboard | `GET /dashboard` — real counts + 5 latest messages |
| Pages | `GET/POST /pages` · `GET/PATCH/DELETE /pages/:id` |
| Page sections | `GET/POST /pages/:id/sections` · `PATCH /pages/:id/sections/reorder` `{ ids }` · `PATCH/DELETE /pages/:id/sections/:sectionId` |
| Legacy (JL'24) | `GET/PATCH /legacy` · same `/sections` routes (stored as the `legacy` page) |
| JL'26 | `GET/PATCH /jl26` · same `/sections` routes (stored as the `jl26` page) |
| Media & Press | `/press` — list, create, `GET/PATCH/DELETE /:id`, `PATCH /reorder`; filter `?itemType=` |
| Sponsors | `/sponsors` — same shape (`name`, `description`, `benefits[]`, `logoMediaId`) |
| Gallery | `/gallery` — same shape (`mediaAssetId`, `title`, `description`) |
| Social Networks | `/social` — same shape (`platform`, `url`; one link per platform) |
| Hero & Sliders | `/sliders` — same shape (`title`, `subtitle`, `description`, `mediaAssetId`, `buttonText`, `buttonUrl`) |
| Website Settings | `GET /settings` · `PUT /settings` `{ settings: { site_name, tagline, contact_*, footer_text, copyright_text, default_meta_*, logo, favicon } }` (ADMIN+; unknown keys rejected; `logo`/`favicon` take a media id) |
| Media Library | `GET /media?q=&fileType=` · `POST /media` (multipart: `file`, optional `altText`, `fileType`) · `GET/PATCH/DELETE /media/:id` |
| Contact Messages | `GET /contact?q=&status=` · `GET /contact/:id` · `PATCH /contact/:id/status` `{ status: UNREAD\|READ\|RESOLVED }` · `DELETE /contact/:id` |

Every CRUD module above (press, sponsors, gallery, social, sliders) exposes:
`GET /` · `POST /` · `PATCH /reorder` `{ ids: [...] }` · `GET /:id` · `PATCH /:id` · `DELETE /:id`.

### Media rules

Allowed: JPG, PNG, GIF, WebP, AVIF, ICO, PDF. The extension, the declared MIME type **and** the file's magic bytes
must agree; SVG, executables, scripts and archives are rejected. Max `MAX_UPLOAD_MB` (default 10). Stored names are
random UUIDs. A file still used by a slide, gallery item, sponsor tier, press item or setting cannot be deleted (409).

## Environment variables

See `backend/.env.example`. Required: `DATABASE_URL` (Neon pooled), `DIRECT_URL` (Neon direct, migrations only),
`SESSION_SECRET` (≥ 32 chars), `FRONTEND_URL`, `NODE_ENV`, `PORT`.

## Commands

```bash
npm run dev                  # API with auto-reload
npm run build                # prisma generate
npm run prisma:migrate:deploy
npm run seed                 # first admin (ADMIN_EMAIL/ADMIN_PASSWORD) + system pages
npm test                     # needs TEST_DATABASE_URL pointing at a LOCAL disposable database
```

## Deployment checklist (Render / Railway / Fly.io)

1. Build: `npm ci && npm run build` · Start: `npm start` · set `NODE_ENV=production` and all required variables.
2. Once per environment: `npx prisma migrate deploy`, then `npm run seed` with `ADMIN_*` set.
3. `FRONTEND_URL` = exact origin of the website, e.g. `https://abdullah-rehmani-222.github.io` (no path).
4. **Cookies across sites:** github.io and an onrender.com API are different sites. `COOKIE_SAME_SITE=none` makes it work in
   Chrome, but Safari and Firefox may block the cookie, which would break admin login there. The reliable fix is a
   custom domain: website on `www.yourdomain`, API on `api.yourdomain`, `COOKIE_SAME_SITE=lax`.
5. File storage on a host's disk is lost on redeploy — set `STORAGE_DRIVER=s3` (e.g. Cloudflare R2) and the `S3_*`
   variables. The S3 driver is not covered by automated tests; test it with a real bucket first.
