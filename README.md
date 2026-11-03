# Jinnah League

Jinnah League website + custom CMS.

```
Jinnah-League-Project/
├── frontend/   React + Vite + Tailwind app (public site and, later, the CMS) → GitHub Pages
├── backend/    Node.js + Express REST API, Prisma ORM                      → separate Node host
└── docs/       Architecture notes (see docs/DATABASE.md)
```

The two apps are independent: each has its own `package.json`, `node_modules` and `.env`.

## Frontend (GitHub Pages)

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173/Jinnah-League-Project/
npm run build
npm run deploy     # builds, then publishes dist/ to the gh-pages branch
```

Live URL: https://abdullah-rehmani-222.github.io/Jinnah-League-Project/

GitHub Pages notes: the app uses `HashRouter` (URLs look like `/#/about`) so deep links and refreshes work on static
hosting, and `vite.config.js` sets `base: '/Jinnah-League-Project/'`. If you later move to a custom domain at the root,
change `base` to `'/'`. In the repo settings, Pages must serve the **gh-pages** branch, root folder.

## Backend

GitHub Pages only serves static files, so the API must be hosted elsewhere (Render, Railway, Fly.io, ...).

```bash
cd backend
npm ci
cp .env.example .env     # fill in the Neon connection strings
npm run build            # prisma generate
npx prisma migrate deploy
npm run seed             # first admin (ADMIN_EMAIL / ADMIN_PASSWORD) + system pages
npm run dev              # http://localhost:5000/api/health
npm test                 # TEST_DATABASE_URL must be a LOCAL disposable database
```

API reference, auth flow and deployment checklist: [docs/API.md](docs/API.md)  
Database design, ERD and migration commands: [docs/DATABASE.md](docs/DATABASE.md)


## Production deployment checklist

1. **Database (Neon):** from `backend/`, with `.env` filled in: `npx prisma migrate deploy`, then `npm run seed`.
2. **API (Render / Railway / Fly.io):** `render.yaml` is a ready blueprint. Root directory `backend`, build `npm ci && npm run build`,
   start `npm start`, Node >= 22.18. Environment variables: see `backend/.env.example`.
   Required: `NODE_ENV=production`, `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `FRONTEND_URL`, `API_PUBLIC_URL`,
   `COOKIE_SAME_SITE`, and `STORAGE_DRIVER=s3` with the `S3_*` variables (local disk is wiped on every redeploy).
   The API prints `[config] WARNING` lines at start-up when it detects the usual mistakes.
3. **Cookies:** the CMS login is a cookie. Website and API on one site (`www.x.com` + `api.x.com`, `COOKIE_SAME_SITE=lax`,
   `COOKIE_DOMAIN=.x.com`) works in every browser. github.io + onrender.com is cross-site: `COOKIE_SAME_SITE=none` works in
   Chrome/Edge only; Safari and Firefox block it.
4. **Website (GitHub Pages):** create `frontend/.env.production` containing `VITE_API_URL=https://<your-api>/api`, then
   `npm run deploy`. The build now fails if the API URL is missing or points to localhost.
   `npm run build:local` builds a local preview instead.
5. Open the live site, DevTools > Network: requests must go to your API host, and `/api/auth/login` must set the `jl_sid` cookie.
6. Never commit `.env` files. Rotate any credential that has been shared (Neon password, `SESSION_SECRET`).

## Running everything together (frontend + API + database)

```bash
# 1. Database + API (terminal 1)
cd backend
npm ci
cp .env.example .env              # fill DATABASE_URL / DIRECT_URL (Neon), SESSION_SECRET, FRONTEND_URL
npx prisma migrate deploy         # creates the tables in Neon (once per environment)
npm run seed                      # ADMIN_EMAIL / ADMIN_PASSWORD set -> first admin + system pages
npm run dev                       # http://localhost:5000/api/health/db  ->  "database": "connected"

# 2. Website + CMS (terminal 2)
cd frontend
npm ci
cp .env.example .env              # VITE_API_URL=http://localhost:5000/api
npm run dev                       # site: http://localhost:5173/Jinnah-League-Project/
                                  # CMS:  http://localhost:5173/Jinnah-League-Project/#/admin
```

Notes
- `VITE_API_URL` belongs in **frontend/.env** (Vite only reads it there) and is baked in at build time, so set it before
  `npm run deploy`. `FRONTEND_URL` in backend/.env must list every browser origin (comma separated), e.g.
  `http://localhost:5173,https://abdullah-rehmani-222.github.io`.
- The public site shows built-in default content until something is **published** in the CMS. System pages (home, about,
  legacy, jl26, ...) start as drafts: open *Pages*, then publish a page for its CMS sections to appear.
- Pages created in the CMS are served at `/#/<slug>`. The footer links to `/#/terms` and `/#/privacy`; create pages with
  those slugs in the CMS (until then they show a 404 page).
- Production cookies: GitHub Pages and the API host are different sites, so see the cookie note in docs/API.md.
